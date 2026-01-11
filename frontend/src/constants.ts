import { CompanySettings, AppNotification } from './types/refTypes';

export const COMPANY_DEFAULTS: CompanySettings = {
  name: 'rovyn',
  address: 'Tatibandh, Raipur, CG 492099',
  state: 'Maharashtra',
  country: 'India',
  gstin: 'UDYAM-CG-14-0126434',
  pan: 'N/A',
  cin: 'U72900MH2025PTC123456',
  bankDetails: {
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50100850271109',
    ifsc: 'HDFC0003692',
    branch: 'Tatibandh, Raipur',
    upiId: 'grovyn@axl'
  },
  authorizedSignatory: 'Principal Architect',
  designation: 'Director\'s Office, Grovyn'
};

export const REVENUE_DATA = [
  { month: 'Oct', revenue: 1200000 },
  { month: 'Nov', revenue: 1500000 },
  { month: 'Dec', revenue: 1100000 },
  { month: 'Jan', revenue: 1850000 }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Payment Received',
    message: 'Invoice #GRV/2025/INV/001 has been marked as PAID by Finance.',
    type: 'success',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'n2',
    title: 'Invoice Overdue',
    message: 'Invoice #GRV/2024/INV/089 for TechVanguard Inc is 3 days overdue.',
    type: 'warning',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 'n3',
    title: 'New Client Onboarded',
    message: 'TechVanguard Inc has been added to the directory.',
    type: 'info',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 'n4',
    title: 'System Update',
    message: 'Invoice OS version 2.4.1 deployment successful.',
    type: 'info',
    timestamp: '2 days ago',
    read: true
  }
];
