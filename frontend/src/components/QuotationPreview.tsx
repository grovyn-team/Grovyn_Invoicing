import React from 'react';
import { Quotation } from '../types/refTypes';
import { formatDateDDMonYYYY } from '../utils/dateFormat';

interface QuotationPreviewProps {
    quotation: Quotation;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ quotation }) => {
    const subtotal = quotation.items.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = (subtotal * (quotation.discountPercentage || 0)) / 100;
    const totalAfterDiscount = subtotal - discountAmount;

    // Calculate tax based on protocol
    let taxAmount = 0;
    if (quotation.taxType === 'GST') {
        const avgTaxRate = quotation.items.length > 0
            ? quotation.items.reduce((sum, item) => sum + (item.taxRate || 18), 0) / quotation.items.length
            : 18;
        taxAmount = (totalAfterDiscount * avgTaxRate) / 100;
    }

    const grandTotal = totalAfterDiscount + taxAmount;

    return (
        <div className="w-full overflow-x-auto bg-slate-50 p-4 md:p-8 lg:bg-transparent lg:p-0 print:overflow-visible print:m-0 print:p-0 print:bg-white">
            <div className="bg-white p-6 md:p-12 shadow-2xl border border-slate-100 min-w-[700px] lg:min-w-0 w-full max-w-4xl mx-auto print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none text-slate-800 font-sans" style={{ height: 'auto', minHeight: 'auto' } as React.CSSProperties}>

                {/* Header */}
                <div className="flex justify-between items-start mb-16 pb-8 border-b-2 border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 flex items-center justify-center">
                            <img src="/grovyn.png" alt="G" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">GROVYN</h1>
                            {/* <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Innovation Lab</p> */}
                        </div>
                    </div>

                    <div className="text-right">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Quotation</h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">#{quotation.quotationNumber}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Partner</p>
                            <h3 className="text-lg font-black text-slate-900">{quotation.client.companyName}</h3>
                            <p className="text-sm font-medium text-slate-500">{quotation.client.name}</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">{quotation.client.address}</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-right">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</p>
                            <h3 className="text-lg font-black text-slate-900">{quotation.projectName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                <p className="text-xs font-bold text-slate-900">{formatDateDDMonYYYY(quotation.quotationDate)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                                <p className="text-xs font-bold text-slate-900">{formatDateDDMonYYYY(quotation.validUntil)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 bg-slate-50">
                                <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</th>
                                <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
                                <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 group">
                                    <td className="py-5 px-2">
                                        <p className="text-sm font-bold text-slate-900">{item.description}</p>
                                        {item.hsnSac && <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">HSN/SAC: {item.hsnSac}</p>}
                                    </td>
                                    <td className="py-5 px-2 text-sm font-medium text-slate-600 text-center">{item.quantity}</td>
                                    <td className="py-5 px-2 text-sm font-medium text-slate-600 text-right">{item.rate.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</td>
                                    <td className="py-5 px-2 text-sm font-bold text-slate-900 text-right">{item.total.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-xs font-medium text-rose-500">
                                <span>Discount ({quotation.discountPercentage}%)</span>
                                <span>-{discountAmount.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</span>
                            </div>
                        )}
                        {taxAmount > 0 && (
                            <div className="flex justify-between text-xs font-medium text-slate-500">
                                <span>{quotation.taxType} (Avg Tax)</span>
                                <span>{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t-2 border-slate-900 flex justify-between">
                            <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                            <span className="text-lg font-black text-slate-900">{grandTotal.toLocaleString('en-IN', { style: 'currency', currency: quotation.currency || 'INR' })}</span>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="grid grid-cols-2 gap-12 mb-16 pt-12 border-t border-slate-100">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</h4>
                        <div className="text-[10px] leading-relaxed text-slate-500 whitespace-pre-wrap">
                            {quotation.terms || '1. Payments are due as per agreed milestones.\n2. Quotation is valid for 30 days from the date of issue.\n3. Taxes are calculated as per prevailing laws.'}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Schedule</h4>
                        <p className="text-[10px] font-bold text-slate-700">{quotation.paymentTerms || 'As negotiated'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end pt-12 border-t-2 border-slate-900 mt-12">
                    {/* <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated By</p>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{quotation.createdBy}</p>
                    </div> */}
                    <div className="text-right">
                        <div className="inline-block text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authorized Signature</p>
                            <div className="w-48 h-12 mb-2 ml-auto overflow-hidden opacity-80">
                                <img src="/signature.png" alt="Signature" className="h-full object-contain ml-auto" />
                            </div>
                            <div className="w-56 border-b-2 border-slate-900 ml-auto mb-2"></div>
                            <p className="font-black text-slate-900">Aman K.A</p>
                            <p className="text-xs font-black text-teal-600 uppercase tracking-widest"> Director's Office, Grovyn</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default QuotationPreview;
