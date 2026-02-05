import React, { useState } from 'react';
import { ChevronLeft, Save, Mail, User, Building2, MapPin, Phone, Globe, FileText } from 'lucide-react';
import { Client } from '../types/refTypes';
import { clientAPI } from '../services/api';
import { toast } from '../utils/toast';

const getCurrencyIcon = (currency: string) => {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'AED':
      return 'د.إ';
    default:
      return '$';
  }
};

interface ClientOnboardingProps {
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const ClientOnboarding: React.FC<ClientOnboardingProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    billingAddress: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    phone: '',
    gstin: '',
    pan: '',
    currency: 'INR' as 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED',
    projectTitle: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const backendData = {
        name: formData.name,
        companyName: formData.companyName || undefined,
        email: formData.email,
        billingAddress: formData.billingAddress,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        phone: formData.phone || undefined,
        gstin: formData.gstin || undefined,
        taxId: formData.pan || undefined,
        currency: formData.currency,
        paymentTerms: 'Net 30' as const,
        notes: formData.notes || undefined,
      };

      const createdClient: any = await clientAPI.create(backendData);

      const frontendClient: Client = {
        id: createdClient.id || createdClient._id || '',
        name: createdClient.name,
        companyName: createdClient.companyName || createdClient.name,
        email: createdClient.email,
        address: `${createdClient.billingAddress || ''}, ${createdClient.city || ''}, ${createdClient.state || ''} ${createdClient.zip || ''}`.trim(),
        country: createdClient.country,
        state: createdClient.state,
        gstin: createdClient.gstin,
        pan: createdClient.taxId,
        projectTitle: formData.projectTitle || 'New Project',
        currency: createdClient.currency,
        paymentTerms: 30, // Default payment terms
        status: 'Active' as const,
        joinedDate: new Date().toISOString().split('T')[0],
        totalSpent: 0,
      };

      onSave(frontendClient);
      setLoading(false);
      toast.success('Client created successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create client. Please try again.';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    }
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Onboard New Client
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Create a new client entity</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          Create Client
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">01</span>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Contact Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                  placeholder="client@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Project Title</label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => updateField('projectTitle', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all"
                placeholder="Project Name"
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">02</span>
            Billing Address
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Street Address *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  required
                  value={formData.billingAddress}
                  onChange={(e) => updateField('billingAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all resize-none"
                  rows={2}
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ZIP / Postal Code *</label>
              <input
                type="text"
                required
                value={formData.zip}
                onChange={(e) => updateField('zip', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all"
                placeholder="400059"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Country *</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  required
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">03</span>
            Financial Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Currency *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold" style={{ fontFamily: 'system-ui, -apple-system' }}>
                  {getCurrencyIcon(formData.currency)}
                </span>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all mono"
                placeholder="27AABCG1234F1Z1"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => updateField('pan', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold transition-all mono"
                placeholder="AABCG1234F"
                maxLength={10}
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">04</span>
            Additional Information
          </h3>
          
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 focus:border-teal-500 outline-none text-sm font-bold transition-all resize-none"
                rows={4}
                placeholder="Additional notes about the client..."
              />
            </div>
          </div>
        </section>

        <div className="sm:hidden pb-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientOnboarding;
