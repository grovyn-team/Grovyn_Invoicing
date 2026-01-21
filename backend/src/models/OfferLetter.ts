import mongoose, { Schema, Document } from 'mongoose';

export type OfferLetterStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface IOfferLetter extends Document {
  offerNumber: string;
  offerDate: Date;
  validUntil: Date;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateAddress?: string;
  position: string;
  department: string;
  designation: string;
  reportingManager?: string;
  startDate: Date;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  workLocation: string;
  salaryDetails: {
    baseSalary: number;
    currency: string;
    salaryBreakdown?: string;
    variablePay?: number;
    benefits?: string;
  };
  noticePeriod?: string;
  probationPeriod?: string;
  termsAndConditions?: string;
  additionalNotes?: string;
  acceptanceDeadline: Date;
  status: OfferLetterStatus;
  sentDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  isLocked: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryDetailsSchema = new Schema({
  baseSalary: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  salaryBreakdown: { type: String },
  variablePay: { type: Number, min: 0 },
  benefits: { type: String },
});

const OfferLetterSchema = new Schema<IOfferLetter>(
  {
    offerNumber: { type: String, required: true, unique: true },
    offerDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String },
    candidateAddress: { type: String },
    position: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    reportingManager: { type: String },
    startDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
      default: 'Full-Time',
    },
    workLocation: { type: String, required: true },
    salaryDetails: { type: SalaryDetailsSchema, required: true },
    noticePeriod: { type: String },
    probationPeriod: { type: String },
    termsAndConditions: { type: String },
    additionalNotes: { type: String },
    acceptanceDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft',
    },
    sentDate: { type: Date },
    acceptedDate: { type: Date },
    rejectedDate: { type: Date },
    isLocked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

OfferLetterSchema.index({ offerNumber: 1 });
OfferLetterSchema.index({ candidateEmail: 1 });
OfferLetterSchema.index({ status: 1 });
OfferLetterSchema.index({ offerDate: -1 });

export default mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
