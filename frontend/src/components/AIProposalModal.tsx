import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { proposalAPI } from '../services/api';
import { toast } from '../utils/toast';

interface AIProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId?: string;
    clientName: string;
    onDraftGenerated: (draft: any) => void;
}

const AIProposalModal: React.FC<AIProposalModalProps> = ({
    isOpen,
    onClose,
    clientId,
    clientName,
    onDraftGenerated,
}) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await proposalAPI.generateAIDraft(prompt.trim(), clientId, clientName);

            if (response.success && response.draft) {

                if (response.draft.confidence < 0.7) {
                    toast.warning(
                        `AI confidence is ${Math.round((response.draft.confidence || 0) * 100)}%. Please review all fields carefully.`,
                        5000
                    );
                } else {
                    toast.success('Proposal draft generated successfully!');
                }

                onDraftGenerated(response.draft);

                setTimeout(() => {
                    onClose();
                    setPrompt('');
                }, 1000);
            } else {
                throw new Error('Invalid response from AI service');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to generate proposal draft';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClose = () => {
        if (!isGenerating) {
            onClose();
            setPrompt('');
            setError(null);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: '1rem',
            }}
        >
            <div
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
                onClick={handleClose}
                style={{
                    WebkitBackdropFilter: 'blur(12px)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                }}
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Proposal Generator</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Generate high-level design docs & sales pitches</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isGenerating}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Client</p>
                            <p className="text-sm font-bold text-slate-900">{clientName}</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Describe the Project Needs
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Example: We need a proposal for a Fintech App. Focus on security, real-time tracking, and multi-currency support. The client is a startup looking for v1.0 launch in 3 months. Include mobile app, backend, and admin panel."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium min-h-[150px] resize-y"
                                disabled={isGenerating}
                            />
                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                💡 Tip: Briefly mention the problem, your proposed solution, and main goals.
                            </p>
                        </div>

                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Suggested Templates</p>
                            <div className="space-y-2 text-xs text-slate-600">
                                <button
                                    onClick={() => setPrompt('Create a sales proposal for an Enterprise Resource Planning (ERP) system. The client struggles with fragmented data across departments. Suggest a unified cloud-native architecture. v1.0.')}
                                    disabled={isGenerating}
                                    className="block w-full text-left p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    • Enterprise ERP Proposal (Solving data fragmentation)
                                </button>
                                <button
                                    onClick={() => setPrompt('Proposal for a Real Estage Portal. Problem: Slow lead conversion. Solution: AI-driven matching and virtual tours. Scope: Web platform and CRM. Timeline: 10 weeks.')}
                                    disabled={isGenerating}
                                    className="block w-full text-left p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    • Real Estate Portal (Focus on AI matching)
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-rose-900">Error</p>
                                    <p className="text-xs text-rose-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isGenerating}
                            className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="px-6 py-2.5 bg-teal-500 text-white font-bold text-sm rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Crafting...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate Proposal
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIProposalModal;
