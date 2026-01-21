import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { quotationAPI } from '../services/api';
import { toast } from '../utils/toast';

interface AIQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onDraftGenerated: (draft: any) => void;
}

const AIQuotationModal: React.FC<AIQuotationModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onDraftGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setConfidence(null);

    try {
      const response = await quotationAPI.generateAIDraft(prompt.trim(), clientId);
      
      if (response.success && response.draft) {
        setConfidence(response.draft.confidence);
        
        if (response.draft.confidence < 0.7) {
          toast.warning(
            `AI confidence is ${Math.round(response.draft.confidence * 100)}%. Please review all fields carefully.`,
            5000
          );
        } else {
          toast.success('Quotation draft generated successfully!');
        }

        onDraftGenerated(response.draft);
        
        setTimeout(() => {
          onClose();
          setPrompt('');
          setConfidence(null);
        }, 1000);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate quotation draft';
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
      setConfidence(null);
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
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Quotation Generator</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Generate professional IT software quotation</p>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client</p>
            <p className="text-sm font-bold text-slate-900">{clientName}</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Describe Your Quotation
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a quotation for a QR-based café operations platform. Include: Design, backend development, admin portal, kitchen portal, web sockets, Redis caching, and React frontend. Timeline: 8-10 weeks. Support: 6 months warranty with bug fixes and maintenance."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-medium min-h-[150px] resize-y"
              disabled={isGenerating}
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">
              💡 Tip: Include project scope, features, deliverables, timeline, and support details for best results.
            </p>
          </div>

          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">Example Prompts</p>
            <div className="space-y-2 text-xs text-slate-600">
              <button
                onClick={() => setPrompt('Create a quotation for a complete e-commerce platform. Features: Product catalog, shopping cart, payment gateway integration, admin dashboard, order management. Timeline: 12 weeks. Support: 12 months warranty.')}
                disabled={isGenerating}
                className="block w-full text-left p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                • E-commerce platform with full features
              </button>
              <button
                onClick={() => setPrompt('Quotation for hospital management system. Include: Patient registration, appointment scheduling, doctor portal, billing, pharmacy management, lab reports. Timeline: 16 weeks. Support: 18 months.')}
                disabled={isGenerating}
                className="block w-full text-left p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                • Hospital management system with multiple modules
              </button>
              <button
                onClick={() => setPrompt('Create quotation for mobile app development. Features: iOS and Android apps, user authentication, real-time notifications, payment integration. Timeline: 10 weeks.')}
                disabled={isGenerating}
                className="block w-full text-left p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                • Mobile app development with backend
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

          {confidence !== null && (
            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
              confidence >= 0.7 
                ? 'bg-teal-50 border-teal-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              {confidence >= 0.7 ? (
                <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">
                  AI Confidence: {Math.round(confidence * 100)}%
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {confidence >= 0.7 
                    ? 'High confidence. Review and adjust as needed.' 
                    : 'Low confidence. Please review all fields carefully.'}
                </p>
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Draft
              </>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AIQuotationModal;
