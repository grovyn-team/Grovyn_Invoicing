import { create } from 'zustand';
import { AppTab } from '../types/refTypes';

interface AppState {
  activeTab: AppTab;
  searchTerm: string;
  selectedClientId: string | null;
  editingInvoice: string | null;
  editingQuotation: string | null;
  editingOfferLetter: string | null;
  isCreating: boolean;
  editingProposal: string | null;
  setActiveTab: (tab: AppTab) => void;
  setSearchTerm: (term: string) => void;
  setSelectedClientId: (clientId: string | null) => void;
  setEditingInvoice: (invoiceId: string | null) => void;
  setEditingQuotation: (quotationId: string | null) => void;
  setEditingOfferLetter: (offerLetterId: string | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  startNewInvoice: () => void;
  startEditInvoice: (invoiceId: string) => void;
  startNewQuotation: () => void;
  startEditQuotation: (quotationId: string) => void;
  startNewOfferLetter: () => void;
  startEditOfferLetter: (offerLetterId: string) => void;
  cancelInvoiceEdit: () => void;
  viewClient: (clientId: string) => void;
  backToClients: () => void;
  startNewClient: () => void;
  completeClientCreation: () => void;
  startNewProposal: () => void;
  startEditProposal: (proposalId: string) => void;

}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  searchTerm: '',
  selectedClientId: null,
  editingInvoice: null,
  editingQuotation: null,
  editingOfferLetter: null,
  isCreating: false,
  editingProposal: null,
  setActiveTab: (tab: AppTab) => {
    set({ activeTab: tab });
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setSelectedClientId: (clientId: string | null) => {
    set({ selectedClientId: clientId });
  },

  setEditingInvoice: (invoiceId: string | null) => {
    set({ editingInvoice: invoiceId });
  },

  setEditingQuotation: (quotationId: string | null) => {
    set({ editingQuotation: quotationId });
  },

  setEditingOfferLetter: (offerLetterId: string | null) => {
    set({ editingOfferLetter: offerLetterId });
  },

  setIsCreating: (isCreating: boolean) => {
    set({ isCreating });
  },

  startNewInvoice: () => {
    set({ isCreating: true, editingInvoice: null, editingQuotation: null, editingOfferLetter: null, activeTab: 'invoices' });
  },

  startEditInvoice: (invoiceId: string) => {
    set({ editingInvoice: invoiceId, editingQuotation: null, editingOfferLetter: null, isCreating: false, activeTab: 'invoices' });
  },

  startNewQuotation: () => {
    set({ isCreating: true, editingQuotation: null, editingInvoice: null, editingOfferLetter: null, activeTab: 'quotations' });
  },

  startEditQuotation: (quotationId: string) => {
    set({ editingQuotation: quotationId, editingInvoice: null, editingOfferLetter: null, isCreating: false, activeTab: 'quotations' });
  },

  startNewOfferLetter: () => {
    set({ isCreating: true, editingOfferLetter: null, editingInvoice: null, editingQuotation: null, activeTab: 'offer-letters' });
  },

  startEditOfferLetter: (offerLetterId: string) => {
    set({ editingOfferLetter: offerLetterId, editingInvoice: null, editingQuotation: null, isCreating: false, activeTab: 'offer-letters' });
  },

  startNewProposal: () => {
    set({ isCreating: true, editingProposal: null, editingInvoice: null, editingQuotation: null, editingOfferLetter: null, activeTab: 'proposals' });
  },

  startEditProposal: (proposalId: string) => {
    set({ editingProposal: proposalId, editingInvoice: null, editingQuotation: null, editingOfferLetter: null, isCreating: false, activeTab: 'proposals' });
  },

  cancelInvoiceEdit: () => {
    set({ editingInvoice: null, editingQuotation: null, editingOfferLetter: null, isCreating: false, activeTab: 'dashboard' });
  },

  viewClient: (clientId: string) => {
    set({ selectedClientId: clientId, activeTab: 'client-details' });
  },

  backToClients: () => {
    set({ selectedClientId: null, activeTab: 'clients' });
  },

  startNewClient: () => {
    set({ activeTab: 'client-onboarding' });
  },

  completeClientCreation: () => {
    set({ activeTab: 'clients' });
  },
}));
