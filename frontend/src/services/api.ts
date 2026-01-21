import axios from 'axios';
import { Invoice, InvoiceFormData, Client, Payment, Company, DashboardStats, AnalyticsData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Load token from localStorage on initialization
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role?: string) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },
  
  logout: () => {
    setAuthToken(null);
  },
};

// User API
export const userAPI = {
  updateProfile: async (data: { name: string; email: string }) => {
    const response = await axios.put(`${API_URL}/user/profile`, data);
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await axios.put(`${API_URL}/user/password`, data);
    return response.data;
  },
  
  uploadAvatar: async (formData: FormData) => {
    const response = await axios.post(`${API_URL}/user/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  resetPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/user/reset-password`, { email });
    return response.data;
  },
};

export const invoiceAPI = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await axios.get<Invoice[]>(`${API_URL}/invoices`);
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await axios.get<Invoice>(`${API_URL}/invoices/${id}`);
    return response.data;
  },

  create: async (data: InvoiceFormData): Promise<Invoice> => {
    const response = await axios.post<Invoice>(`${API_URL}/invoices`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<InvoiceFormData>): Promise<Invoice> => {
    const response = await axios.put<Invoice>(`${API_URL}/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/invoices/${id}`);
  },

  send: async (id: string): Promise<Invoice> => {
    const response = await axios.post<Invoice>(`${API_URL}/invoices/${id}/send`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}/invoices/dashboard/stats`);
    return response.data;
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await axios.get<AnalyticsData>(`${API_URL}/invoices/analytics`);
    return response.data;
  },

  generateAIDraft: async (prompt: string, clientId: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/invoices/ai/generate`, { prompt, clientId });
    return response.data;
  },
};

export const clientAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await axios.get<any[]>(`${API_URL}/clients`);
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await axios.get<any>(`${API_URL}/clients/${id}`);
    return response.data;
  },

  create: async (data: Partial<Client>): Promise<any> => {
    const response = await axios.post<any>(`${API_URL}/clients`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Client>): Promise<any> => {
    const response = await axios.put<any>(`${API_URL}/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/clients/${id}`);
  },
};

export const companyAPI = {
  get: async (): Promise<Company> => {
    const response = await axios.get<Company>(`${API_URL}/company`);
    return response.data;
  },

  update: async (data: Partial<Company>): Promise<Company> => {
    const response = await axios.put<Company>(`${API_URL}/company`, data);
    return response.data;
  },
};

export const paymentAPI = {
  getAll: async (invoiceId?: string): Promise<Payment[]> => {
    const params = invoiceId ? { invoiceId } : {};
    const response = await axios.get<Payment[]>(`${API_URL}/payments`, { params });
    return response.data;
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    const response = await axios.post<Payment>(`${API_URL}/payments`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/payments/${id}`);
  },
};

export const quotationAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await axios.get<any[]>(`${API_URL}/quotations`);
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await axios.get<any>(`${API_URL}/quotations/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await axios.post<any>(`${API_URL}/quotations`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<any>): Promise<any> => {
    const response = await axios.put<any>(`${API_URL}/quotations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/quotations/${id}`);
  },

  send: async (id: string): Promise<any> => {
    const response = await axios.post<any>(`${API_URL}/quotations/${id}/send`);
    return response.data;
  },

  generateAIDraft: async (prompt: string, clientId: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/quotations/ai/generate`, { prompt, clientId });
    return response.data;
  },
};

export const offerLetterAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await axios.get<any[]>(`${API_URL}/offer-letters`);
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await axios.get<any>(`${API_URL}/offer-letters/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await axios.post<any>(`${API_URL}/offer-letters`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<any>): Promise<any> => {
    const response = await axios.put<any>(`${API_URL}/offer-letters/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/offer-letters/${id}`);
  },

  send: async (id: string): Promise<any> => {
    const response = await axios.post<any>(`${API_URL}/offer-letters/${id}/send`);
    return response.data;
  },
};
