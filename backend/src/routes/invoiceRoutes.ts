import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  getDashboardStats,
} from '../controllers/invoiceController.js';
import { getAnalytics } from '../controllers/analyticsController.js';
import { generateAIDraft } from '../controllers/aiInvoiceController.js';
import { authenticate } from '../utils/auth.js';

const router = express.Router();

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.use(authenticate);
router.post('/ai/generate', generateAIDraft);

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/send', sendInvoice);

export default router;
