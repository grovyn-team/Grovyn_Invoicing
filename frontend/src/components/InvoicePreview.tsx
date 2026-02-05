import React from 'react';
import { Invoice } from '../types/refTypes';
import { COMPANY_DEFAULTS } from '../constants';
import { numberToWords } from '../utils/numberToWords';
import { formatDateDDMonYYYY } from '../utils/dateFormat';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const subtotal = invoice.items.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = invoice.discountPercentage ? (subtotal * invoice.discountPercentage / 100) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;

  let taxLines: { label: string; value: number }[] = [];

  if (invoice.taxType === 'GST') {
    const isDomestic = (invoice.client.country || 'India').toLowerCase() === 'india';
    const isIntraState = isDomestic && invoice.client.state === COMPANY_DEFAULTS.state;

    taxLines = isDomestic ? (
      isIntraState ? [
        { label: 'CGST (9%)', value: subtotalAfterDiscount * 0.09 },
        { label: 'SGST (9%)', value: subtotalAfterDiscount * 0.09 }
      ] : [
        { label: 'IGST (18%)', value: subtotalAfterDiscount * 0.18 }
      ]
    ) : [];
  } else if (invoice.taxType === 'EXPORT') {
    taxLines = [];
  } else {
    taxLines = [];
  }

  const totalTax = taxLines.reduce((acc, t) => acc + t.value, 0);
  const total = subtotalAfterDiscount + totalTax;

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl lg:bg-transparent lg:rounded-none">
      <div className="bg-white p-6 md:p-12 shadow-2xl border border-slate-200 rounded-sm min-w-[700px] lg:min-w-0 w-full max-w-4xl mx-auto print:shadow-none print:border-none print:m-0 print:p-8 text-slate-800">
        <div className="flex justify-between items-start mb-12 border-b-4 border-teal-500 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden shrink-0">
                <img src="/grovyn.png" alt="GROVYN" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl md:text-3xl ml-[-10px] font-black tracking-tighter">{COMPANY_DEFAULTS.name}</span>
            </div>
            <div className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold max-w-xs">
              <p>{COMPANY_DEFAULTS.address}</p>
              <p className="mt-1">Udyam RN: {COMPANY_DEFAULTS.gstin}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tighter">Invoice</h1>
            <div className="space-y-1">
              <p className="text-sm font-bold bg-slate-100 px-3 py-1 rounded inline-block">#{invoice.invoiceNumber}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">DATED {invoice.issueDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:gap-16 mb-12">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Recipient Information</h2>
            <div className="space-y-1">
              <p className="font-black text-base md:text-lg text-slate-900 uppercase tracking-tight">{invoice.client.companyName}</p>
              <p className="text-sm font-bold text-slate-600">{invoice.client.name}</p>
              <p className="text-[13px] text-slate-500 whitespace-pre-line leading-snug">{invoice.client.address}</p>
              {invoice.client.gstin && <p className="text-xs font-bold text-teal-600 mt-2">GSTIN: {invoice.client.gstin}</p>}
            </div>
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Project</h2>
            <div className="space-y-1">
              <p className="text-slate-900 font-bold uppercase tracking-tight text-sm md:text-base">{invoice.client.projectTitle}</p>
              {invoice.serviceOptedDate && (
                <p className="text-xs text-slate-500">Service Opted: {formatDateDDMonYYYY(invoice.serviceOptedDate)}</p>
              )}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Payment Due</p>
                  <p className="text-xs md:text-sm font-black text-rose-500">{invoice.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol</p>
                  <p className="text-xs md:text-sm font-black text-teal-600">{invoice.status.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead className="bg-slate-50">
            <tr className="border-b-2 border-slate-200">
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">S.No</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Rate</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-5 text-sm font-bold text-slate-400">{index + 1}</td>
                <td className="px-4 py-5 text-sm font-black text-slate-800">{item.description}</td>
                <td className="px-4 py-5 text-sm text-right text-slate-500 mono">{item.rate.toLocaleString()}</td>
                <td className="px-4 py-5 text-sm font-bold text-right text-slate-900 mono">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1 w-full">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Amount In Words</h3>
              <p className="text-sm font-black text-slate-800 leading-tight uppercase">{numberToWords(total, invoice.currency || 'INR')}</p>
            </div>
          </div>
          <div className="w-full md:w-72 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Subtotal</span>
              <span className="text-slate-900 font-bold mono">₹{subtotal.toLocaleString()}</span>
            </div>
            {invoice.discountPercentage && invoice.discountPercentage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Discount ({invoice.discountPercentage}%)</span>
                <span className="text-slate-900 font-bold mono text-rose-600">-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            {taxLines.map(tax => (
              <div key={tax.label} className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{tax.label}</span>
                <span className="text-slate-900 font-bold mono">₹{tax.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
              <span className="text-base font-black text-slate-900 uppercase tracking-tight">Total Payable</span>
              <span className="text-xl md:text-2xl font-black text-teal-600 mono">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {(invoice.timeline || invoice.deliverables || invoice.paymentTerms) && (
          <div className="mb-12 pt-8 border-t border-slate-200 space-y-6">
            {invoice.timeline && (
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Timeline / Delivery Schedule</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{invoice.timeline}</p>
              </div>
            )}

            {invoice.deliverables && (
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Deliverables</h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{invoice.deliverables}</div>
              </div>
            )}

            {invoice.paymentTerms && (
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Payment Terms</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{invoice.paymentTerms}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100 text-[10px] leading-relaxed">
          <div className="space-y-4">
            <section>
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2">Banking Logistics</h3>
              <p className="font-bold text-slate-700">NAME: Aman K.A</p>
              <p>BANK: {COMPANY_DEFAULTS.bankDetails.bankName}</p>
              <p>A/C: {COMPANY_DEFAULTS.bankDetails.accountNumber}</p>
              <p>IFSC: {COMPANY_DEFAULTS.bankDetails.ifsc}</p>
              <p>BRANCH: {COMPANY_DEFAULTS.bankDetails.branch}</p>
              <p>UPI ID: {COMPANY_DEFAULTS.bankDetails.upiId}</p>
            </section>
            <section>
              <a href='https://grovyn.in/terms'>
                <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2">*Terms & Conditions Applied</h3>
                <p className="whitespace-pre-line">{invoice.notes}</p>
              </a>
            </section>
          </div>
          <div className="text-right flex flex-col justify-end items-end">
            <div className="w-full">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Authorized Signatory</p>
              <div className="mb-2 flex justify-end">
                <img src="/signature.png" alt="Signature" className="h-12 object-contain" />
              </div>
              <div className="w-48 border-b-2 border-slate-900 ml-auto mb-2"></div>
              <p className="font-bold text-slate-400 uppercase tracking-widest">{COMPANY_DEFAULTS.designation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
