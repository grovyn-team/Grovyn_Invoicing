import { Request, Response } from 'express';
import OfferLetter from '../models/OfferLetter.js';
import { generateOfferLetterNumber } from '../utils/offerLetterNumber.js';
import Company from '../models/Company.js';
import { AuthRequest } from '../utils/auth.js';

export const createOfferLetter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne();
    
    const offerData: any = {
      ...req.body,
      status: req.body.status || 'draft',
    };

    if (!offerData.offerNumber) {
      const format = (company?.invoiceNumberFormat || '{PREFIX}/{YEAR}/{TYPE}/{NUMBER}').replace('{TYPE}', 'OFF');
      offerData.offerNumber = await generateOfferLetterNumber(
        company?.invoiceNumberPrefix || 'GROVYN',
        format
      );
    }

    if (req.user) {
      offerData.createdBy = req.user._id;
    }

    if (offerData.offerDate) {
      offerData.offerDate = new Date(offerData.offerDate);
    }
    if (offerData.validUntil) {
      offerData.validUntil = new Date(offerData.validUntil);
    }
    if (offerData.startDate) {
      offerData.startDate = new Date(offerData.startDate);
    }
    if (offerData.acceptanceDeadline) {
      offerData.acceptanceDeadline = new Date(offerData.acceptanceDeadline);
    }

    const offerLetter = new OfferLetter(offerData);
    await offerLetter.save();

    res.status(201).json(offerLetter);
  } catch (error: any) {
    console.error('Error creating offer letter:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
      return;
    }
    
    if (error.code === 11000) {
      res.status(400).json({ 
        error: 'Offer letter number already exists' 
      });
      return;
    }
    
    res.status(400).json({ 
      error: error.message || 'Failed to create offer letter' 
    });
  }
};

export const getOfferLetters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, candidateEmail } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (candidateEmail) query.candidateEmail = candidateEmail;
    
    const offerLetters = await OfferLetter.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(offerLetters);
  } catch (error: any) {
    console.error('Error fetching offer letters:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOfferLetterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id);
    if (!offerLetter) {
      res.status(404).json({ error: 'Offer letter not found' });
      return;
    }
    
    res.json(offerLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOfferLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id);
    if (!offerLetter) {
      res.status(404).json({ error: 'Offer letter not found' });
      return;
    }
    
    if (offerLetter.isLocked && offerLetter.status !== 'draft') {
      res.status(400).json({ error: 'Offer letter is locked and cannot be edited' });
      return;
    }

    if (req.body.offerDate) {
      offerLetter.offerDate = new Date(req.body.offerDate);
    }
    if (req.body.validUntil) {
      offerLetter.validUntil = new Date(req.body.validUntil);
    }
    if (req.body.startDate) {
      offerLetter.startDate = new Date(req.body.startDate);
    }
    if (req.body.acceptanceDeadline) {
      offerLetter.acceptanceDeadline = new Date(req.body.acceptanceDeadline);
    }

    Object.keys(req.body).forEach((key) => {
      if (key !== 'offerDate' && key !== 'validUntil' && key !== 'startDate' && key !== 'acceptanceDeadline' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'createdBy') {
        (offerLetter as any)[key] = req.body[key];
      }
    });
    
    await offerLetter.save();
    
    res.json(offerLetter);
  } catch (error: any) {
    console.error('Error updating offer letter:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
      return;
    }
    
    res.status(400).json({ 
      error: error.message || 'Failed to update offer letter' 
    });
  }
};

export const deleteOfferLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id);
    if (!offerLetter) {
      res.status(404).json({ error: 'Offer letter not found' });
      return;
    }
    
    if (offerLetter.status === 'accepted' || offerLetter.status === 'sent') {
      res.status(400).json({ error: 'Cannot delete sent or accepted offer letters' });
      return;
    }
    
    await OfferLetter.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Offer letter deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendOfferLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const offerLetter = await OfferLetter.findByIdAndUpdate(
      req.params.id,
      { status: 'sent', sentDate: new Date(), isLocked: true },
      { new: true }
    );
    
    if (!offerLetter) {
      res.status(404).json({ error: 'Offer letter not found' });
      return;
    }
    
    res.json(offerLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
