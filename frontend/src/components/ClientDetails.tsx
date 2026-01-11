import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, MapPin, Globe, Building2, CreditCard, TrendingUp, FileText, Edit2, Save, X } from 'lucide-react';
import { Client, Invoice, InvoiceStatus, UserRole } from '../types/refTypes';
import { useClientsStore } from '../stores/clientsStore';
import { clientAPI } from '../services/api';
import { toast } from '../utils/toast';

interface ClientDetailsProps {
  client: Client;
  invoices: Invoice[];
  onBack: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  userRole: UserRole;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, invoices, onBack, onEditInvoice, userRole }) => {
  const { updateClient } = useClientsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parse address into components for editing
  const parseAddress = (address: string) => {
    const parts = address.split(',').map(p => p.trim());
    return {
      billingAddress: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zip: parts[3] || '',
    };
  };

  const addressParts = parseAddress(client.address);
  
  const [formData, setFormData] = useState({
    name: client.name,
    companyName: client.companyName,
    email: client.email,
    billingAddress: addressParts.billingAddress,
    city: addressParts.city,
    state: addressParts.state || '',
    zip: addressParts.zip || '',
    country: client.country,
    phone: '',
    gstin: client.gstin || '',
    pan: client.pan || '',
    currency: client.currency,
    projectTitle: client.projectTitle,
  });

  useEffect(() => {
    if (!isEditing) {
      const addressParts = parseAddress(client.address);
      setFormData({
        name: client.name,
        companyName: client.companyName,
        email: client.email,
        billingAddress: addressParts.billingAddress,
        city: addressParts.city,
        state: addressParts.state || '',
        zip: addressParts.zip || '',
        country: client.country,
        phone: '',
        gstin: client.gstin || '',
        pan: client.pan || '',
        currency: client.currency,
        projectTitle: client.projectTitle,
      });
    }
  }, [client, isEditing]);

  const isAdmin = userRole === UserRole.ADMIN;

  const clientInvoices = invoices.filter(inv => inv.client.id === client.id);
  const totalInvoiced = clientInvoices.reduce((acc, inv) => acc + inv.items.reduce((sum, i) => sum + i.total, 0), 0);
  const totalPaid = clientInvoices.filter(i => i.status === InvoiceStatus.PAID).reduce((acc, inv) => acc + inv.items.reduce((sum, i) => sum + i.total, 0), 0);
  const outstanding = totalInvoiced - totalPaid;

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Transform to backend format
      const backendData: any = {
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
        projectTitle: formData.projectTitle || undefined,
        notes: undefined,
      };

      const updatedClient = await clientAPI.update(client.id, backendData as any);

      // Transform backend response to frontend format
      const frontendClient: Client = {
        id: updatedClient.id || updatedClient._id || client.id,
        name: updatedClient.name,
        companyName: updatedClient.companyName || updatedClient.name,
        email: updatedClient.email,
        address: `${updatedClient.billingAddress || ''}, ${updatedClient.city || ''}, ${updatedClient.state || ''} ${updatedClient.zip || ''}`.trim(),
        country: updatedClient.country,
        state: updatedClient.state,
        gstin: updatedClient.gstin,
        pan: updatedClient.taxId,
        projectTitle: updatedClient.projectTitle || formData.projectTitle || 'New Project',
        currency: updatedClient.currency,
        paymentTerms: client.paymentTerms,
        status: (updatedClient.isActive !== false ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
        joinedDate: client.joinedDate,
        totalSpent: client.totalSpent,
      };

      // Update the client in the store
      updateClient(client.id, frontendClient);
      setIsEditing(false);
      setLoading(false);
      toast.success('Client updated successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update client. Please try again.';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    const addressParts = parseAddress(client.address);
    setFormData({
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      billingAddress: addressParts.billingAddress,
      city: addressParts.city,
      state: addressParts.state || '',
      zip: addressParts.zip || '',
      country: client.country,
      phone: '',
      gstin: client.gstin || '',
      pan: client.pan || '',
      currency: client.currency,
      projectTitle: client.projectTitle,
    });
    setIsEditing(false);
    setError(null);
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 no-print">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">{client.companyName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Verified Partner</span>
            <span className="text-slate-400 font-medium text-xs">ID: {client.id}</span>
          </div>
        </div>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 shadow-lg shadow-teal-500/10 transition-all"
          >
            <Edit2 size={18} />
            Edit
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all"
              disabled={loading}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 shadow-lg shadow-teal-500/10 transition-all"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-teal-500">
            <TrendingUp size={20} className="text-teal-600 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Lifecycle Value</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">₹{totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500">
            <CreditCard size={20} className="text-emerald-600 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-rose-500">
            <FileText size={20} className="text-rose-600 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">₹{outstanding.toLocaleString()}</p>
          </div>
        </div>

        {/* Right Column - Client Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Client Information</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Contact Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Billing Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                    value={formData.billingAddress}
                    onChange={(e) => updateField('billingAddress', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">State</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ZIP Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Country</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">GSTIN</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium mono"
                      value={formData.gstin}
                      onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                      placeholder="27AABCG1234F1Z1"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">PAN</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium mono"
                      value={formData.pan}
                      onChange={(e) => updateField('pan', e.target.value.toUpperCase())}
                      placeholder="AABCG1234F"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Currency</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                      value={formData.currency}
                      onChange={(e) => updateField('currency', e.target.value)}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Project Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={formData.projectTitle}
                      onChange={(e) => updateField('projectTitle', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Building2 size={20} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Company</p>
                    <p className="text-sm font-bold text-slate-900">{client.companyName}</p>
                    <p className="text-sm text-slate-600">{client.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail size={20} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-sm font-medium text-slate-900 whitespace-pre-line">{client.address}</p>
                  </div>
                </div>

                {client.gstin && (
                  <div className="flex items-start gap-4">
                    <FileText size={20} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">GSTIN</p>
                      <p className="text-sm font-medium text-slate-900 mono">{client.gstin}</p>
                    </div>
                  </div>
                )}

                {client.pan && (
                  <div className="flex items-start gap-4">
                    <FileText size={20} className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">PAN</p>
                      <p className="text-sm font-medium text-slate-900 mono">{client.pan}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Globe size={20} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Currency</p>
                    <p className="text-sm font-medium text-slate-900">{client.currency}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FileText size={20} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Project Title</p>
                    <p className="text-sm font-medium text-slate-900">{client.projectTitle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Recent Invoices</h2>
            {clientInvoices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No invoices found for this client.</p>
            ) : (
              <div className="space-y-3">
                {clientInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => onEditInvoice(invoice)}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{invoice.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{invoice.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-black uppercase ${invoice.status === InvoiceStatus.PAID ? 'bg-emerald-50 text-emerald-600' : invoice.status === InvoiceStatus.DRAFT ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
