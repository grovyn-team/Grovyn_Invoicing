// Types matching the reference project structure
export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PARTIAL = 'Partially Paid',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled'
}

export enum InvoiceType {
  STANDARD = 'Standard Invoice',
  PROFORMA = 'Proforma Invoice',
  TAX = 'Tax Invoice',
  CREDIT_NOTE = 'Credit Note',
  DEBIT_NOTE = 'Debit Note'
}

export enum UserRole {
  ADMIN = 'admin',
  FINANCE = 'finance',
  VIEWER = 'viewer'
}

export interface LineItem {
  id: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  rate: number;
  discount: number; // percentage
  taxRate: number; // percentage (GST)
  total: number;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  address: string;
  country: string;
  state?: string;
  gstin?: string;
  pan?: string;
  projectTitle: string;
  currency: string;
  paymentTerms: number; // days
  status: 'Active' | 'Inactive';
  joinedDate: string;
  totalSpent: number;
}

export interface CompanySettings {
  name: string;
  logoUrl?: string;
  address: string;
  state: string;
  country: string;
  gstin: string;
  pan: string;
  cin?: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    upiId?: string;
  };
  authorizedSignatory: string;
  designation: string;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  serviceOptedDate?: string; // Service opted date
  client: Client;
  items: LineItem[];
  status: InvoiceStatus;
  notes: string;
  currency: string;
  exchangeRate?: number; // relative to base (INR)
  taxType: 'GST' | 'EXPORT' | 'NONE'; // Logical split
  discountPercentage?: number; // Optional discount as percentage of subtotal (0-100)
  timeline?: string; // Project timeline/delivery schedule
  deliverables?: string; // Deliverables description
  paymentTerms?: string; // Payment terms (e.g., "50% advance, 30% on milestone, 20% on delivery")
  createdAt: string;
  createdBy: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type AppTab = 'dashboard' | 'invoices' | 'analytics' | 'clients' | 'settings' | 'audit' | 'notifications' | 'client-details' | 'client-onboarding';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}
