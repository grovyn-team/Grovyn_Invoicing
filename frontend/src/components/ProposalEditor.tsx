import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Download, ChevronLeft, Share2, Sparkles, FileText, Info, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { Proposal, ProposalStatus, Client } from '../types/refTypes';
import AIProposalModal from './AIProposalModal';
import ProposalPreview from './ProposalPreview';
import { toast } from '../utils/toast';

interface ProposalEditorProps {
    initialProposal?: Proposal;
    onSave: (proposal: Proposal) => void;
    onCancel: () => void;
    clients: Client[];
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ initialProposal, onSave, onCancel, clients }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
    const [proposal, setProposal] = useState<Proposal>(initialProposal || {
        id: Math.random().toString(36).substr(2, 9),
        proposalNumber: `PRP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 899)}`,
        version: 'v1.0',
        proposalDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ProposalStatus.DRAFT,
        client: clients[0] || { id: '', name: '', companyName: '', email: '', address: '', country: '', projectTitle: '', currency: '', paymentTerms: 30, status: 'Active', joinedDate: '', totalSpent: 0 },
        projectName: '',
        problemStatement: '',
        solution: '',
        scope: '',
        deliverables: '',
        timelineEstimate: '',
        exclusions: '',
        nextSteps: '',
        notes: '',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
    });

    useEffect(() => {
        if (initialProposal) {
            setProposal(initialProposal);
        }
    }, [initialProposal]);

    const handleAIDraftGenerated = (draft: any) => {
        const filledFields = new Set<string>();

        const updatedProposal: Proposal = {
            ...proposal,
            projectName: draft.projectName || proposal.projectName,
            problemStatement: draft.problemStatement || proposal.problemStatement,
            solution: draft.solution || proposal.solution,
            scope: draft.scope || proposal.scope,
            deliverables: draft.deliverables || proposal.deliverables,
            timelineEstimate: draft.timelineEstimate || proposal.timelineEstimate,
            exclusions: draft.exclusions || proposal.exclusions,
            nextSteps: draft.nextSteps || proposal.nextSteps,
            version: draft.version || proposal.version,
        };

        if (draft.projectName) filledFields.add('projectName');
        if (draft.problemStatement) filledFields.add('problemStatement');
        if (draft.solution) filledFields.add('solution');
        if (draft.scope) filledFields.add('scope');
        if (draft.deliverables) filledFields.add('deliverables');
        if (draft.timelineEstimate) filledFields.add('timelineEstimate');
        if (draft.exclusions) filledFields.add('exclusions');
        if (draft.nextSteps) filledFields.add('nextSteps');

        setProposal(updatedProposal);
        setAiFilledFields(filledFields);

        toast.success('Proposal content crafted with AI. Please refine and finalize.');
    };

    const handleFieldChange = (field: keyof Proposal, value: any) => {
        setProposal(prev => ({ ...prev, [field]: value }));
        if (aiFilledFields.has(field)) {
            setAiFilledFields(prev => {
                const next = new Set(prev);
                next.delete(field);
                return next;
            });
        }
    };

    const currentClient = proposal.client?.id
        ? clients.find(c => c.id === proposal.client.id) || clients[0]
        : clients[0];

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print py-4 mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            {initialProposal ? 'Edit Proposal' : 'Draft Proposal'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">#{proposal.proposalNumber}</span>
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{proposal.version}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!initialProposal && currentClient && (
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20"
                        >
                            <Sparkles size={16} />
                            <span className="hidden xs:inline">AI Craft</span>
                        </button>
                    )}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${showPreview ? 'bg-teal-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span className="hidden xs:inline">{showPreview ? 'Edit' : 'Preview'}</span>
                    </button>
                    <button
                        onClick={() => onSave(proposal)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
                    >
                        <Save size={16} />
                        Save Proposal
                    </button>
                </div>
            </div>

            <div className={`grid ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-8`}>
                <div className={`${showPreview ? 'hidden' : 'lg:col-span-8'} space-y-8`}>
                    {/* Document Content - Google Docs Feel */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-10 md:p-16 flex-1 space-y-12">
                            {/* Header Info */}
                            <div className="border-b border-slate-100 pb-8 grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Project Entity</label>
                                        <button
                                            onClick={() => {
                                                const isManual = proposal.client?.id === 'manual';
                                                if (isManual) {
                                                    handleFieldChange('client', clients[0] || { id: '', name: '', companyName: '', email: '', address: '', country: '', projectTitle: '', currency: '', paymentTerms: 30, status: 'Active', joinedDate: '', totalSpent: 0 });
                                                } else {
                                                    handleFieldChange('client', { id: 'manual', name: '', companyName: '', email: '', address: '', country: '', projectTitle: '', currency: '', paymentTerms: 30, status: 'Active', joinedDate: '', totalSpent: 0 });
                                                }
                                            }}
                                            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-2 py-1 rounded transition-all mb-2"
                                        >
                                            {proposal.client?.id === 'manual' ? 'Select Client' : 'Manual Entry'}
                                        </button>
                                    </div>
                                    {proposal.client?.id !== 'manual' ? (
                                        <select
                                            className="w-full text-lg font-black text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0 cursor-pointer"
                                            value={proposal.client.id}
                                            onChange={e => {
                                                const client = clients.find(c => c.id === e.target.value);
                                                if (client) handleFieldChange('client', client);
                                            }}
                                        >
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full text-lg font-black text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                            value={proposal.client.companyName || proposal.client.name}
                                            onChange={e => {
                                                handleFieldChange('client', { ...proposal.client, name: e.target.value, companyName: e.target.value });
                                            }}
                                            placeholder="Client Name"
                                        />
                                    )}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Project Title</label>
                                        <input
                                            type="text"
                                            className={`w-full text-2xl font-black text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 ${aiFilledFields.has('projectName') ? 'bg-indigo-50 px-2 rounded -mx-2' : ''}`}
                                            value={proposal.projectName}
                                            onChange={e => handleFieldChange('projectName', e.target.value)}
                                            placeholder="e.g., Next-Gen E-commerce Architecture"
                                        />
                                    </div>
                                </div>
                                <div className="text-right space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Version Control</label>
                                        <input
                                            type="text"
                                            className="text-right text-lg font-black text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0 w-24"
                                            value={proposal.version}
                                            onChange={e => handleFieldChange('version', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Issue Date</label>
                                        <input
                                            type="date"
                                            className="text-right text-sm font-bold text-slate-600 bg-transparent outline-none border-none p-0 focus:ring-0"
                                            value={proposal.proposalDate}
                                            onChange={e => handleFieldChange('proposalDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Problem Statement */}
                            <section className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">01. Problem Statement</h3>
                                    {aiFilledFields.has('problemStatement') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </div>
                                <textarea
                                    className={`w-full min-h-[120px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none transition-all ${aiFilledFields.has('problemStatement') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                    value={proposal.problemStatement}
                                    onChange={e => handleFieldChange('problemStatement', e.target.value)}
                                    placeholder="Describe the challenges the client is facing..."
                                />
                            </section>

                            {/* Solution */}
                            <section className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <CheckCircle size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">02. Proposed Solution</h3>
                                    {aiFilledFields.has('solution') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </div>
                                <textarea
                                    className={`w-full min-h-[180px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none transition-all ${aiFilledFields.has('solution') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                    value={proposal.solution}
                                    onChange={e => handleFieldChange('solution', e.target.value)}
                                    placeholder="Describe how your proposed system/service will solve their problems..."
                                />
                            </section>

                            {/* Scope */}
                            <section className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                        <Info size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">03. High-Level Scope</h3>
                                    {aiFilledFields.has('scope') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </div>
                                <textarea
                                    className={`w-full min-h-[150px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none transition-all ${aiFilledFields.has('scope') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                    value={proposal.scope}
                                    onChange={e => handleFieldChange('scope', e.target.value)}
                                    placeholder="Define the boundaries of the project..."
                                />
                            </section>

                            {/* Deliverables */}
                            <section className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">04. Deliverables</h3>
                                    {aiFilledFields.has('deliverables') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </div>
                                <textarea
                                    className={`w-full min-h-[150px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none transition-all ${aiFilledFields.has('deliverables') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                    value={proposal.deliverables}
                                    onChange={e => handleFieldChange('deliverables', e.target.value)}
                                    placeholder="List the key outputs/deliverables..."
                                />
                            </section>

                            {/* Timeline & Exclusions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                                <section className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        Timeline Estimate
                                        {aiFilledFields.has('timelineEstimate') && (
                                            <span className="text-[8px] font-bold text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded">AI</span>
                                        )}
                                    </h3>
                                    <textarea
                                        className={`w-full min-h-[100px] text-sm leading-relaxed text-slate-600 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none ${aiFilledFields.has('timelineEstimate') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                        value={proposal.timelineEstimate}
                                        onChange={e => handleFieldChange('timelineEstimate', e.target.value)}
                                        placeholder="e.g., 8-12 weeks..."
                                    />
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        What's NOT Included
                                        {aiFilledFields.has('exclusions') && (
                                            <span className="text-[8px] font-bold text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded">AI</span>
                                        )}
                                    </h3>
                                    <textarea
                                        className={`w-full min-h-[100px] text-sm leading-relaxed text-slate-600 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none ${aiFilledFields.has('exclusions') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                        value={proposal.exclusions}
                                        onChange={e => handleFieldChange('exclusions', e.target.value)}
                                        placeholder="Clearly list items out of scope to avoid future disputes..."
                                    />
                                </section>
                            </div>

                            {/* Next Steps */}
                            <section className="space-y-4 pt-8 border-t border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <HelpCircle size={18} className="text-teal-500" />
                                    Next Steps
                                    {aiFilledFields.has('nextSteps') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </h3>
                                <textarea
                                    className={`w-full min-h-[100px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none transition-all ${aiFilledFields.has('nextSteps') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}
                                    value={proposal.nextSteps || ''}
                                    onChange={e => handleFieldChange('nextSteps', e.target.value)}
                                    placeholder="How do we proceed after reviewing this document?"
                                />
                            </section>
                        </div>
                    </div>
                </div>

                <div className={`${showPreview ? 'hidden' : 'lg:col-span-4'} space-y-6`}>
                    {/* Guidelines Card */}
                    <section className="bg-slate-900 p-8 rounded-xl text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-400 mb-6">Execution Strategy</h3>
                        <ul className="space-y-4 text-xs">
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded bg-primary-500/20 text-primary-300 flex items-center justify-center shrink-0">W</span>
                                <p><span className="font-bold text-white">WHY & WHAT:</span> This proposal answers why they need it and what they get.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">V</span>
                                <p><span className="font-bold text-white">Value Focus:</span> Focus on outcomes rather than just features.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">E</span>
                                <p><span className="font-bold text-white">Avoid Fights:</span> Be explicit with exclusions to manage expectations.</p>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-6">Document Controls</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valid Until</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-indigo-500 transition-all"
                                    value={proposal.validUntil}
                                    onChange={e => handleFieldChange('validUntil', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Internal Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium min-h-[100px] focus:border-indigo-500 transition-all"
                                    value={proposal.notes || ''}
                                    onChange={e => handleFieldChange('notes', e.target.value)}
                                    placeholder="Private notes (not visible in PDF)"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {showPreview && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex flex-col sm:flex-row justify-center mb-8 no-print gap-4">
                            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                                <Download size={20} />
                                Download PDF
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <Share2 size={20} />
                                Copy Share Link
                            </button>
                        </div>
                        <ProposalPreview proposal={proposal} />
                    </div>
                )}
            </div>

            {proposal.client && (
                <AIProposalModal
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                    clientId={proposal.client.id !== 'manual' ? proposal.client.id : undefined}
                    clientName={proposal.client.companyName || proposal.client.name || 'Potential Client'}
                    onDraftGenerated={handleAIDraftGenerated}
                />
            )}
        </div>
    );
};

export default ProposalEditor;
