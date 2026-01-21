import React from 'react';
import { Plus, FileText, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types/refTypes';

interface DashboardProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEditInvoice: (invoice: Invoice) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onCreateNew, onEditInvoice }) => {
  // Calculate invoice total after discounts and taxes
  const getInvoiceTotal = (invoice: Invoice): number => {
    // Calculate subtotal from items
    const subtotal = invoice.items.reduce((acc, item) => acc + item.total, 0);
    
    // Apply invoice-level discount if exists
    const discountPercentage = invoice.discountPercentage || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Calculate tax based on tax type
    let taxMultiplier = 1;
    if (invoice.taxType === 'GST') {
      // Calculate average tax rate from items, default to 18% if no items
      const avgTaxRate = invoice.items.length > 0 
        ? invoice.items.reduce((sum, item) => sum + (item.taxRate || 18), 0) / invoice.items.length
        : 18;
      taxMultiplier = 1 + (avgTaxRate / 100); // e.g., 1.18 for 18% GST
    } else if (invoice.taxType === 'EXPORT' || invoice.taxType === 'NONE') {
      taxMultiplier = 1; // No tax
    }
    
    // Final total after discount and tax
    const finalTotal = subtotalAfterDiscount * taxMultiplier;
    
    return finalTotal;
  };

  // Calculate metrics from real invoice data
  const grossRevenue = invoices.reduce((acc, inv) => acc + getInvoiceTotal(inv), 0);
  const collections = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((acc, inv) => acc + getInvoiceTotal(inv), 0);
  const inProcess = invoices
    .filter(inv => inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.PARTIAL || inv.status === InvoiceStatus.DRAFT)
    .reduce((acc, inv) => acc + getInvoiceTotal(inv), 0);
  const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE);
  const riskProfile = overdueInvoices.length;

  // Calculate conversion rate (collections / gross revenue)
  const conversionRate = grossRevenue > 0 ? Math.round((collections / grossRevenue) * 100) : 0;

  // Calculate average TAT (Turnaround Time) - placeholder calculation
  const avgTAT = 12; // This could be calculated from actual payment dates if available

  // Calculate month-over-month change (placeholder - would need historical data)
  const monthOverMonthChange = 8.2; // This would need to be calculated from previous month's data

  // Sort invoices by issue date (newest first) for the ledger
  const sortedInvoices = [...invoices].sort((a, b) => {
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Financial Suite</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Enterprise resource oversight for GROVYN architectures</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-teal-600" />
            </div>
            <div className={`text-xs font-bold ${monthOverMonthChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange}%
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter mono">₹{grossRevenue.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-2">VS LAST MONTH</p>
        </div>

        {/* Collections */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Collections</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter mono">₹{collections.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-2">{conversionRate}% CONVERSION</p>
        </div>

        {/* In-Process */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In-Process</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter mono">₹{inProcess.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-2">AVG. {avgTAT} DAYS TAT</p>
        </div>

        {/* Risk Profile */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-rose-600" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Profile</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter mono">{riskProfile}</p>
          <p className="text-[9px] text-slate-500 font-medium mt-2">{riskProfile === 0 ? 'NO' : ''} CRITICAL ITEMS</p>
        </div>
      </div>

      {/* Financial Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-teal-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Financial Ledger</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">REAL-TIME</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">SYNCED</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Record Index</th>
                <th className="px-8 py-5">Verified Entity</th>
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
                    <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">{invoice.issueDate}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 mono">₹{getInvoiceTotal(invoice).toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        invoice.status === InvoiceStatus.PAID 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : invoice.status === InvoiceStatus.OVERDUE
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PARTIAL
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium italic">No fiscal records discovered.</p>
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

export default Dashboard;
