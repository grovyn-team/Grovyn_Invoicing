import { create } from 'zustand';
import { Quotation, QuotationStatus, LineItem } from '../types/refTypes';
import { quotationAPI } from '../services/api';
import { Client } from '../types/refTypes';

interface QuotationsState {
  quotations: Quotation[];
  loading: boolean;
  error: string | null;
  setQuotations: (quotations: Quotation[]) => void;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  removeQuotation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchQuotations: (clients: Client[]) => Promise<void>;
  saveQuotation: (quotation: Quotation, clients: Client[]) => Promise<Quotation>;
}

const transformStatus = (backendStatus: string): QuotationStatus => {
  const statusMap: Record<string, QuotationStatus> = {
    'draft': QuotationStatus.DRAFT,
    'sent': QuotationStatus.SENT,
    'accepted': QuotationStatus.ACCEPTED,
    'rejected': QuotationStatus.REJECTED,
    'expired': QuotationStatus.EXPIRED,
    'converted': QuotationStatus.CONVERTED,
  };
  return statusMap[backendStatus.toLowerCase()] || QuotationStatus.DRAFT;
};

const transformBackendQuotation = (backendQuotation: any, clients: Client[]): Quotation => {
  const client = clients.find(c => c.id === backendQuotation.clientId?._id || backendQuotation.clientId || backendQuotation.client?.id) || {
    id: backendQuotation.clientId || '',
    name: backendQuotation.clientName || '',
    companyName: backendQuotation.clientName || '',
    email: backendQuotation.clientEmail || '',
    address: `${backendQuotation.clientAddress || ''}, ${backendQuotation.clientCity || ''}, ${backendQuotation.clientZip || ''}`,
    country: backendQuotation.clientCountry || 'India',
    state: backendQuotation.clientState || '',
    gstin: backendQuotation.clientGstin,
    projectTitle: backendQuotation.projectName || '',
    currency: 'INR',
    paymentTerms: 30,
    status: 'Active' as const,
    joinedDate: '',
    totalSpent: 0,
  };

  const items: LineItem[] = (backendQuotation.items || []).map((item: any, index: number) => ({
    id: item._id || index.toString(),
    description: item.description || item.name || '',
    hsnSac: item.hsnSac || '',
    quantity: item.quantity || 1,
    rate: item.unitPrice || item.rate || 0,
    discount: item.discount || 0,
    taxRate: item.taxRate || 18,
    total: item.amount || (item.quantity || 1) * (item.unitPrice || item.rate || 0),
  }));

  return {
    id: backendQuotation._id || backendQuotation.id,
    quotationNumber: backendQuotation.quotationNumber,
    quotationDate: backendQuotation.quotationDate ? new Date(backendQuotation.quotationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: backendQuotation.validUntil ? new Date(backendQuotation.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client,
    projectName: backendQuotation.projectName || '',
    projectScope: backendQuotation.projectScope || '',
    features: backendQuotation.features || '',
    deliverables: backendQuotation.deliverables || '',
    supportDetails: backendQuotation.supportDetails || '',
    warrantyPeriod: backendQuotation.warrantyPeriod || '',
    timeline: backendQuotation.timeline || '',
    items,
    status: transformStatus(backendQuotation.status),
    notes: backendQuotation.notes || '',
    terms: backendQuotation.terms || '',
    paymentTerms: backendQuotation.paymentTerms || '',
    currency: backendQuotation.currency || 'INR',
    exchangeRate: backendQuotation.exchangeRate || 1,
    taxType: backendQuotation.taxDetails?.taxProtocol || (backendQuotation.taxDetails?.isExportOfServices ? 'EXPORT' : 'GST'),
    discountPercentage: backendQuotation.discountPercentage,
    validityPeriod: backendQuotation.validityPeriod || 30,
    createdAt: backendQuotation.createdAt || new Date().toISOString(),
    createdBy: backendQuotation.createdBy?.name || backendQuotation.createdBy || 'Admin',
  };
};

export const useQuotationsStore = create<QuotationsState>((set, get) => ({
  quotations: [],
  loading: false,
  error: null,

  setQuotations: (quotations) => set({ quotations }),

  addQuotation: (quotation) => set((state) => ({
    quotations: [...state.quotations, quotation],
  })),

  updateQuotation: (id, updates) => set((state) => ({
    quotations: state.quotations.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    ),
  })),

  removeQuotation: (id) => set((state) => ({
    quotations: state.quotations.filter((q) => q.id !== id),
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchQuotations: async (clients: Client[]) => {
    set({ loading: true, error: null });
    try {
      const backendQuotations = await quotationAPI.getAll();
      const transformedQuotations = backendQuotations.map((quo: any) => transformBackendQuotation(quo, clients));
      set({ quotations: transformedQuotations, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch quotations', loading: false });
    }
  },

  saveQuotation: async (quotation: Quotation, clients: Client[]) => {
    try {
      const client = quotation.client.id === 'manual' ? null : clients.find(c => c.id === quotation.client.id);
      if (quotation.client.id !== 'manual' && !client) {
        throw new Error('Client not found');
      }

      const backendData: any = {
        quotationDate: quotation.quotationDate,
        validUntil: quotation.validUntil,
        clientId: quotation.client.id === 'manual' ? undefined : quotation.client.id,
        clientName: quotation.client.companyName || quotation.client.name,
        clientEmail: quotation.client.email,
        clientAddress: (quotation.client.address || '').split(',')[0] || quotation.client.address || '',
        clientCity: (quotation.client.address || '').split(',')[1]?.trim() || '',
        clientState: quotation.client.state || '',
        clientZip: (quotation.client.address || '').split(',')[2]?.trim() || '',
        clientCountry: quotation.client.country || 'India',
        clientGstin: quotation.client.gstin,
        projectName: quotation.projectName,
        projectScope: quotation.projectScope || undefined,
        features: quotation.features || undefined,
        deliverables: quotation.deliverables || undefined,
        supportDetails: quotation.supportDetails || undefined,
        warrantyPeriod: quotation.warrantyPeriod || undefined,
        timeline: quotation.timeline || undefined,
        items: quotation.items.map(item => ({
          name: item.description,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.rate,
          discount: item.discount,
          discountType: 'percentage',
          taxRate: item.taxRate,
          hsnSac: item.hsnSac || '',
          amount: item.total,
        })),
        subtotal: quotation.items.reduce((sum, item) => sum + item.total, 0),
        discountPercentage: quotation.discountPercentage,
        discountTotal: quotation.discountPercentage
          ? (quotation.items.reduce((sum, item) => sum + item.total, 0) * quotation.discountPercentage / 100)
          : 0,
        taxDetails: {
          isExportOfServices: quotation.taxType === 'EXPORT',
          taxProtocol: quotation.taxType,
        },
        currency: quotation.currency || 'INR',
        exchangeRate: quotation.exchangeRate || 1,
        notes: quotation.notes || undefined,
        terms: quotation.terms || undefined,
        paymentTerms: quotation.paymentTerms || undefined,
        validityPeriod: quotation.validityPeriod || 30,
        status: quotation.status.toLowerCase().replace(' ', '_') || 'draft',
      };

      let savedQuotation;
      if (quotation.id && quotation.id.length > 10) {
        savedQuotation = await quotationAPI.update(quotation.id, backendData);
      } else {
        savedQuotation = await quotationAPI.create(backendData);
      }

      const transformedQuotation = transformBackendQuotation(savedQuotation, clients);

      if (quotation.id && quotation.id.length > 10) {
        get().updateQuotation(transformedQuotation.id, transformedQuotation);
      } else {
        get().addQuotation(transformedQuotation);
      }

      return transformedQuotation;
    } catch (error: any) {
      set({ error: error.message || 'Failed to save quotation' });
      throw error;
    }
  },
}));
