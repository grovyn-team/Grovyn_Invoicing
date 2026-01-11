import { Request, Response } from 'express';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    const existingPayments = await Payment.find({ invoiceId: invoice._id });
    const paidAmount = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (paidAmount + req.body.amount > invoice.total) {
      res.status(400).json({ error: 'Payment amount exceeds invoice total' });
      return;
    }
    
    const payment = new Payment(req.body);
    await payment.save();
    
    const newPaidAmount = paidAmount + payment.amount;
    let newStatus = invoice.status;
    
    if (newPaidAmount >= invoice.total) {
      newStatus = 'paid';
      invoice.paidDate = new Date();
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }
    
    await Invoice.findByIdAndUpdate(invoice._id, { status: newStatus });
    
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.query;
    const query: any = {};
    if (invoiceId) query.invoiceId = invoiceId;
    
    const payments = await Payment.find(query).populate('invoiceId').populate('createdBy').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    
    await Payment.findByIdAndDelete(req.params.id);
    
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      const remainingPayments = await Payment.find({ invoiceId: invoice._id });
      const paidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
      
      let newStatus = 'sent';
      if (paidAmount >= invoice.total) {
        newStatus = 'paid';
      } else if (paidAmount > 0) {
        newStatus = 'partially_paid';
      } else {
        newStatus = invoice.status === 'paid' ? 'sent' : invoice.status;
      }
      
      await Invoice.findByIdAndUpdate(invoice._id, { status: newStatus });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
