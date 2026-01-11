import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Invoice } from '../types/refTypes';
import Badge from './Badge';

interface InvoicesProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEditInvoice: (invoice: Invoice) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, onCreateNew, onEditInvoice }) => {
  // Calculate invoice totals
  const getInvoiceTotal = (invoice: Invoice): number => {
    return invoice.items.reduce((acc, item) => acc + item.total, 0);
  };

  // Sort invoices by issue date (newest first)
  const sortedInvoices = [...invoices].sort((a, b) => {
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Invoice Registry</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Comprehensive fiscal record management system</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-teal-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">All Invoices</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Record Index</th>
                <th className="px-8 py-5">Verified Entity</th>
                <th className="px-8 py-5">Project</th>
                <th className="px-8 py-5">Temporal Index</th>
                <th className="px-8 py-5 text-right">Fiscal Input</th>
                <th className="px-8 py-5 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50 group transition-colors cursor-pointer"
                    onClick={() => onEditInvoice(invoice)}
                  >
                    <td className="px-8 py-6 font-black text-slate-900 mono">{invoice.invoiceNumber}</td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-900 uppercase tracking-tight">{invoice.client.companyName}</p>
                        <p className="text-xs text-slate-500 font-medium">{invoice.client.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{invoice.client.projectTitle}</p>
                    </td>
                    <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">{invoice.issueDate}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 mono">₹{getInvoiceTotal(invoice).toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                      <Badge status={invoice.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium italic mb-4">No invoices found. Create your first invoice to get started.</p>
                    <button
                      onClick={onCreateNew}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 transition-all"
                    >
                      <Plus size={16} />
                      Create Invoice
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

export default Invoices;
