import React from 'react';
import { Proposal, ProposalStatus } from '../types/refTypes';

interface ProposalsProps {
  proposals: Proposal[];
  onCreateNew: () => void;
  onEditProposal: (proposal: Proposal) => void;
}

const Proposals: React.FC<ProposalsProps> = ({ proposals, onCreateNew, onEditProposal }: ProposalsProps) => {
  const sortedProposals = [...proposals].sort((a, b) => {
    return new Date(b.proposalDate).getTime() - new Date(a.proposalDate).getTime();
  });

  const getStatusBadge = (status: ProposalStatus) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Proposals</h1>
        </div>
      </div>
    </div>
  )
}

export default Proposals