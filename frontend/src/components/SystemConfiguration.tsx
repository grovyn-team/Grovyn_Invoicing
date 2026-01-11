import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { companyAPI } from '../services/api';
import { toast } from '../utils/toast';

interface SystemConfigurationProps {
  isAdmin: boolean;
}

interface CompanyFormData {
  name: string;
  gstin: string;
  pan: string;
}

const SystemConfiguration: React.FC<SystemConfigurationProps> = ({ isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    gstin: '',
    pan: '',
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const company = await companyAPI.get();
        setFormData({
          name: company.name || '',
          gstin: company.gstin || '',
          pan: company.pan || '',
        });
      } catch (error: any) {
        console.error('Failed to fetch company data:', error);
        // Set defaults if fetch fails
        setFormData({
          name: 'GROVYN ENGINEERING PRIVATE LIMITED',
          gstin: '27AABCG1234F1Z1',
          pan: 'AABCG1234F',
        });
      }
    };

    fetchCompanyData();
  }, []);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can update company settings');
      return;
    }

    setLoading(true);
    try {
      await companyAPI.update({
        name: formData.name,
        gstin: formData.gstin || undefined,
        pan: formData.pan || undefined,
      });
      toast.success('Company settings updated successfully!');
    } catch (error: any) {
      console.error('Failed to update company settings:', error);
      toast.error(error.response?.data?.error || 'Failed to update company settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Company Legal Metadata</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Registered Entity Name</label>
              <input
                disabled={!isAdmin}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold disabled:opacity-70 focus:border-teal-500 outline-none transition-all"
                placeholder="Enter registered entity name"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">GSTIN Protocol</label>
              <input
                disabled={!isAdmin}
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mono disabled:opacity-70 focus:border-teal-500 outline-none transition-all"
                placeholder="Enter GSTIN"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">PAN Node</label>
              <input
                disabled={!isAdmin}
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mono disabled:opacity-70 focus:border-teal-500 outline-none transition-all"
                placeholder="Enter PAN"
              />
            </div>
          </div>
          {isAdmin && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        <div className="bg-teal-500 p-8 rounded-2xl text-white shadow-xl shadow-teal-500/20">
          <h3 className="font-black text-lg mb-4">Architecture Mode</h3>
          <p className="text-sm font-bold opacity-80 leading-relaxed mb-8 italic">
            "Systems must be secure, compliant, and dependable over time. Quality is not an afterthought."
          </p>
          <div className="p-4 bg-white/10 rounded-xl border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Current SLA</p>
            <p className="text-xl font-black">99.9% Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;
