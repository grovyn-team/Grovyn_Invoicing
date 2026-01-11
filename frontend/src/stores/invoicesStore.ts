import { create } from 'zustand';
import { Invoice, InvoiceStatus, InvoiceType, LineItem } from '../types/refTypes';
import { invoiceAPI } from '../services/api';
import { Client } from '../types/refTypes';

interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchInvoices: (clients: Client[]) => Promise<void>;
  saveInvoice: (invoice: Invoice, clients: Client[]) => Promise<Invoice>;
}

// Transform backend invoice status to frontend status
const transformStatus = (backendStatus: string): InvoiceStatus => {
  const statusMap: Record<string, InvoiceStatus> = {
    'draft': InvoiceStatus.DRAFT,
    'sent': InvoiceStatus.SENT,
    'partially_paid': InvoiceStatus.PARTIAL,
    'paid': InvoiceStatus.PAID,
    'overdue': InvoiceStatus.OVERDUE,
    'cancelled': InvoiceStatus.CANCELLED,
  };
  return statusMap[backendStatus.toLowerCase()] || InvoiceStatus.DRAFT;
};

// Transform backend invoice type to frontend type
const transformType = (backendType: string): InvoiceType => {
  // Map backend invoice types to frontend enum values
  if (backendType === 'Tax Invoice') return InvoiceType.TAX;
  if (backendType === 'Standard Invoice') return InvoiceType.STANDARD;
  if (backendType === 'Proforma Invoice') return InvoiceType.PROFORMA;
  if (backendType === 'Credit Note') return InvoiceType.CREDIT_NOTE;
  if (backendType === 'Debit Note') return InvoiceType.DEBIT_NOTE;
  return InvoiceType.TAX; // default
};

// Transform backend invoice item to frontend LineItem
const transformLineItem = (backendItem: any, index: number): LineItem => {
  return {
    id: backendItem._id?.toString() || index.toString(),
    description: backendItem.description || backendItem.name || '',
    hsnSac: backendItem.hsnSac || '',
    quantity: backendItem.quantity || 0,
    rate: backendItem.unitPrice || backendItem.rate || 0,
    discount: backendItem.discount || 0,
    taxRate: backendItem.taxRate || 18,
    total: backendItem.amount || backendItem.total || 0,
  };
};

// Transform backend invoice to frontend Invoice
const transformBackendInvoice = (backendInvoice: any, clients: Client[]): Invoice => {
  // Find the client object from the clients array
  const clientId = backendInvoice.clientId?._id || backendInvoice.clientId || backendInvoice.clientId?.toString();
  const client = clients.find(c => c.id === clientId || c.id === backendInvoice.clientId?.toString());
  
  // If client is populated, use it; otherwise construct from invoice fields
  const clientObj: Client = client || {
    id: clientId || '',
    name: backendInvoice.clientName || '',
    companyName: backendInvoice.clientName || '',
    email: backendInvoice.clientEmail || '',
    address: backendInvoice.clientAddress 
      ? `${backendInvoice.clientAddress}, ${backendInvoice.clientCity || ''}, ${backendInvoice.clientState || ''} ${backendInvoice.clientZip || ''}`.trim()
      : '',
    country: backendInvoice.clientCountry || '',
    state: backendInvoice.clientState || '',
    gstin: backendInvoice.clientGstin,
    pan: '',
    projectTitle: backendInvoice.projectName || 'New Project',
    currency: backendInvoice.currency || 'INR',
    paymentTerms: 30,
    status: 'Active' as const,
    joinedDate: backendInvoice.createdAt ? new Date(backendInvoice.createdAt).toISOString().split('T')[0] : '',
    totalSpent: 0,
  };

  // Determine tax type from taxDetails (prefer taxProtocol if available)
  let taxType: 'GST' | 'EXPORT' | 'NONE' = 'GST';
  if (backendInvoice.taxDetails?.taxProtocol) {
    taxType = backendInvoice.taxDetails.taxProtocol as 'GST' | 'EXPORT' | 'NONE';
  } else if (backendInvoice.taxDetails?.isExportOfServices) {
    taxType = 'EXPORT';
  } else if (backendInvoice.taxAmount === 0 && !backendInvoice.taxDetails?.cgst && !backendInvoice.taxDetails?.sgst && !backendInvoice.taxDetails?.igst) {
    taxType = 'NONE';
  }

  return {
    id: backendInvoice._id?.toString() || backendInvoice.id || '',
    type: transformType(backendInvoice.invoiceType || backendInvoice.type || 'Tax Invoice'),
    invoiceNumber: backendInvoice.invoiceNumber || '',
    issueDate: backendInvoice.invoiceDate 
      ? new Date(backendInvoice.invoiceDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    dueDate: backendInvoice.dueDate 
      ? new Date(backendInvoice.dueDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    client: clientObj,
    items: (backendInvoice.items || []).map((item: any, index: number) => transformLineItem(item, index)),
    status: transformStatus(backendInvoice.status || 'draft'),
    notes: backendInvoice.notes || backendInvoice.terms || '',
    currency: backendInvoice.currency || 'INR',
    exchangeRate: backendInvoice.exchangeRate || 1,
    taxType,
    discountPercentage: backendInvoice.discountPercentage,
    timeline: backendInvoice.timeline || '',
    deliverables: backendInvoice.deliverables || '',
    paymentTerms: backendInvoice.paymentTerms || '',
    createdAt: backendInvoice.createdAt 
      ? new Date(backendInvoice.createdAt).toISOString()
      : new Date().toISOString(),
    createdBy: backendInvoice.createdBy?.name || backendInvoice.createdBy || 'Admin',
  };
};

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async (clients: Client[]) => {
    set({ loading: true, error: null });
    try {
      const backendInvoices = await invoiceAPI.getAll();
      const transformedInvoices = backendInvoices.map((inv: any) => transformBackendInvoice(inv, clients));
      set({ invoices: transformedInvoices, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch invoices', loading: false });
    }
  },

  saveInvoice: async (invoice: Invoice, clients: Client[]) => {
    try {
      const client = clients.find(c => c.id === invoice.client.id);
      if (!client) {
        throw new Error('Client not found');
      }

      // Transform frontend invoice to backend format
      const backendData: any = {
        invoiceType: invoice.type,
        invoiceDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        clientId: invoice.client.id,
        clientName: invoice.client.companyName || invoice.client.name,
        clientEmail: invoice.client.email,
        clientAddress: invoice.client.address.split(',')[0] || invoice.client.address,
        clientCity: invoice.client.address.split(',')[1]?.trim() || '',
        clientState: invoice.client.state || '',
        clientZip: invoice.client.address.split(',')[2]?.trim() || '',
        clientCountry: invoice.client.country || 'India',
        clientGstin: invoice.client.gstin,
        projectName: client.projectTitle || 'New Project', // Use projectTitle from client
        items: invoice.items.map(item => ({
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
        subtotal: invoice.items.reduce((sum, item) => sum + item.total, 0),
        discountPercentage: invoice.discountPercentage,
        discountTotal: invoice.discountPercentage 
          ? (invoice.items.reduce((sum, item) => sum + item.total, 0) * invoice.discountPercentage / 100)
          : 0,
        taxDetails: {
          isExportOfServices: invoice.taxType === 'EXPORT',
          taxProtocol: invoice.taxType, // Explicitly send tax protocol: 'GST', 'EXPORT', or 'NONE'
        },
        currency: invoice.currency || 'INR',
        exchangeRate: invoice.exchangeRate || 1,
        notes: invoice.notes || '',
        timeline: invoice.timeline || undefined,
        deliverables: invoice.deliverables || undefined,
        paymentTerms: invoice.paymentTerms || undefined,
        status: invoice.status.toLowerCase().replace(' ', '_') || 'draft',
      };

      let savedInvoice;
      if (invoice.id && invoice.id.length > 10) {
        // Update existing invoice
        savedInvoice = await invoiceAPI.update(invoice.id, backendData);
      } else {
        // Create new invoice
        savedInvoice = await invoiceAPI.create(backendData);
      }

      // Transform saved invoice back to frontend format
      const transformedInvoice = transformBackendInvoice(savedInvoice, clients);
      
      // Update store
      if (invoice.id && invoice.id.length > 10) {
        get().updateInvoice(transformedInvoice.id, transformedInvoice);
      } else {
        get().addInvoice(transformedInvoice);
      }

      return transformedInvoice;
    } catch (error: any) {
      set({ error: error.message || 'Failed to save invoice' });
      throw error;
    }
  },

  setInvoices: (invoices: Invoice[]) => {
    set({ invoices });
  },

  addInvoice: (invoice: Invoice) => {
    set((state) => ({ invoices: [invoice, ...state.invoices] }));
  },

  updateInvoice: (id: string, updates: Partial<Invoice>) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      ),
    }));
  },

  removeInvoice: (id: string) => {
    set((state) => ({
      invoices: state.invoices.filter((invoice) => invoice.id !== id),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
