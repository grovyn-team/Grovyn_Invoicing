import express from 'express';
import {
  createPayment,
  getPayments,
  deletePayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', createPayment);
router.get('/', getPayments);
router.delete('/:id', deletePayment);

export default router;
