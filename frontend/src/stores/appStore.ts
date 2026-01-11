import { create } from 'zustand';
import { AppTab } from '../types/refTypes';

interface AppState {
  activeTab: AppTab;
  searchTerm: string;
  selectedClientId: string | null;
  editingInvoice: string | null; // invoice ID
  isCreating: boolean;
  setActiveTab: (tab: AppTab) => void;
  setSearchTerm: (term: string) => void;
  setSelectedClientId: (clientId: string | null) => void;
  setEditingInvoice: (invoiceId: string | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  startNewInvoice: () => void;
  startEditInvoice: (invoiceId: string) => void;
  cancelInvoiceEdit: () => void;
  viewClient: (clientId: string) => void;
  backToClients: () => void;
  startNewClient: () => void;
  completeClientCreation: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  searchTerm: '',
  selectedClientId: null,
  editingInvoice: null,
  isCreating: false,

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

  setIsCreating: (isCreating: boolean) => {
    set({ isCreating });
  },

  startNewInvoice: () => {
    set({ isCreating: true, editingInvoice: null, activeTab: 'invoices' });
  },

  startEditInvoice: (invoiceId: string) => {
    set({ editingInvoice: invoiceId, isCreating: false, activeTab: 'invoices' });
  },

  cancelInvoiceEdit: () => {
    set({ editingInvoice: null, isCreating: false, activeTab: 'dashboard' });
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
