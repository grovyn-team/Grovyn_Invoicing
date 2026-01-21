import mongoose, { Schema, Document } from 'mongoose';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface IQuotationItem {
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
  taxProtocol?: 'GST' | 'EXPORT' | 'NONE';
}

export interface IQuotation extends Document {
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
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
  projectScope?: string;
  features?: string;
  deliverables?: string;
  supportDetails?: string;
  warrantyPeriod?: string;
  timeline?: string;
  items: IQuotationItem[];
  subtotal: number;
  discountPercentage?: number;
  discountTotal: number;
  taxDetails: IGSTDetails;
  taxAmount: number;
  total: number;
  currency: Currency;
  exchangeRate: number;
  amountInWords: string;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  validityPeriod: number;
  status: QuotationStatus;
  sentDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  convertedToInvoiceId?: mongoose.Types.ObjectId;
  isLocked: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
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

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true },
    quotationDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
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
    projectScope: { type: String },
    features: { type: String },
    deliverables: { type: String },
    supportDetails: { type: String },
    warrantyPeriod: { type: String },
    timeline: { type: String },
    items: [QuotationItemSchema],
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
    paymentTerms: { type: String },
    validityPeriod: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
    },
    sentDate: { type: Date },
    acceptedDate: { type: Date },
    rejectedDate: { type: Date },
    convertedToInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    isLocked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

QuotationSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  if (this.discountPercentage !== undefined && this.discountPercentage !== null) {
    this.discountTotal = this.subtotal * this.discountPercentage / 100;
  }
  
  const taxProtocol = this.taxDetails.taxProtocol;
  const isExport = taxProtocol === 'EXPORT' || (taxProtocol === undefined && this.taxDetails.isExportOfServices);
  const isNoTax = taxProtocol === 'NONE';
  
  if (isNoTax || isExport || this.clientCountry !== 'India') {
    this.taxDetails.cgst = 0;
    this.taxDetails.sgst = 0;
    this.taxDetails.igst = 0;
    this.taxAmount = 0;
  } else {
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

QuotationSchema.index({ quotationNumber: 1 });
QuotationSchema.index({ clientId: 1 });
QuotationSchema.index({ status: 1 });
QuotationSchema.index({ quotationDate: -1 });

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);
