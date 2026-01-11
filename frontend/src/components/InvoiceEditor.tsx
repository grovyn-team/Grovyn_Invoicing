import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, EyeOff, Download, ChevronLeft, Share2 } from 'lucide-react';
import { Invoice, LineItem, InvoiceStatus, InvoiceType, Client } from '../types/refTypes';
import InvoicePreview from './InvoicePreview';
import { toast } from '../utils/toast';

interface InvoiceEditorProps {
  initialInvoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  clients: Client[];
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ initialInvoice, onSave, onCancel, clients }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice || {
    id: Math.random().toString(36).substr(2, 9),
    type: InvoiceType.TAX,
    invoiceNumber: `GRV/${new Date().getFullYear()}/INV/${Math.floor(100 + Math.random() * 899)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    serviceOptedDate: new Date().toISOString().split('T')[0],
    status: InvoiceStatus.DRAFT,
    client: clients[0] || { id: '', name: '', companyName: '', email: '', address: '', country: '', projectTitle: '', currency: '', paymentTerms: 30, status: 'Active', joinedDate: '', totalSpent: 0 },
    items: [{ id: '1', description: '', hsnSac: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, total: 0 }],
    notes: '',
    currency: 'INR',
    taxType: 'GST',
    timeline: '',
    deliverables: '',
    paymentTerms: '',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  });

  // Update invoice when initialInvoice changes
  useEffect(() => {
    if (initialInvoice) {
      setInvoice(initialInvoice);
    }
  }, [initialInvoice]);

  const calculateItemTotal = (item: LineItem) => {
    return item.quantity * item.rate * (1 - item.discount / 100);
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const newItems = invoice.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = calculateItemTotal(updated);
        return updated;
      }
      return item;
    });
    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { id: Date.now().toString(), description: '', hsnSac: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, total: 0 }]
    });
  };

  const removeItem = (id: string) => {
    if (invoice.items.length === 1) return;
    setInvoice({ ...invoice, items: invoice.items.filter(item => item.id !== id) });
  };

  const handleShare = async () => {
    const shareData = {
      title: `Invoice ${invoice.invoiceNumber}`,
      text: `Invoice ${invoice.invoiceNumber} - ${invoice.client.companyName || invoice.client.name}\nTotal: ${invoice.currency} ${invoice.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const textToCopy = `Invoice ${invoice.invoiceNumber}\nClient: ${invoice.client.companyName || invoice.client.name}\nTotal: ${invoice.currency} ${invoice.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}\n${window.location.href}`;
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Invoice details copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          const textToCopy = `Invoice ${invoice.invoiceNumber}\nClient: ${invoice.client.companyName || invoice.client.name}\nTotal: ${invoice.currency} ${invoice.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}\n${window.location.href}`;
          await navigator.clipboard.writeText(textToCopy);
          toast.success('Invoice details copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          toast.error('Unable to share invoice. Please copy the URL manually.');
        }
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {initialInvoice ? 'Modify Architecture' : 'Draft New Record'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">#{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${showPreview ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden xs:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>
          <button 
            onClick={() => onSave(invoice)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            <Save size={16} />
            Commit
          </button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-6 md:gap-8`}>
        {/* Main Editor */}
        <div className={`${showPreview ? 'hidden' : 'lg:col-span-8'} space-y-6 no-print`}>
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">01</span>
              Entity Identification
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Active Client</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={invoice.client.id}
                  onChange={e => {
                    const client = clients.find(c => c.id === e.target.value);
                    if (client) {
                      // Update client and currency, ensuring projectTitle comes from client
                      setInvoice({ 
                        ...invoice, 
                        client: { ...client, projectTitle: client.projectTitle }, 
                        currency: client.currency 
                      });
                    }
                  }}
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={invoice.type}
                  onChange={e => setInvoice({ ...invoice, type: e.target.value as InvoiceType })}
                >
                  {Object.values(InvoiceType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tax Protocol</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={invoice.taxType}
                  onChange={e => setInvoice({ ...invoice, taxType: e.target.value as 'GST' | 'EXPORT' | 'NONE' })}
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
              Deliverables
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              {invoice.items.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Description</label>
                      <input 
                        type="text"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm font-medium"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service description..."
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
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">03</span>
              Project Details
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Timeline / Delivery Schedule</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={invoice.timeline || ''}
                  onChange={e => setInvoice({ ...invoice, timeline: e.target.value })}
                  placeholder="e.g., 4-6 weeks from project kickoff"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Deliverables</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[120px] resize-y"
                  value={invoice.deliverables || ''}
                  onChange={e => setInvoice({ ...invoice, deliverables: e.target.value })}
                  placeholder="List all deliverables, e.g.,&#10;- Fully functional public website&#10;- Admin dashboard&#10;- Doctor dashboard&#10;- Backend APIs&#10;- Database schema&#10;- Deployment-ready codebase"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Payment Terms</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={invoice.paymentTerms || ''}
                  onChange={e => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                  placeholder="e.g., 50% advance, 30% after milestone, 20% on delivery"
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
                  value={invoice.discountPercentage || ''}
                  onChange={e => setInvoice({ ...invoice, discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 10 for 10% discount"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Additional Notes / Terms & Conditions</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y"
                  value={invoice.notes}
                  onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Add any additional terms, conditions, or notes..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className={`${showPreview ? 'hidden' : 'lg:col-span-4'} space-y-6 no-print`}>
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-6">Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Record ID</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none mono text-sm font-bold"
                  value={invoice.invoiceNumber}
                  onChange={e => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Dated</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                      value={invoice.issueDate}
                      onChange={e => setInvoice({ ...invoice, issueDate: e.target.value })}
                    />
                 </div>
                 <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Due</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                      value={invoice.dueDate}
                      onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                    />
                 </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Service Opted</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                  value={invoice.serviceOptedDate || ''}
                  onChange={e => setInvoice({ ...invoice, serviceOptedDate: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 p-6 md:p-8 rounded-2xl text-white shadow-2xl shadow-teal-900/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Settlement Total</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Architectural Value</span>
                <span className="mono font-bold">₹{invoice.items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</span>
              </div>
              {invoice.discountPercentage && invoice.discountPercentage > 0 && (
                <div className="flex justify-between text-xs border-t border-slate-800 pt-4">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Discount ({invoice.discountPercentage}%)</span>
                  <span className="mono font-bold text-rose-400">
                    -₹{(invoice.items.reduce((acc, i) => acc + i.total, 0) * invoice.discountPercentage / 100).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs border-t border-slate-800 pt-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Tax (Estimated)</span>
                <span className="mono font-bold text-teal-400">
                  {invoice.taxType === 'GST' ? '+18% GST' : invoice.taxType === 'EXPORT' ? '0% (Export)' : 'No Tax'}
                </span>
              </div>
              <div className="pt-6 border-t border-slate-800">
                   <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 mb-1 block">Final Value</span>
                   <span className="text-2xl md:text-3xl font-black mono tracking-tighter">
                     ₹{(() => {
                       const subtotal = invoice.items.reduce((acc, i) => acc + i.total, 0);
                       const discountAmount = invoice.discountPercentage ? (subtotal * invoice.discountPercentage / 100) : 0;
                       const afterDiscount = subtotal - discountAmount;
                       const taxMultiplier = invoice.taxType === 'GST' ? 1.18 : 1;
                       return (afterDiscount * taxMultiplier).toLocaleString();
                     })()}
                   </span>
              </div>
            </div>
          </section>
        </div>

        {/* Full Page Preview */}
        {showPreview && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="flex flex-col sm:flex-row justify-center mb-8 no-print gap-4">
               <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                 <Download size={20} />
                 Export PDF
               </button>
               <button 
                 onClick={handleShare}
                 className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
               >
                 <Share2 size={20} />
                 Share Record
               </button>
             </div>
             <InvoicePreview invoice={invoice} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceEditor;
