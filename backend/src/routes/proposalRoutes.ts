import express from 'express';
import {
    createProposal,
    getProposals,
    getProposalById,
    updateProposal,
    deleteProposal,
    generateAIDraft,
    sendProposal,
} from '../controllers/proposalController.js';
import { authenticate } from '../utils/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/ai/generate', generateAIDraft);
router.post('/', createProposal);
router.get('/', getProposals);
router.get('/:id', getProposalById);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);
router.post('/:id/send', sendProposal);

export default router;
