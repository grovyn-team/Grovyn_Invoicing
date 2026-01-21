import mongoose, { Schema, Document } from 'mongoose';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface IProposal extends Document {
    proposalNumber: string;
    projectName: string;
    proposalDate: Date;
    validUntil: Date;
    clientId: mongoose.Types.ObjectId;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientCity?: string;
    clientState?: string;
    clientZip?: string;
    clientCountry?: string;
    version: string;
    problemStatement: string;
    solution: string;
    scope: string;
    deliverables: string;
    timelineEstimate: string;
    exclusions: string;
    nextSteps: string;
    status: ProposalStatus;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
    {
        proposalNumber: { type: String, required: true, unique: true },
        projectName: { type: String, required: true },
        proposalDate: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
        clientName: { type: String, required: true },
        clientEmail: { type: String, required: true },
        clientAddress: { type: String, required: true },
        clientCity: { type: String },
        clientState: { type: String },
        clientZip: { type: String },
        clientCountry: { type: String },
        version: { type: String, default: 'v1.0' },
        problemStatement: { type: String, required: true },
        solution: { type: String, required: true },
        scope: { type: String, required: true },
        deliverables: { type: String, required: true },
        timelineEstimate: { type: String, required: true },
        exclusions: { type: String },
        nextSteps: { type: String },
        status: {
            type: String,
            enum: ['draft', 'sent', 'accepted', 'rejected'],
            default: 'draft',
        },
        notes: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
    }
);

ProposalSchema.index({ proposalNumber: 1 });
ProposalSchema.index({ clientId: 1 });
ProposalSchema.index({ status: 1 });
ProposalSchema.index({ proposalDate: -1 });

export default mongoose.model<IProposal>('Proposal', ProposalSchema);
