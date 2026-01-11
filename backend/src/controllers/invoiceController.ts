import { Request, Response } from 'express';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { numberToWords } from '../utils/numberToWords.js';
import Company from '../models/Company.js';
import { AuthRequest } from '../utils/auth.js';

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne();
    
    // Filter out empty items and validate
    const validItems = (req.body.items || []).filter((item: any) => {
      return item && item.name && item.description && item.name.trim() !== '' && item.description.trim() !== '';
    });

    if (validItems.length === 0) {
      res.status(400).json({ error: 'Invoice must have at least one item with name and description' });
      return;
    }

    // Calculate subtotal from items
    const subtotal = validItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    
    // Calculate discountTotal from discountPercentage if provided
    const discountPercentage = req.body.discountPercentage;
    const discountTotal = discountPercentage 
      ? (subtotal * discountPercentage / 100)
      : (req.body.discountTotal || 0);
    
    // Ensure taxDetails structure (clone to avoid mutation)
    const taxDetails = req.body.taxDetails ? { ...req.body.taxDetails } : { isExportOfServices: false };
    
    // Prepare invoice data
    const invoiceData: any = {
      ...req.body,
      items: validItems,
      subtotal,
      exchangeRate: req.body.exchangeRate || 1,
      status: req.body.status || 'draft',
      discountPercentage,
      discountTotal,
      taxDetails,
    };

    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await generateInvoiceNumber(
        invoiceData.invoiceType || 'Tax Invoice',
        company?.invoiceNumberPrefix || 'GROVYN',
        company?.invoiceNumberFormat || '{PREFIX}/{YEAR}/{TYPE}/{NUMBER}'
      );
    }

    // Set createdBy from authenticated user
    if (req.user) {
      invoiceData.createdBy = req.user._id;
    }

    // Ensure dates are Date objects
    if (invoiceData.invoiceDate) {
      invoiceData.invoiceDate = new Date(invoiceData.invoiceDate);
    }
    if (invoiceData.dueDate) {
      invoiceData.dueDate = new Date(invoiceData.dueDate);
    }

    // Calculate taxAmount and total (similar to pre-save hook logic)
    const subtotalAfterDiscount = subtotal - invoiceData.discountTotal;
    let taxAmount = 0;
    
    // Use taxProtocol if available, otherwise fall back to isExportOfServices
    const taxProtocol = taxDetails.taxProtocol;
    const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && taxDetails.isExportOfServices);
    const isNoTax = taxProtocol === 'NONE';
    
    if (isNoTax || isExport || invoiceData.clientCountry !== 'India') {
      taxDetails.cgst = 0;
      taxDetails.sgst = 0;
      taxDetails.igst = 0;
      taxAmount = 0;
    } else {
      // Calculate GST (taxProtocol === 'GST' or undefined/legacy)
      const gstRate = validItems[0]?.taxRate || 18;
      if (invoiceData.clientState === taxDetails.placeOfSupply || !taxDetails.placeOfSupply) {
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

    invoiceData.taxDetails = taxDetails;
    invoiceData.taxAmount = taxAmount;
    invoiceData.total = subtotal - invoiceData.discountTotal + taxAmount;

    // Calculate amount in words
    invoiceData.amountInWords = numberToWords(invoiceData.total, invoiceData.currency || 'INR');

    // Create invoice
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
      return;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      res.status(400).json({ 
        error: 'Invoice number already exists' 
      });
      return;
    }
    
    // Generic error
    res.status(400).json({ 
      error: error.message || 'Failed to create invoice' 
    });
  }
};

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, clientId, invoiceType } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (invoiceType) query.invoiceType = invoiceType;
    
    const invoices = await Invoice.find(query)
      .populate('clientId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    const invoicesWithPayments = await Promise.all(
      invoices.map(async (invoice) => {
        const payments = await Payment.find({ invoiceId: invoice._id });
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = invoice.total - paidAmount;
        
        return {
          ...invoice.toObject(),
          paidAmount,
          outstanding,
        };
      })
    );
    
    res.json(invoicesWithPayments);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('clientId');
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    const payments = await Payment.find({ invoiceId: invoice._id }).populate('createdBy');
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = invoice.total - paidAmount;
    
    res.json({
      ...invoice.toObject(),
      payments,
      paidAmount,
      outstanding,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    if (invoice.isLocked && invoice.status !== 'draft') {
      res.status(400).json({ error: 'Invoice is locked and cannot be edited' });
      return;
    }

    // Handle date conversions
    if (req.body.invoiceDate) {
      invoice.invoiceDate = new Date(req.body.invoiceDate);
    }
    if (req.body.dueDate) {
      invoice.dueDate = new Date(req.body.dueDate);
    }

    // Update invoice fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'invoiceDate' && key !== 'dueDate' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        (invoice as any)[key] = req.body[key];
      }
    });

    // Validate and recalculate if items are provided
    if (req.body.items && req.body.items.length > 0) {
      // Filter out empty items
      const validItems = req.body.items.filter((item: any) => {
        return item.name && item.description && item.name.trim() !== '' && item.description.trim() !== '';
      });

      if (validItems.length === 0) {
        res.status(400).json({ error: 'Invoice items must have name and description' });
        return;
      }

      invoice.items = validItems;
      invoice.subtotal = validItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }

    // Recalculate discountTotal from discountPercentage if provided
    if (req.body.discountPercentage !== undefined && req.body.discountPercentage !== null) {
      invoice.discountPercentage = req.body.discountPercentage;
      invoice.discountTotal = invoice.subtotal * invoice.discountPercentage / 100;
    }

    // Recalculate taxAmount and total (similar to pre-save hook logic)
    const subtotalAfterDiscount = invoice.subtotal - invoice.discountTotal;
    let taxAmount = 0;
    
    // Use taxProtocol if available, otherwise fall back to isExportOfServices
    const taxProtocol = invoice.taxDetails.taxProtocol;
    const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && invoice.taxDetails.isExportOfServices);
    const isNoTax = taxProtocol === 'NONE';
    
    if (isNoTax || isExport || invoice.clientCountry !== 'India') {
      invoice.taxDetails.cgst = 0;
      invoice.taxDetails.sgst = 0;
      invoice.taxDetails.igst = 0;
      taxAmount = 0;
    } else {
      // Calculate GST (taxProtocol === 'GST' or undefined/legacy)
      const gstRate = invoice.items[0]?.taxRate || 18;
      if (invoice.clientState === invoice.taxDetails.placeOfSupply || !invoice.taxDetails.placeOfSupply) {
        invoice.taxDetails.cgst = (subtotalAfterDiscount * gstRate) / 200;
        invoice.taxDetails.sgst = (subtotalAfterDiscount * gstRate) / 200;
        invoice.taxDetails.igst = 0;
      } else {
        invoice.taxDetails.igst = (subtotalAfterDiscount * gstRate) / 100;
        invoice.taxDetails.cgst = 0;
        invoice.taxDetails.sgst = 0;
      }
      taxAmount = (invoice.taxDetails.cgst || 0) + (invoice.taxDetails.sgst || 0) + (invoice.taxDetails.igst || 0);
    }

    invoice.taxAmount = taxAmount;
    invoice.total = invoice.subtotal - invoice.discountTotal + taxAmount;
    invoice.amountInWords = numberToWords(invoice.total, invoice.currency || 'INR');
    
    // Save invoice
    await invoice.save();
    
    res.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
      return;
    }
    
    // Generic error
    res.status(400).json({ 
      error: error.message || 'Failed to update invoice' 
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    if (invoice.status === 'sent' || invoice.status === 'paid') {
      res.status(400).json({ error: 'Cannot delete sent or paid invoices. Use credit note instead.' });
      return;
    }
    
    await Payment.deleteMany({ invoiceId: invoice._id });
    await Invoice.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'sent', sentDate: new Date(), isLocked: true },
      { new: true }
    );
    
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find();
    const payments = await Payment.find();
    
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingInvoices = invoices.filter(inv => 
      inv.status === 'sent' || inv.status === 'partially_paid'
    );
    
    let pendingPayment = 0;
    for (const inv of pendingInvoices) {
      const paid = payments
        .filter(p => p.invoiceId.toString() === inv._id.toString())
        .reduce((sum, p) => sum + p.amount, 0);
      pendingPayment += inv.total - paid;
    }
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const activeClients = await Invoice.distinct('clientId').then(ids => ids.length);
    
    res.json({
      totalCollected,
      pendingPayment,
      paidInvoices,
      activeClients,
      totalInvoices: invoices.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
