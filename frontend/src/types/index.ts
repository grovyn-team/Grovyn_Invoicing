export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type InvoiceType = 'Standard Invoice' | 'Proforma Invoice' | 'Tax Invoice' | 'Credit Note' | 'Debit Note' | 'Recurring Invoice' | 'Advance Invoice' | 'Final Settlement Invoice';
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cash' | 'Stripe' | 'Razorpay' | 'Other';
export type PaymentTerm = 'Net 7' | 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Custom';

export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'flat';
  taxRate: number;
  hsnSac?: string;
  amount: number;
}

export interface GSTDetails {
  cgst?: number;
  sgst?: number;
  igst?: number;
  placeOfSupply?: string;
  isExportOfServices: boolean;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  invoiceDate: string;
  dueDate: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  clientGstin?: string;
  projectName: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxDetails: GSTDetails;
  taxAmount: number;
  total: number;
  currency: Currency;
  exchangeRate: number;
  amountInWords: string;
  notes?: string;
  terms?: string;
  status: InvoiceStatus;
  sentDate?: string;
  paidDate?: string;
  isLocked: boolean;
  paidAmount?: number;
  outstanding?: number;
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceFormData {
  invoiceType: InvoiceType;
  invoiceDate: string;
  dueDate: string;
  clientId?: string;
  projectName: string;
  currency: Currency;
  exchangeRate: number;
  items: InvoiceItem[];
  taxDetails: GSTDetails;
  notes?: string;
  terms?: string;
  status: InvoiceStatus;
}

export interface Client {
  _id?: string;
  name: string;
  companyName?: string;
  billingAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  gstin?: string;
  vat?: string;
  taxId?: string;
  email: string;
  phone?: string;
  currency: Currency;
  paymentTerms: PaymentTerm;
  customPaymentTerms?: number;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
}

export interface Company {
  _id?: string;
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  upiId?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  invoiceFooterNotes?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryDesignation?: string;
}

export interface DashboardStats {
  totalCollected: number;
  pendingPayment: number;
  paidInvoices: number;
  activeClients: number;
  totalInvoices: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  globalCoverage: {
    regions: number;
    countries: string[];
  };
  growthIndex: {
    percentage: number;
    period: string;
  };
  systemLoad: {
    status: string;
    invoicesProcessed: number;
  };
}
