import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cash' | 'Stripe' | 'Razorpay' | 'Other';

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Cash', 'Stripe', 'Razorpay', 'Other'],
      required: true,
    },
    transactionId: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
