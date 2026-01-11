import mongoose, { Schema, Document } from 'mongoose';

export type InvoiceType = 'Standard Invoice' | 'Proforma Invoice' | 'Tax Invoice' | 'Credit Note' | 'Debit Note' | 'Recurring Invoice' | 'Advance Invoice' | 'Final Settlement Invoice';
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface IInvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'flat';
  taxRate: number;
  hsnSac?: string;
  amount: number;
}

export interface IGSTDetails {
  cgst?: number;
  sgst?: number;
  igst?: number;
  placeOfSupply?: string;
  isExportOfServices: boolean;
  taxProtocol?: 'GST' | 'EXPORT' | 'NONE'; // Explicit tax protocol: GST, EXPORT (zero-rated), or NONE (no tax)
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  invoiceDate: Date;
  dueDate: Date;
  serviceOptedDate?: Date;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  clientGstin?: string;
  projectName: string;
  items: IInvoiceItem[];
  subtotal: number;
  discountPercentage?: number; // Optional discount as percentage of subtotal (0-100)
  discountTotal: number;
  taxDetails: IGSTDetails;
  taxAmount: number;
  total: number;
  currency: Currency;
  exchangeRate: number;
  amountInWords: string;
  notes?: string;
  terms?: string;
  timeline?: string;
  deliverables?: string;
  paymentTerms?: string;
  status: InvoiceStatus;
  sentDate?: Date;
  paidDate?: Date;
  isLocked: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  hsnSac: { type: String },
  amount: { type: Number, required: true, min: 0 },
});

const GSTDetailsSchema = new Schema<IGSTDetails>({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  placeOfSupply: { type: String },
  isExportOfServices: { type: Boolean, default: false },
  taxProtocol: { type: String, enum: ['GST', 'EXPORT', 'NONE'] },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: {
      type: String,
      enum: [
        'Standard Invoice',
        'Proforma Invoice',
        'Tax Invoice',
        'Credit Note',
        'Debit Note',
        'Recurring Invoice',
        'Advance Invoice',
        'Final Settlement Invoice',
      ],
      default: 'Tax Invoice',
    },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    serviceOptedDate: { type: Date },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientAddress: { type: String, required: true },
    clientCity: { type: String, required: true },
    clientState: { type: String, required: true },
    clientZip: { type: String, required: true },
    clientCountry: { type: String, required: true },
    clientGstin: { type: String },
    projectName: { type: String, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, min: 0, max: 100 },
    discountTotal: { type: Number, default: 0, min: 0 },
    taxDetails: { type: GSTDetailsSchema, default: {} },
    taxAmount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
      default: 'INR',
    },
    exchangeRate: { type: Number, default: 1 },
    amountInWords: { type: String },
    notes: { type: String },
    terms: { type: String },
    timeline: { type: String },
    deliverables: { type: String },
    paymentTerms: { type: String },
    status: {
      type: String,
      enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    sentDate: { type: Date },
    paidDate: { type: Date },
    isLocked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate discountTotal from discountPercentage if provided
  if (this.discountPercentage !== undefined && this.discountPercentage !== null) {
    this.discountTotal = this.subtotal * this.discountPercentage / 100;
  }
  
  // Use taxProtocol if available, otherwise fall back to isExportOfServices
  const taxProtocol = this.taxDetails.taxProtocol;
  const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && this.taxDetails.isExportOfServices);
  const isNoTax = taxProtocol === 'NONE';
  
  if (isNoTax || isExport || this.clientCountry !== 'India') {
    this.taxDetails.cgst = 0;
    this.taxDetails.sgst = 0;
    this.taxDetails.igst = 0;
    this.taxAmount = 0;
  } else {
    // Calculate GST (taxProtocol === 'GST' or undefined/legacy)
    const subtotalAfterDiscount = this.subtotal - this.discountTotal;
    if (this.clientState === this.taxDetails.placeOfSupply || !this.taxDetails.placeOfSupply) {
      const gstRate = this.items[0]?.taxRate || 18;
      this.taxDetails.cgst = (subtotalAfterDiscount * gstRate) / 200;
      this.taxDetails.sgst = (subtotalAfterDiscount * gstRate) / 200;
      this.taxDetails.igst = 0;
    } else {
      const gstRate = this.items[0]?.taxRate || 18;
      this.taxDetails.igst = (subtotalAfterDiscount * gstRate) / 100;
      this.taxDetails.cgst = 0;
      this.taxDetails.sgst = 0;
    }
    this.taxAmount = (this.taxDetails.cgst || 0) + (this.taxDetails.sgst || 0) + (this.taxDetails.igst || 0);
  }
  
  this.total = this.subtotal - this.discountTotal + this.taxAmount;
  next();
});

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ clientId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ invoiceDate: -1 });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
