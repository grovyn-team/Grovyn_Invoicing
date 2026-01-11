import mongoose, { Schema, Document } from 'mongoose';

export type PaymentTerm = 'Net 7' | 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Custom';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface IClient extends Document {
  name: string;
  companyName?: string;
  billingAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  gstin?: string;
  vat?: string;
  taxId?: string;
  email: string;
  phone?: string;
  currency: Currency;
  paymentTerms: PaymentTerm;
  customPaymentTerms?: number;
  projectTitle?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    companyName: { type: String },
    billingAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    gstin: { type: String },
    vat: { type: String },
    taxId: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
      default: 'INR',
    },
    paymentTerms: {
      type: String,
      enum: ['Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'],
      default: 'Net 30',
    },
    customPaymentTerms: { type: Number },
    projectTitle: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClient>('Client', ClientSchema);
