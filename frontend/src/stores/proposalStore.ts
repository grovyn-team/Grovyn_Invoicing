import { create } from 'zustand';
import { Proposal } from '../types/refTypes';

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
}

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
}));