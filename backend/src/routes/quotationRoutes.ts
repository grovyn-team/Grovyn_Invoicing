import express from 'express';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  sendQuotation,
} from '../controllers/quotationController.js';
import { generateAIDraft } from '../controllers/aiQuotationController.js';
import { authenticate } from '../utils/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/ai/generate', generateAIDraft);

router.post('/', createQuotation);
router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);
router.post('/:id/send', sendQuotation);

export default router;
