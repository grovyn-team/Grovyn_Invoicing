import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Eye, EyeOff, Download, ChevronLeft, Share2, Sparkles, FileText, Info, CheckCircle, AlertTriangle, HelpCircle, Upload } from 'lucide-react';
import { Proposal, ProposalStatus, Client } from '../types/refTypes';
import AIProposalModal from './AIProposalModal';
import ProposalPreview from './ProposalPreview';
import { toast } from '../utils/toast';
import { MarkdownSectionData, normalizeToHtml, parseMarkdownToProposalSections, sanitizeProposalHtml } from '../utils/proposalRichText';

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
    const markdownFileInputRef = useRef<HTMLInputElement | null>(null);
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
            setProposal({
                ...initialProposal,
                problemStatement: normalizeToHtml(initialProposal.problemStatement),
                solution: normalizeToHtml(initialProposal.solution),
                scope: normalizeToHtml(initialProposal.scope),
                deliverables: normalizeToHtml(initialProposal.deliverables),
                timelineEstimate: normalizeToHtml(initialProposal.timelineEstimate),
                exclusions: normalizeToHtml(initialProposal.exclusions),
                nextSteps: normalizeToHtml(initialProposal.nextSteps),
            });
        }
    }, [initialProposal]);

    useEffect(() => {
        if (!initialProposal) {
            setProposal((prev) => ({
                ...prev,
                problemStatement: normalizeToHtml(prev.problemStatement),
                solution: normalizeToHtml(prev.solution),
                scope: normalizeToHtml(prev.scope),
                deliverables: normalizeToHtml(prev.deliverables),
                timelineEstimate: normalizeToHtml(prev.timelineEstimate),
                exclusions: normalizeToHtml(prev.exclusions),
                nextSteps: normalizeToHtml(prev.nextSteps),
            }));
        }
    }, [initialProposal]);

    const handleAIDraftGenerated = (draft: any) => {
        const filledFields = new Set<string>();

        const updatedProposal: Proposal = {
            ...proposal,
            projectName: draft.projectName || proposal.projectName,
            problemStatement: draft.problemStatement ? normalizeToHtml(draft.problemStatement) : proposal.problemStatement,
            solution: draft.solution ? normalizeToHtml(draft.solution) : proposal.solution,
            scope: draft.scope ? normalizeToHtml(draft.scope) : proposal.scope,
            deliverables: draft.deliverables ? normalizeToHtml(draft.deliverables) : proposal.deliverables,
            timelineEstimate: draft.timelineEstimate ? normalizeToHtml(draft.timelineEstimate) : proposal.timelineEstimate,
            exclusions: draft.exclusions ? normalizeToHtml(draft.exclusions) : proposal.exclusions,
            nextSteps: draft.nextSteps ? normalizeToHtml(draft.nextSteps) : proposal.nextSteps,
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

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'clean'],
        ],
    }), []);

    const quillFormats = [
        'header',
        'bold',
        'italic',
        'underline',
        'blockquote',
        'list',
        'bullet',
        'align',
        'link',
    ];

    const handleMarkdownImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.md') && file.type !== 'text/markdown') {
            toast.error('Please select a valid .md file.');
            return;
        }

        try {
            const markdownContent = await file.text();
            const parsedSections: MarkdownSectionData = parseMarkdownToProposalSections(markdownContent);

            setProposal((prev) => ({
                ...prev,
                projectName: parsedSections.projectName || prev.projectName,
                problemStatement: parsedSections.problemStatement || prev.problemStatement,
                solution: parsedSections.solution || prev.solution,
                scope: parsedSections.scope || prev.scope,
                deliverables: parsedSections.deliverables || prev.deliverables,
                timelineEstimate: parsedSections.timelineEstimate || prev.timelineEstimate,
                exclusions: parsedSections.exclusions || prev.exclusions,
                nextSteps: parsedSections.nextSteps || prev.nextSteps,
            }));
            toast.success('Markdown imported. Review and refine before export.');
        } catch (error) {
            console.error('Failed to import markdown file', error);
            toast.error('Unable to import markdown file.');
        } finally {
            event.target.value = '';
        }
    };

    const richTextSections: Array<{ id: keyof Proposal; title: string; icon: React.ReactNode; placeholder: string; minHeightClass: string }> = [
        {
            id: 'problemStatement',
            title: '01. Problem Statement',
            icon: <AlertTriangle size={18} />,
            placeholder: 'Describe the challenges the client is facing...',
            minHeightClass: 'min-h-[160px]',
        },
        {
            id: 'solution',
            title: '02. Proposed Solution',
            icon: <CheckCircle size={18} />,
            placeholder: 'Describe how your proposed system/service will solve their problems...',
            minHeightClass: 'min-h-[200px]',
        },
        {
            id: 'scope',
            title: '03. High-Level Scope',
            icon: <Info size={18} />,
            placeholder: 'Define the boundaries of the project...',
            minHeightClass: 'min-h-[180px]',
        },
        {
            id: 'deliverables',
            title: '04. Deliverables',
            icon: <FileText size={18} />,
            placeholder: 'List the key outputs/deliverables...',
            minHeightClass: 'min-h-[180px]',
        },
        {
            id: 'timelineEstimate',
            title: 'Timeline Estimate',
            icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
            placeholder: 'e.g., 8-12 weeks, milestone-wise delivery...',
            minHeightClass: 'min-h-[120px]',
        },
        {
            id: 'exclusions',
            title: "What's NOT Included",
            icon: <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />,
            placeholder: 'Clearly list out-of-scope items...',
            minHeightClass: 'min-h-[120px]',
        },
        {
            id: 'nextSteps',
            title: 'Next Steps',
            icon: <HelpCircle size={18} className="text-teal-500" />,
            placeholder: 'How do we proceed after reviewing this document?',
            minHeightClass: 'min-h-[120px]',
        },
    ];

    const handleSave = () => {
        onSave({
            ...proposal,
            problemStatement: sanitizeProposalHtml(normalizeToHtml(proposal.problemStatement)),
            solution: sanitizeProposalHtml(normalizeToHtml(proposal.solution)),
            scope: sanitizeProposalHtml(normalizeToHtml(proposal.scope)),
            deliverables: sanitizeProposalHtml(normalizeToHtml(proposal.deliverables)),
            timelineEstimate: sanitizeProposalHtml(normalizeToHtml(proposal.timelineEstimate)),
            exclusions: sanitizeProposalHtml(normalizeToHtml(proposal.exclusions)),
            nextSteps: sanitizeProposalHtml(normalizeToHtml(proposal.nextSteps)),
        });
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
                        onClick={handleSave}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
                    >
                        <Save size={16} />
                        Save Proposal
                    </button>
                    <button
                        onClick={() => markdownFileInputRef.current?.click()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    >
                        <Upload size={16} />
                        <span className="hidden xs:inline">Import .md</span>
                    </button>
                    <input
                        ref={markdownFileInputRef}
                        type="file"
                        accept=".md,text/markdown"
                        className="hidden"
                        onChange={handleMarkdownImport}
                    />
                </div>
            </div>

            <div className={`grid ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-8`}>
                <div className={`${showPreview ? 'hidden' : 'lg:col-span-8'} space-y-8`}>
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-10 md:p-16 flex-1 space-y-12">
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

                            <div className="space-y-8">
                                {richTextSections.slice(0, 4).map((section, index) => (
                                    <section key={section.id} className="space-y-4 group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                index === 0 ? 'bg-rose-50 text-rose-600' :
                                                    index === 1 ? 'bg-indigo-50 text-indigo-600' :
                                                        index === 2 ? 'bg-teal-50 text-teal-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {section.icon}
                                            </div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{section.title}</h3>
                                            {aiFilledFields.has(section.id) && (
                                                <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                            )}
                                        </div>
                                        <div className={`${aiFilledFields.has(section.id) ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}>
                                            <ReactQuill
                                                theme="snow"
                                                value={(proposal[section.id] as string) || ''}
                                                onChange={(content) => handleFieldChange(section.id, content)}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder={section.placeholder}
                                                className={`proposal-editor ${section.minHeightClass}`}
                                            />
                                        </div>
                                    </section>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                                {richTextSections.slice(4, 6).map((section) => (
                                    <section key={section.id} className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            {section.icon}
                                            {section.title}
                                            {aiFilledFields.has(section.id) && (
                                                <span className="text-[8px] font-bold text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded">AI</span>
                                            )}
                                        </h3>
                                        <div className={`${aiFilledFields.has(section.id) ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}>
                                            <ReactQuill
                                                theme="snow"
                                                value={(proposal[section.id] as string) || ''}
                                                onChange={(content) => handleFieldChange(section.id, content)}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder={section.placeholder}
                                                className={`proposal-editor compact ${section.minHeightClass}`}
                                            />
                                        </div>
                                    </section>
                                ))}
                            </div>

                            <section className="space-y-4 pt-8 border-t border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <HelpCircle size={18} className="text-teal-500" />
                                    Next Steps
                                    {aiFilledFields.has('nextSteps') && (
                                        <span className="text-[10px] font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded animate-pulse">AI SUGGESTED</span>
                                    )}
                                </h3>
                                <div className={`${aiFilledFields.has('nextSteps') ? 'bg-teal-50/50 p-4 rounded -mx-4' : ''}`}>
                                    <ReactQuill
                                        theme="snow"
                                        value={proposal.nextSteps || ''}
                                        onChange={(content) => handleFieldChange('nextSteps', content)}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="How do we proceed after reviewing this document?"
                                        className="proposal-editor compact min-h-[120px]"
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className={`${showPreview ? 'hidden' : 'lg:col-span-4'} space-y-6`}>
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
                                Export PDF
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
