import { create } from 'zustand';
import { Proposal, ProposalStatus, Client } from '../types/refTypes';
import { proposalAPI } from '../services/api';

interface ProposalState {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  removeProposal: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProposals: (clients: Client[]) => Promise<void>;
  saveProposal: (proposal: Proposal, clients: Client[]) => Promise<Proposal>;
}

const transformStatus = (backendStatus: string): ProposalStatus => {
  const statusMap: Record<string, ProposalStatus> = {
    'draft': ProposalStatus.DRAFT,
    'sent': ProposalStatus.SENT,
    'accepted': ProposalStatus.ACCEPTED,
    'rejected': ProposalStatus.REJECTED,
    'expired': ProposalStatus.EXPIRED,
  };
  return statusMap[backendStatus.toLowerCase()] || ProposalStatus.DRAFT;
};

const transformBackendProposal = (backendProposal: any, clients: Client[]): Proposal => {
  const client = clients.find(c => c.id === backendProposal.clientId?._id || backendProposal.clientId || backendProposal.client?.id) || {
    id: backendProposal.clientId || '',
    name: backendProposal.clientName || '',
    companyName: backendProposal.clientName || '',
    email: backendProposal.clientEmail || '',
    address: `${backendProposal.clientAddress || ''}, ${backendProposal.clientCity || ''}, ${backendProposal.clientZip || ''}`,
    country: backendProposal.clientCountry || 'India',
    state: backendProposal.clientState || '',
    projectTitle: backendProposal.projectName || '',
    currency: 'INR',
    paymentTerms: 30,
    status: 'Active' as const,
    joinedDate: '',
    totalSpent: 0,
  };

  return {
    id: backendProposal._id || backendProposal.id,
    proposalNumber: backendProposal.proposalNumber,
    version: backendProposal.version || 'v1.0',
    proposalDate: backendProposal.proposalDate ? new Date(backendProposal.proposalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: backendProposal.validUntil ? new Date(backendProposal.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client,
    projectName: backendProposal.projectName || '',
    problemStatement: backendProposal.problemStatement || '',
    solution: backendProposal.solution || '',
    scope: backendProposal.scope || '',
    deliverables: backendProposal.deliverables || '',
    timelineEstimate: backendProposal.timelineEstimate || '',
    exclusions: backendProposal.exclusions || '',
    nextSteps: backendProposal.nextSteps || '',
    status: transformStatus(backendProposal.status),
    notes: backendProposal.notes || '',
    createdAt: backendProposal.createdAt || new Date().toISOString(),
    createdBy: backendProposal.createdBy?.name || backendProposal.createdBy || 'Admin',
  };
};

export const useProposalsStore = create<ProposalState>((set, get) => ({
  proposals: [],
  loading: false,
  error: null,
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) => set((state) => ({ proposals: [...state.proposals, proposal] })),
  updateProposal: (id, updates) => set((state) => ({ proposals: state.proposals.map((p) => p.id === id ? { ...p, ...updates } : p) })),
  removeProposal: (id) => set((state) => ({ proposals: state.proposals.filter((p) => p.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchProposals: async (clients: Client[]) => {
    set({ loading: true, error: null });
    try {
      const backendProposals = await proposalAPI.getAll();
      const transformedProposals = backendProposals.map((prop: any) => transformBackendProposal(prop, clients));
      set({ proposals: transformedProposals, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch proposals', loading: false });
    }
  },

  saveProposal: async (proposal: Proposal, clients: Client[]) => {
    try {
      const client = clients.find(c => c.id === proposal.client.id);
      if (!client) {
        throw new Error('Client not found');
      }

      const backendData: any = {
        proposalNumber: proposal.proposalNumber,
        version: proposal.version,
        proposalDate: proposal.proposalDate,
        validUntil: proposal.validUntil,
        clientId: proposal.client.id,
        clientName: proposal.client.companyName || proposal.client.name,
        clientEmail: proposal.client.email,
        clientAddress: proposal.client.address.split(',')[0] || proposal.client.address,
        clientCity: proposal.client.address.split(',')[1]?.trim() || '',
        clientState: proposal.client.state || '',
        clientZip: proposal.client.address.split(',')[2]?.trim() || '',
        clientCountry: proposal.client.country || 'India',
        projectName: proposal.projectName,
        problemStatement: proposal.problemStatement,
        solution: proposal.solution,
        scope: proposal.scope,
        deliverables: proposal.deliverables,
        timelineEstimate: proposal.timelineEstimate,
        exclusions: proposal.exclusions,
        nextSteps: proposal.nextSteps,
        notes: proposal.notes,
        status: proposal.status.toLowerCase().replace(' ', '_'),
      };

      let savedProposal;
      if (proposal.id && proposal.id.length > 10) {
        savedProposal = await proposalAPI.update(proposal.id, backendData);
      } else {
        savedProposal = await proposalAPI.create(backendData);
      }

      const transformedProposal = transformBackendProposal(savedProposal, clients);

      if (proposal.id && proposal.id.length > 10) {
        get().updateProposal(transformedProposal.id, transformedProposal);
      } else {
        get().addProposal(transformedProposal);
      }

      return transformedProposal;
    } catch (error: any) {
      set({ error: error.message || 'Failed to save proposal' });
      throw error;
    }
  },
}));