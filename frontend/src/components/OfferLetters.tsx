import React from 'react';
import { FileSignature, Plus } from 'lucide-react';
import { OfferLetter, OfferLetterStatus } from '../types/refTypes';

interface OfferLettersProps {
  offerLetters: OfferLetter[];
  onCreateNew: () => void;
  onEditOfferLetter: (offerLetter: OfferLetter) => void;
}

const OfferLetters: React.FC<OfferLettersProps> = ({ offerLetters, onCreateNew, onEditOfferLetter }) => {
  const sortedOfferLetters = [...offerLetters].sort((a, b) => {
    return new Date(b.offerDate).getTime() - new Date(a.offerDate).getTime();
  });

  const getStatusBadge = (status: OfferLetterStatus) => {
    return status;
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
    };
    const symbol = symbols[currency] || '₹';
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">Offer Letter Registry</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Professional employment offer management</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Offer Letter
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSignature size={20} className="text-teal-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">All Offer Letters</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Offer ID</th>
                <th className="px-8 py-5">Candidate</th>
                <th className="px-8 py-5">Position</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Offer Date</th>
                <th className="px-8 py-5 text-right">CTC</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOfferLetters.length > 0 ? (
                sortedOfferLetters.map((offerLetter) => {
                  const ctc = offerLetter.salaryDetails.baseSalary + (offerLetter.salaryDetails.variablePay || 0);
                  return (
                    <tr
                      key={offerLetter.id}
                      className="hover:bg-slate-50 group transition-colors cursor-pointer"
                      onClick={() => onEditOfferLetter(offerLetter)}
                    >
                      <td className="px-8 py-6 font-black text-slate-900 mono">{offerLetter.offerNumber}</td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-900 uppercase tracking-tight">{offerLetter.candidateName}</p>
                          <p className="text-xs text-slate-500 font-medium">{offerLetter.candidateEmail}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-700">{offerLetter.position}</p>
                        <p className="text-xs text-slate-500">{offerLetter.designation}</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600">{offerLetter.department}</td>
                      <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">{offerLetter.offerDate}</td>
                      <td className="px-8 py-6 text-right font-black text-slate-900 mono">
                        {formatCurrency(ctc, offerLetter.salaryDetails.currency)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          offerLetter.status === OfferLetterStatus.ACCEPTED 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : offerLetter.status === OfferLetterStatus.REJECTED || offerLetter.status === OfferLetterStatus.EXPIRED
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : offerLetter.status === OfferLetterStatus.SENT
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {getStatusBadge(offerLetter.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <FileSignature size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium mb-4">No offer letters found. Create your first offer letter to get started.</p>
                    <button
                      onClick={onCreateNew}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 transition-all"
                    >
                      <Plus size={16} />
                      Create Offer Letter
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

export default OfferLetters;
