import { Request, Response } from 'express';
import Proposal from '../models/Proposal.js';
import Company from '../models/Company.js';
import { AuthRequest } from '../utils/auth.js';
import { generateProposalDraft } from '../services/aiProposalService.js';
import AuditLog from '../models/AuditLog.js';

export const createProposal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const company = await Company.findOne();
        const proposalData: any = { ...req.body };

        if (!proposalData.proposalNumber) {
            const year = new Date().getFullYear();
            const count = await Proposal.countDocuments();
            proposalData.proposalNumber = `PRP/${year}/${(count + 1).toString().padStart(3, '0')}`;
        }

        if (req.user) proposalData.createdBy = req.user._id;

        const proposal = new Proposal(proposalData);
        await proposal.save();
        res.status(201).json(proposal);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getProposals = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposals = await Proposal.find()
            .populate('clientId')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(proposals);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProposalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposal = await Proposal.findById(req.params.id).populate('clientId');
        if (!proposal) return res.status(404).json({ error: 'Proposal not found' }) as any;
        res.json(proposal);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProposal = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proposal) return res.status(404).json({ error: 'Proposal not found' }) as any;
        res.json(proposal);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProposal = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposal = await Proposal.findByIdAndDelete(req.params.id);
        if (!proposal) return res.status(404).json({ error: 'Proposal not found' }) as any;
        res.json({ message: 'Proposal deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const generateAIDraft = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prompt, clientId, clientName } = req.body;
        const userId = req.user?._id;

        if (!prompt || !userId) {
            return res.status(400).json({ error: 'Missing required fields' }) as any;
        }

        const { draft } = await generateProposalDraft({
            prompt,
            clientId,
            clientName,
            userId: userId.toString()
        });

        res.json({ success: true, draft });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const sendProposal = async (req: Request, res: Response): Promise<void> => {
    try {
        const proposal = await Proposal.findByIdAndUpdate(
            req.params.id,
            { status: 'sent', sentAt: new Date(), isLocked: true },
            { new: true }
        );

        if (!proposal) {
            res.status(404).json({ error: 'Proposal not found' });
            return;
        }

        res.json(proposal);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
