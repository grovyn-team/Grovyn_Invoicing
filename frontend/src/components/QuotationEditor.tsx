import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, EyeOff, Download, ChevronLeft, Share2, Sparkles } from 'lucide-react';
import { Quotation, LineItem, QuotationStatus, Client } from '../types/refTypes';
import AIQuotationModal from './AIQuotationModal';
import { toast } from '../utils/toast';

interface QuotationEditorProps {
  initialQuotation?: Quotation;
  onSave: (quotation: Quotation) => void;
  onCancel: () => void;
  clients: Client[];
}

const QuotationEditor: React.FC<QuotationEditorProps> = ({ initialQuotation, onSave, onCancel, clients }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [quotation, setQuotation] = useState<Quotation>(initialQuotation || {
    id: Math.random().toString(36).substr(2, 9),
    quotationNumber: `GRV/${new Date().getFullYear()}/QUO/${Math.floor(100 + Math.random() * 899)}`,
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: QuotationStatus.DRAFT,
    client: clients[0] || { id: '', name: '', companyName: '', email: '', address: '', country: '', projectTitle: '', currency: '', paymentTerms: 30, status: 'Active', joinedDate: '', totalSpent: 0 },
    projectName: '',
    projectScope: '',
    features: '',
    deliverables: '',
    supportDetails: '',
    warrantyPeriod: '',
    timeline: '',
    items: [{ id: '1', description: '', hsnSac: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, total: 0 }],
    notes: '',
    terms: '',
    paymentTerms: '',
    currency: 'INR',
    taxType: 'GST',
    discountPercentage: 0,
    validityPeriod: 30,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  });

  useEffect(() => {
    if (initialQuotation) {
      setQuotation(initialQuotation);
      setAiFilledFields(new Set());
    }
  }, [initialQuotation]);

  const handleAIDraftGenerated = (draft: any) => {
    const filledFields = new Set<string>();
    
    const updatedQuotation: Quotation = {
      ...quotation,
      quotationDate: draft.quotationDate || quotation.quotationDate,
      validUntil: draft.validUntil || quotation.validUntil,
      projectName: draft.projectName || quotation.projectName,
      projectScope: draft.projectScope || quotation.projectScope,
      features: draft.features || quotation.features,
      deliverables: draft.deliverables || quotation.deliverables,
      supportDetails: draft.supportDetails || quotation.supportDetails,
      warrantyPeriod: draft.warrantyPeriod || quotation.warrantyPeriod,
      timeline: draft.timeline || quotation.timeline,
      items: draft.items?.map((item: any) => ({
        id: Date.now().toString() + Math.random(),
        description: item.description || item.name || '',
        hsnSac: item.hsnSac || '',
        quantity: item.quantity || 1,
        rate: item.unitPrice || 0,
        discount: 0,
        taxRate: item.taxRate || 18,
        total: (item.quantity || 1) * (item.unitPrice || 0),
      })) || quotation.items,
      taxType: draft.taxDetails?.taxProtocol || 'GST',
      discountPercentage: draft.discountPercentage,
      notes: draft.notes || quotation.notes,
      terms: draft.terms || quotation.terms,
      paymentTerms: draft.paymentTerms || quotation.paymentTerms,
      validityPeriod: draft.validityPeriod || 30,
    };

    if (draft.projectName) filledFields.add('projectName');
    if (draft.projectScope) filledFields.add('projectScope');
    if (draft.features) filledFields.add('features');
    if (draft.deliverables) filledFields.add('deliverables');
    if (draft.supportDetails) filledFields.add('supportDetails');
    if (draft.warrantyPeriod) filledFields.add('warrantyPeriod');
    if (draft.timeline) filledFields.add('timeline');
    if (draft.items?.length > 0) filledFields.add('items');
    if (draft.taxDetails?.taxProtocol) filledFields.add('taxType');
    if (draft.discountPercentage !== undefined) filledFields.add('discountPercentage');
    if (draft.notes) filledFields.add('notes');
    if (draft.terms) filledFields.add('terms');
    if (draft.paymentTerms) filledFields.add('paymentTerms');

    setQuotation(updatedQuotation);
    setAiFilledFields(filledFields);
    
    toast.success('Quotation form auto-filled with AI suggestions. Please review and adjust as needed.');
  };

  const currentClient = quotation.client?.id 
    ? clients.find(c => c.id === quotation.client.id) || clients[0]
    : clients[0];

  const calculateItemTotal = (item: LineItem) => {
    return item.quantity * item.rate * (1 - item.discount / 100);
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const newItems = quotation.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = calculateItemTotal(updated);
        return updated;
      }
      return item;
    });
    setQuotation({ ...quotation, items: newItems });
  };

  const addItem = () => {
    setQuotation({
      ...quotation,
      items: [...quotation.items, { id: Date.now().toString(), description: '', hsnSac: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, total: 0 }]
    });
  };

  const removeItem = (id: string) => {
    if (quotation.items.length === 1) return;
    setQuotation({ ...quotation, items: quotation.items.filter(item => item.id !== id) });
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
              {initialQuotation ? 'Modify Quotation' : 'Draft New Quotation'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">#{quotation.quotationNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!initialQuotation && currentClient && (
            <button 
              onClick={() => setShowAIModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/20"
            >
              <Sparkles size={16} />
              <span className="hidden xs:inline">AI Generate</span>
            </button>
          )}
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${showPreview ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden xs:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>
          <button 
            onClick={() => onSave(quotation)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            <Save size={16} />
            {quotation.status === QuotationStatus.DRAFT ? 'Save Draft' : 'Update'}
          </button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-6 md:gap-8`}>
        <div className={`${showPreview ? 'hidden' : 'lg:col-span-8'} space-y-6 no-print`}>
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">01</span>
              Client & Project Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Client</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={quotation.client.id}
                  onChange={e => {
                    const client = clients.find(c => c.id === e.target.value);
                    if (client) {
                      setQuotation({ 
                        ...quotation, 
                        client: { ...client, projectTitle: client.projectTitle }, 
                        currency: client.currency 
                      });
                    }
                  }}
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Project Name
                  {aiFilledFields.has('projectName') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <input 
                  type="text"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium transition-all ${
                    aiFilledFields.has('projectName') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.projectName}
                  onChange={e => {
                    setQuotation({ ...quotation, projectName: e.target.value });
                    if (aiFilledFields.has('projectName')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('projectName');
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g., QR-Based Café Operations Platform"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tax Protocol</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={quotation.taxType}
                  onChange={e => setQuotation({ ...quotation, taxType: e.target.value as 'GST' | 'EXPORT' | 'NONE' })}
                >
                  <option value="GST">Standard GST</option>
                  <option value="EXPORT">Export Zero Rated</option>
                  <option value="NONE">No GST</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">02</span>
              Project Scope & Features
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Project Scope
                  {aiFilledFields.has('projectScope') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[120px] resize-y transition-all ${
                    aiFilledFields.has('projectScope') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.projectScope || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, projectScope: e.target.value });
                    if (aiFilledFields.has('projectScope')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('projectScope');
                        return next;
                      });
                    }
                  }}
                  placeholder="Describe the overall project scope and objectives..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Features & Functionalities
                  {aiFilledFields.has('features') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[150px] resize-y transition-all ${
                    aiFilledFields.has('features') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.features || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, features: e.target.value });
                    if (aiFilledFields.has('features')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('features');
                        return next;
                      });
                    }
                  }}
                  placeholder="List all features and functionalities in detail..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Deliverables
                  {aiFilledFields.has('deliverables') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[120px] resize-y transition-all ${
                    aiFilledFields.has('deliverables') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.deliverables || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, deliverables: e.target.value });
                    if (aiFilledFields.has('deliverables')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('deliverables');
                        return next;
                      });
                    }
                  }}
                  placeholder="List all deliverables..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Support & Maintenance Details
                  {aiFilledFields.has('supportDetails') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y transition-all ${
                    aiFilledFields.has('supportDetails') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.supportDetails || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, supportDetails: e.target.value });
                    if (aiFilledFields.has('supportDetails')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('supportDetails');
                        return next;
                      });
                    }
                  }}
                  placeholder="Describe support, maintenance, and warranty details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Warranty Period
                    {aiFilledFields.has('warrantyPeriod') && (
                      <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                    )}
                  </label>
                  <input 
                    type="text"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium transition-all ${
                      aiFilledFields.has('warrantyPeriod') 
                        ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                        : 'border-slate-200'
                    }`}
                    value={quotation.warrantyPeriod || ''}
                    onChange={e => {
                      setQuotation({ ...quotation, warrantyPeriod: e.target.value });
                      if (aiFilledFields.has('warrantyPeriod')) {
                        setAiFilledFields(prev => {
                          const next = new Set(prev);
                          next.delete('warrantyPeriod');
                          return next;
                        });
                      }
                    }}
                    placeholder="e.g., 12 months"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Timeline
                    {aiFilledFields.has('timeline') && (
                      <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                    )}
                  </label>
                  <input 
                    type="text"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium transition-all ${
                      aiFilledFields.has('timeline') 
                        ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                        : 'border-slate-200'
                    }`}
                    value={quotation.timeline || ''}
                    onChange={e => {
                      setQuotation({ ...quotation, timeline: e.target.value });
                      if (aiFilledFields.has('timeline')) {
                        setAiFilledFields(prev => {
                          const next = new Set(prev);
                          next.delete('timeline');
                          return next;
                        });
                      }
                    }}
                    placeholder="e.g., 8-10 weeks"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">03</span>
              Pricing & Items
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              {quotation.items.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                        Description
                        {aiFilledFields.has('items') && (
                          <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                        )}
                      </label>
                      <input 
                        type="text"
                        className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-sm font-medium transition-all ${
                          aiFilledFields.has('items') 
                            ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                            : 'border-slate-200'
                        }`}
                        value={item.description}
                        onChange={e => {
                          updateItem(item.id, 'description', e.target.value);
                          if (aiFilledFields.has('items')) {
                            setAiFilledFields(prev => {
                              const next = new Set(prev);
                              next.delete('items');
                              return next;
                            });
                          }
                        }}
                        placeholder="Service/Item description..."
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">HSN/SAC</label>
                      <input 
                        type="text"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm font-medium mono"
                        value={item.hsnSac}
                        onChange={e => updateItem(item.id, 'hsnSac', e.target.value)}
                        placeholder="998311"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                      <input 
                        type="number"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm mono"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Rate</label>
                      <input 
                        type="number"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm mono"
                        value={item.rate}
                        onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="sm:col-span-4 text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Subtotal</p>
                      <p className="text-sm font-black text-slate-900 mono">₹{item.total.toLocaleString()}</p>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button onClick={() => removeItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addItem}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:border-teal-300 hover:text-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </section>

          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">04</span>
              Terms & Conditions
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Payment Terms
                  {aiFilledFields.has('paymentTerms') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <input 
                  type="text"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium transition-all ${
                    aiFilledFields.has('paymentTerms') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.paymentTerms || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, paymentTerms: e.target.value });
                    if (aiFilledFields.has('paymentTerms')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('paymentTerms');
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g., 50% advance, 30% after milestone, 20% on delivery"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Terms & Conditions
                  {aiFilledFields.has('terms') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[120px] resize-y transition-all ${
                    aiFilledFields.has('terms') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.terms || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, terms: e.target.value });
                    if (aiFilledFields.has('terms')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('terms');
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter terms and conditions..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Additional Notes
                  {aiFilledFields.has('notes') && (
                    <span className="ml-2 text-[8px] text-teal-500 font-bold">AI SUGGESTED</span>
                  )}
                </label>
                <textarea 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y transition-all ${
                    aiFilledFields.has('notes') 
                      ? 'border-teal-300 bg-teal-50/30 shadow-sm shadow-teal-500/10' 
                      : 'border-slate-200'
                  }`}
                  value={quotation.notes || ''}
                  onChange={e => {
                    setQuotation({ ...quotation, notes: e.target.value });
                    if (aiFilledFields.has('notes')) {
                      setAiFilledFields(prev => {
                        const next = new Set(prev);
                        next.delete('notes');
                        return next;
                      });
                    }
                  }}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Discount (%) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={quotation.discountPercentage || ''}
                  onChange={e => setQuotation({ ...quotation, discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 10 for 10% discount"
                />
              </div>
            </div>
          </section>
        </div>

        <div className={`${showPreview ? 'hidden' : 'lg:col-span-4'} space-y-6 no-print`}>
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-6">Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Quotation ID</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none mono text-sm font-bold"
                  value={quotation.quotationNumber}
                  onChange={e => setQuotation({ ...quotation, quotationNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Quotation Date</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                    value={quotation.quotationDate}
                    onChange={e => setQuotation({ ...quotation, quotationDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valid Until</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                    value={quotation.validUntil}
                    onChange={e => setQuotation({ ...quotation, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Validity Period (Days)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
                  value={quotation.validityPeriod || 30}
                  onChange={e => setQuotation({ ...quotation, validityPeriod: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-6 md:p-8 rounded-2xl text-white shadow-2xl shadow-teal-900/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Quotation Total</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Subtotal</span>
                <span className="mono font-bold">₹{quotation.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</span>
              </div>
              {quotation.discountPercentage && quotation.discountPercentage > 0 && (
                <div className="flex justify-between text-xs border-t border-slate-800 pt-4">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Discount ({quotation.discountPercentage}%)</span>
                  <span className="mono font-bold text-rose-400">
                    -₹{(quotation.items.reduce((acc, i) => acc + i.total, 0) * quotation.discountPercentage / 100).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs border-t border-slate-800 pt-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Tax (Estimated)</span>
                <span className="mono font-bold text-teal-400">
                  {quotation.taxType === 'GST' ? '+18% GST' : quotation.taxType === 'EXPORT' ? '0% (Export)' : 'No Tax'}
                </span>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 mb-1 block">Total Value</span>
                <span className="text-2xl md:text-3xl font-black mono tracking-tighter">
                  ₹{(() => {
                    const subtotal = quotation.items.reduce((acc, i) => acc + i.total, 0);
                    const discountAmount = quotation.discountPercentage ? (subtotal * quotation.discountPercentage / 100) : 0;
                    const afterDiscount = subtotal - discountAmount;
                    const taxMultiplier = quotation.taxType === 'GST' ? 1.18 : 1;
                    return (afterDiscount * taxMultiplier).toLocaleString();
                  })()}
                </span>
              </div>
            </div>
          </section>
        </div>

        {showPreview && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col sm:flex-row justify-center mb-8 no-print gap-4">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                <Download size={20} />
                Export PDF
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
              >
                <Share2 size={20} />
                Share Quotation
              </button>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-center text-slate-400 font-medium">Quotation Preview - Coming Soon</p>
            </div>
          </div>
        )}
      </div>

      {currentClient && (
        <AIQuotationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          clientId={currentClient.id}
          clientName={currentClient.companyName || currentClient.name}
          onDraftGenerated={handleAIDraftGenerated}
        />
      )}
    </div>
  );
};

export default QuotationEditor;
