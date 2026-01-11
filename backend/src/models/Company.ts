import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  upiId?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  invoiceFooterNotes?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryDesignation?: string;
  invoiceNumberPrefix: string;
  invoiceNumberFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, default: 'Grovyn Engineering & Development Systems' },
    logo: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    gstin: { type: String },
    pan: { type: String },
    cin: { type: String },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    bankIFSC: { type: String },
    upiId: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    website: { type: String },
    invoiceFooterNotes: { type: String },
    authorizedSignatoryName: { type: String },
    authorizedSignatoryDesignation: { type: String },
    invoiceNumberPrefix: { type: String, default: 'GROVYN' },
    invoiceNumberFormat: { type: String, default: '{PREFIX}/{YEAR}/{TYPE}/{NUMBER}' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
