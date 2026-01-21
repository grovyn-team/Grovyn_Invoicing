import React from 'react';
import { FileCheck, Plus } from 'lucide-react';
import { Quotation, QuotationStatus } from '../types/refTypes';

interface QuotationsProps {
  quotations: Quotation[];
  onCreateNew: () => void;
  onEditQuotation: (quotation: Quotation) => void;
}

const Quotations: React.FC<QuotationsProps> = ({ quotations, onCreateNew, onEditQuotation }) => {
  const getQuotationTotal = (quotation: Quotation): number => {
    const subtotal = quotation.items.reduce((acc, item) => acc + item.total, 0);
    const discountPercentage = quotation.discountPercentage || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    let taxMultiplier = 1;
    if (quotation.taxType === 'GST') {
      const avgTaxRate = quotation.items.length > 0 
        ? quotation.items.reduce((sum, item) => sum + (item.taxRate || 18), 0) / quotation.items.length
        : 18;
      taxMultiplier = 1 + (avgTaxRate / 100);
    }
    
    return subtotalAfterDiscount * taxMultiplier;
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
    return new Date(b.quotationDate).getTime() - new Date(a.quotationDate).getTime();
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'DRAFT',
      'sent': 'SENT',
      'accepted': 'ACCEPTED',
      'rejected': 'REJECTED',
      'expired': 'EXPIRED',
      'converted': 'CONVERTED',
    };
    return statusMap[status] || status.toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Quotation Registry</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Professional IT software quotation management</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Quotation
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCheck size={20} className="text-teal-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">All Quotations</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Record Index</th>
                <th className="px-8 py-5">Verified Entity</th>
                <th className="px-8 py-5">Project</th>
                <th className="px-8 py-5">Quotation Date</th>
                <th className="px-8 py-5">Valid Until</th>
                <th className="px-8 py-5 text-right">Fiscal Input</th>
                <th className="px-8 py-5 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedQuotations.length > 0 ? (
                sortedQuotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="hover:bg-slate-50 group transition-colors cursor-pointer"
                    onClick={() => onEditQuotation(quotation)}
                  >
                    <td className="px-8 py-6 font-black text-slate-900 mono">{quotation.quotationNumber}</td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-900 uppercase tracking-tight">{quotation.client.companyName}</p>
                        <p className="text-xs text-slate-500 font-medium">{quotation.client.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{quotation.projectName}</p>
                    </td>
                    <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">{quotation.quotationDate}</td>
                    <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">{quotation.validUntil}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 mono">₹{getQuotationTotal(quotation).toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        quotation.status === QuotationStatus.ACCEPTED 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : quotation.status === QuotationStatus.REJECTED || quotation.status === QuotationStatus.EXPIRED
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : quotation.status === QuotationStatus.SENT
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : quotation.status === QuotationStatus.CONVERTED
                          ? 'bg-teal-50 text-teal-600 border-teal-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {getStatusBadge(quotation.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <FileCheck size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium mb-4">No quotations found. Create your first quotation to get started.</p>
                    <button
                      onClick={onCreateNew}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 transition-all"
                    >
                      <Plus size={16} />
                      Create Quotation
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Quotations;
