import { create } from 'zustand';
import { Client } from '../types/refTypes';
import { clientAPI } from '../services/api';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  removeClient: (id: string) => void;
  setClients: (clients: Client[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Transform backend client to frontend format
const transformBackendClient = (backendClient: any): Client => {
  return {
    id: backendClient._id || backendClient.id || '',
    name: backendClient.name,
    companyName: backendClient.companyName || backendClient.name,
    email: backendClient.email,
    address: backendClient.billingAddress 
      ? `${backendClient.billingAddress}, ${backendClient.city || ''}, ${backendClient.state || ''} ${backendClient.zip || ''}`.trim()
      : backendClient.address || '',
    country: backendClient.country,
    state: backendClient.state,
    gstin: backendClient.gstin,
    pan: backendClient.taxId || backendClient.pan,
    projectTitle: backendClient.projectTitle || backendClient.projectName || 'New Project',
    currency: backendClient.currency || 'INR',
    paymentTerms: backendClient.customPaymentTerms || 30,
    status: (backendClient.isActive !== false ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    joinedDate: backendClient.createdAt 
      ? new Date(backendClient.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    totalSpent: backendClient.totalSpent || 0,
  };
};

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const backendClients = await clientAPI.getAll();
      // Transform backend clients to frontend format
      const transformedClients = backendClients.map(transformBackendClient);
      set({ clients: transformedClients, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch clients', loading: false });
    }
  },

  addClient: (client: Client) => {
    set((state) => ({ clients: [...state.clients, client] }));
  },

  updateClient: (id: string, updates: Partial<Client>) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
    }));
  },

  removeClient: (id: string) => {
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
    }));
  },

  setClients: (clients: Client[]) => {
    set({ clients });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
