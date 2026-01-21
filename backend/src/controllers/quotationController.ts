import { Request, Response } from 'express';
import Quotation from '../models/Quotation.js';
import { generateQuotationNumber } from '../utils/quotationNumber.js';
import { numberToWords } from '../utils/numberToWords.js';
import Company from '../models/Company.js';
import { AuthRequest } from '../utils/auth.js';

export const createQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne();
    
    const validItems = (req.body.items || []).filter((item: any) => {
      return item && item.name && item.description && item.name.trim() !== '' && item.description.trim() !== '';
    });

    if (validItems.length === 0) {
      res.status(400).json({ error: 'Quotation must have at least one item with name and description' });
      return;
    }

    const subtotal = validItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    
    const discountPercentage = req.body.discountPercentage;
    const discountTotal = discountPercentage 
      ? (subtotal * discountPercentage / 100)
      : (req.body.discountTotal || 0);
    
    const taxDetails = req.body.taxDetails ? { ...req.body.taxDetails } : { isExportOfServices: false };
    
    const quotationData: any = {
      ...req.body,
      items: validItems,
      subtotal,
      exchangeRate: req.body.exchangeRate || 1,
      status: req.body.status || 'draft',
      discountPercentage,
      discountTotal,
      taxDetails,
      validityPeriod: req.body.validityPeriod || 30,
    };

    if (!quotationData.quotationNumber) {
      const format = (company?.invoiceNumberFormat || '{PREFIX}/{YEAR}/{TYPE}/{NUMBER}').replace('{TYPE}', 'QUO');
      quotationData.quotationNumber = await generateQuotationNumber(
        company?.invoiceNumberPrefix || 'GROVYN',
        format
      );
    }

    if (req.user) {
      quotationData.createdBy = req.user._id;
    }

    if (quotationData.quotationDate) {
      quotationData.quotationDate = new Date(quotationData.quotationDate);
    }
    if (quotationData.validUntil) {
      quotationData.validUntil = new Date(quotationData.validUntil);
    }

    const subtotalAfterDiscount = subtotal - quotationData.discountTotal;
    let taxAmount = 0;
    
    const taxProtocol = taxDetails.taxProtocol;
    const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && taxDetails.isExportOfServices);
    const isNoTax = taxProtocol === 'NONE';
    
    if (isNoTax || isExport || quotationData.clientCountry !== 'India') {
      taxDetails.cgst = 0;
      taxDetails.sgst = 0;
      taxDetails.igst = 0;
      taxAmount = 0;
    } else {
      const gstRate = validItems[0]?.taxRate || 18;
      if (quotationData.clientState === taxDetails.placeOfSupply || !taxDetails.placeOfSupply) {
        taxDetails.cgst = (subtotalAfterDiscount * gstRate) / 200;
        taxDetails.sgst = (subtotalAfterDiscount * gstRate) / 200;
        taxDetails.igst = 0;
      } else {
        taxDetails.igst = (subtotalAfterDiscount * gstRate) / 100;
        taxDetails.cgst = 0;
        taxDetails.sgst = 0;
      }
      taxAmount = (taxDetails.cgst || 0) + (taxDetails.sgst || 0) + (taxDetails.igst || 0);
    }

    quotationData.taxDetails = taxDetails;
    quotationData.taxAmount = taxAmount;
    quotationData.total = subtotal - quotationData.discountTotal + taxAmount;

    quotationData.amountInWords = numberToWords(quotationData.total, quotationData.currency || 'INR');

    const quotation = new Quotation(quotationData);
    await quotation.save();

    res.status(201).json(quotation);
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    
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
        error: 'Quotation number already exists' 
      });
      return;
    }
    
    res.status(400).json({ 
      error: error.message || 'Failed to create quotation' 
    });
  }
};

export const getQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clientId } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    
    const quotations = await Quotation.find(query)
      .populate('clientId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuotationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('clientId');
    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    
    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    
    if (quotation.isLocked && quotation.status !== 'draft') {
      res.status(400).json({ error: 'Quotation is locked and cannot be edited' });
      return;
    }

    if (req.body.quotationDate) {
      quotation.quotationDate = new Date(req.body.quotationDate);
    }
    if (req.body.validUntil) {
      quotation.validUntil = new Date(req.body.validUntil);
    }

    Object.keys(req.body).forEach((key) => {
      if (key !== 'quotationDate' && key !== 'validUntil' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        (quotation as any)[key] = req.body[key];
      }
    });

    if (req.body.items && req.body.items.length > 0) {
      const validItems = req.body.items.filter((item: any) => {
        return item.name && item.description && item.name.trim() !== '' && item.description.trim() !== '';
      });

      if (validItems.length === 0) {
        res.status(400).json({ error: 'Quotation items must have name and description' });
        return;
      }

      quotation.items = validItems;
      quotation.subtotal = validItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }

    if (req.body.discountPercentage !== undefined && req.body.discountPercentage !== null) {
      quotation.discountPercentage = req.body.discountPercentage;
      quotation.discountTotal = quotation.subtotal * (quotation.discountPercentage || 0) / 100;
    }

    const subtotalAfterDiscount = quotation.subtotal - quotation.discountTotal;
    let taxAmount = 0;
    
    const taxProtocol = quotation.taxDetails.taxProtocol;
    const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && quotation.taxDetails.isExportOfServices);
    const isNoTax = taxProtocol === 'NONE';
    
    if (isNoTax || isExport || quotation.clientCountry !== 'India') {
      quotation.taxDetails.cgst = 0;
      quotation.taxDetails.sgst = 0;
      quotation.taxDetails.igst = 0;
      taxAmount = 0;
    } else {
      const gstRate = quotation.items[0]?.taxRate || 18;
      if (quotation.clientState === quotation.taxDetails.placeOfSupply || !quotation.taxDetails.placeOfSupply) {
        quotation.taxDetails.cgst = (subtotalAfterDiscount * gstRate) / 200;
        quotation.taxDetails.sgst = (subtotalAfterDiscount * gstRate) / 200;
        quotation.taxDetails.igst = 0;
      } else {
        quotation.taxDetails.igst = (subtotalAfterDiscount * gstRate) / 100;
        quotation.taxDetails.cgst = 0;
        quotation.taxDetails.sgst = 0;
      }
      taxAmount = (quotation.taxDetails.cgst || 0) + (quotation.taxDetails.sgst || 0) + (quotation.taxDetails.igst || 0);
    }

    quotation.taxAmount = taxAmount;
    quotation.total = quotation.subtotal - quotation.discountTotal + taxAmount;
    quotation.amountInWords = numberToWords(quotation.total, quotation.currency || 'INR');
    
    await quotation.save();
    
    res.json(quotation);
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
      return;
    }
    
    res.status(400).json({ 
      error: error.message || 'Failed to update quotation' 
    });
  }
};

export const deleteQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    
    if (quotation.status === 'accepted' || quotation.status === 'converted') {
      res.status(400).json({ error: 'Cannot delete accepted or converted quotations' });
      return;
    }
    
    await Quotation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: 'sent', sentDate: new Date(), isLocked: true },
      { new: true }
    );
    
    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    
    res.json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
