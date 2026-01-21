import React, { useState } from 'react';
import { Plus, Search, FileText, ChevronRight, FileEdit, Trash2 } from 'lucide-react';
import { Proposal, ProposalStatus } from '../types/refTypes';
import { formatDateDDMonYYYY } from '../utils/dateFormat';

interface ProposalsProps {
  proposals: Proposal[];
  onCreateNew: () => void;
  onEditProposal: (proposal: Proposal) => void;
}

const Proposals: React.FC<ProposalsProps> = ({ proposals, onCreateNew, onEditProposal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">DRAFT</span>;
      case ProposalStatus.SENT:
        return <span className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-600 text-[10px] font-bold">SENT</span>;
      case ProposalStatus.ACCEPTED:
        return <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-600 text-[10px] font-bold">ACCEPTED</span>;
      case ProposalStatus.REJECTED:
        return <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-600 text-[10px] font-bold">REJECTED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
              <FileText size={20} />
            </div>
            Sales Proposals
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Design docs & value propositions for clients</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={18} />
          Create New Proposal
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search proposals, clients, or projects..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['all', 'draft', 'sent', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${statusFilter === status
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProposals.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="group p-6 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {proposal.client.id ? (
                      <span className="text-xl font-black text-slate-300 uppercase">{proposal.client.companyName?.[0] || 'P'}</span>
                    ) : (
                      <FileText className="text-slate-300" size={24} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                        {proposal.projectName || 'Untitled Proposal'}
                      </h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><ChevronRight size={12} className="text-primary-500" /> {proposal.client.companyName}</span>
                      <span className="flex items-center gap-1.5 text-slate-300">|</span>
                      <span className="flex items-center gap-1.5 uppercase tracking-widest">{proposal.proposalNumber}</span>
                      <span className="flex items-center gap-1.5 text-slate-300">|</span>
                      <span className="flex items-center gap-1.5">{proposal.version}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{formatDateDDMonYYYY(proposal.proposalDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditProposal(proposal)}
                      className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Proposal"
                    >
                      <FileEdit size={18} />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="text-slate-200" size={40} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">No proposals found</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">
                Draft your first value-driven proposal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;