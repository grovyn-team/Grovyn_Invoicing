import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Download, ChevronLeft, Share2 } from 'lucide-react';
import { OfferLetter, OfferLetterStatus } from '../types/refTypes';
import OfferLetterPreview from './OfferLetterPreview';
import { ROLE_TEMPLATES } from '../data/offerLetterRoles';
import { Plus, Trash2 } from 'lucide-react';

interface OfferLetterEditorProps {
  initialOfferLetter?: OfferLetter;
  onSave: (offerLetter: OfferLetter) => void;
  onCancel: () => void;
}

const OfferLetterEditor: React.FC<OfferLetterEditorProps> = ({ initialOfferLetter, onSave, onCancel }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [offerLetter, setOfferLetter] = useState<OfferLetter>(initialOfferLetter || {
    id: Math.random().toString(36).substr(2, 9),
    offerNumber: `GRV/${new Date().getFullYear()}/OFF/${Math.floor(100 + Math.random() * 899)}`,
    offerDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateAddress: '',
    position: '',
    department: '',
    designation: '',
    reportingManager: '',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    employmentType: 'Full-Time',
    workLocation: '',
    salaryDetails: {
      baseSalary: 0,
      currency: 'INR',
      salaryBreakdown: '',
      variablePay: 0,
      benefits: '',
    },
    noticePeriod: '',
    probationPeriod: '3 months',
    termsAndConditions: '',
    additionalNotes: '',
    acceptanceDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: OfferLetterStatus.DRAFT,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  });

  useEffect(() => {
    if (initialOfferLetter) {
      setOfferLetter(initialOfferLetter);
    }
  }, [initialOfferLetter]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {initialOfferLetter ? 'Modify Offer Letter' : 'Draft New Offer Letter'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">#{offerLetter.offerNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${showPreview ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden xs:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>
          <button
            onClick={() => onSave(offerLetter)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            <Save size={16} />
            {offerLetter.status === OfferLetterStatus.DRAFT ? 'Save Draft' : 'Update'}
          </button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-6 md:gap-8`}>
        <div className={`${showPreview ? 'hidden' : 'lg:col-span-8'} space-y-6 no-print`}>
          {/* Candidate Information */}
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">01</span>
              Candidate Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.candidateName}
                  onChange={e => setOfferLetter({ ...offerLetter, candidateName: e.target.value })}
                  placeholder="Enter candidate's full name"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.candidateEmail}
                  onChange={e => setOfferLetter({ ...offerLetter, candidateEmail: e.target.value })}
                  placeholder="candidate@example.com"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.candidatePhone || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setOfferLetter({ ...offerLetter, candidatePhone: value });
                  }}
                  placeholder="9876543210"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Address</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y"
                  value={offerLetter.candidateAddress || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, candidateAddress: e.target.value })}
                  placeholder="Enter candidate's address"
                />
              </div>
            </div>
          </section>

          {/* Position Details */}
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">02</span>
                Position Details
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Role Template:</label>
                <select
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold focus:border-teal-500 outline-none"
                  onChange={(e) => {
                    const role = e.target.value;
                    if (role && ROLE_TEMPLATES[role]) {
                      const template = ROLE_TEMPLATES[role];
                      setOfferLetter({
                        ...offerLetter,
                        position: template.position,
                        designation: template.designation,
                        department: template.department,
                        reportingManager: template.reportingManager ?? offerLetter.reportingManager,
                        responsibilities: [...template.responsibilities],
                        internshipDescription: template.internshipDescription,
                        incentiveTerms: template.incentiveTerms ? [...template.incentiveTerms] : []
                      });
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Choose a role...</option>
                  {Object.keys(ROLE_TEMPLATES).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Position/Job Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.position}
                  onChange={e => setOfferLetter({ ...offerLetter, position: e.target.value })}
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.department}
                  onChange={e => setOfferLetter({ ...offerLetter, department: e.target.value })}
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Designation</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.designation}
                  onChange={e => setOfferLetter({ ...offerLetter, designation: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Reporting Manager</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.reportingManager || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, reportingManager: e.target.value })}
                  placeholder="Manager's name"
                />
              </div>
            </div>

            {/* Dynamic Responsibilities */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Core Responsibilities</label>
                <button
                  type="button"
                  onClick={() => {
                    const current = offerLetter.responsibilities || [];
                    setOfferLetter({ ...offerLetter, responsibilities: [...current, ''] });
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 uppercase tracking-wider hover:text-teal-700 transition-colors"
                >
                  <Plus size={14} /> Add Responsibility
                </button>
              </div>
              <div className="space-y-3">
                {(offerLetter.responsibilities || []).map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={resp}
                      onChange={e => {
                        const newResps = [...(offerLetter.responsibilities || [])];
                        newResps[index] = e.target.value;
                        setOfferLetter({ ...offerLetter, responsibilities: newResps });
                      }}
                      placeholder={`Responsibility #${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newResps = (offerLetter.responsibilities || []).filter((_, i) => i !== index);
                        setOfferLetter({ ...offerLetter, responsibilities: newResps });
                      }}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {(offerLetter.responsibilities || []).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No responsibilities added. They will be auto-filled if you select a role template.</p>
                )}
              </div>
            </div>

            {/* Role-specific Internship Description */}
            {offerLetter.employmentType === 'Internship' && (
              <div className="mt-6">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Internship Description (Role Specific)</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[80px] resize-y"
                  value={offerLetter.internshipDescription || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, internshipDescription: e.target.value })}
                  placeholder="Describe the learning objectives and focus of this internship..."
                />
              </div>
            )}
          </section>

          {/* Employment Details */}
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">03</span>
              Employment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Employment Type</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={offerLetter.employmentType}
                  onChange={e => setOfferLetter({ ...offerLetter, employmentType: e.target.value as any })}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Work Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.workLocation}
                  onChange={e => setOfferLetter({ ...offerLetter, workLocation: e.target.value })}
                  placeholder="e.g., Mumbai, India"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.startDate}
                  onChange={e => setOfferLetter({ ...offerLetter, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Probation Period</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.probationPeriod || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, probationPeriod: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notice Period</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.noticePeriod || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, noticePeriod: e.target.value })}
                  placeholder="e.g., 30 days"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Acceptance Deadline</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.acceptanceDeadline}
                  onChange={e => setOfferLetter({ ...offerLetter, acceptanceDeadline: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Salary Details */}
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">04</span>
              Salary & Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Base Salary (Annual)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.salaryDetails.baseSalary}
                  onChange={e => setOfferLetter({
                    ...offerLetter,
                    salaryDetails: { ...offerLetter.salaryDetails, baseSalary: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Currency</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-bold"
                  value={offerLetter.salaryDetails.currency}
                  onChange={e => setOfferLetter({
                    ...offerLetter,
                    salaryDetails: { ...offerLetter.salaryDetails, currency: e.target.value }
                  })}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Variable Pay (Optional)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                  value={offerLetter.salaryDetails.variablePay || 0}
                  onChange={e => setOfferLetter({
                    ...offerLetter,
                    salaryDetails: { ...offerLetter.salaryDetails, variablePay: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Salary Breakdown</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[80px] resize-y"
                  value={offerLetter.salaryDetails.salaryBreakdown || ''}
                  onChange={e => setOfferLetter({
                    ...offerLetter,
                    salaryDetails: { ...offerLetter.salaryDetails, salaryBreakdown: e.target.value }
                  })}
                  placeholder="e.g., ₹50,000/month (Basic: ₹30,000, HRA: ₹15,000, Other Allowances: ₹5,000)"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Benefits & Perks</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y"
                  value={offerLetter.salaryDetails.benefits || ''}
                  onChange={e => setOfferLetter({
                    ...offerLetter,
                    salaryDetails: { ...offerLetter.salaryDetails, benefits: e.target.value }
                  })}
                  placeholder="e.g., Health Insurance, Provident Fund, Paid Leaves, etc."
                />
              </div>
            </div>

            {/* Dynamic Incentive Terms */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Incentive Terms & Conditions</label>
                <button
                  type="button"
                  onClick={() => {
                    const current = offerLetter.incentiveTerms || [];
                    setOfferLetter({ ...offerLetter, incentiveTerms: [...current, ''] });
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 uppercase tracking-wider hover:text-teal-700 transition-colors"
                >
                  <Plus size={14} /> Add Incentive Term
                </button>
              </div>
              <div className="space-y-3">
                {(offerLetter.incentiveTerms || []).map((term, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium"
                      value={term}
                      onChange={e => {
                        const newTerms = [...(offerLetter.incentiveTerms || [])];
                        newTerms[index] = e.target.value;
                        setOfferLetter({ ...offerLetter, incentiveTerms: newTerms });
                      }}
                      placeholder={`Incentive Term #${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTerms = (offerLetter.incentiveTerms || []).filter((_, i) => i !== index);
                        setOfferLetter({ ...offerLetter, incentiveTerms: newTerms });
                      }}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {(offerLetter.incentiveTerms || []).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No specific incentive terms added. These usually appear for sales/BDE roles or internship incentives.</p>
                )}
              </div>
            </div>
          </section>

          {/* Terms & Conditions */}
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-teal-500 text-white rounded flex items-center justify-center text-[9px]">05</span>
              Terms & Conditions
            </h3>

            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Terms & Conditions</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[150px] resize-y"
                  value={offerLetter.termsAndConditions || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions (will be auto-filled with industry standard if left empty)"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm font-medium min-h-[100px] resize-y"
                  value={offerLetter.additionalNotes || ''}
                  onChange={e => setOfferLetter({ ...offerLetter, additionalNotes: e.target.value })}
                  placeholder="Any additional notes or special conditions"
                />
              </div>
            </div>
          </section>
        </div>

        <div className={`${showPreview ? 'hidden' : 'lg:col-span-4'} space-y-6 no-print`}>
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase mb-6">Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Offer Letter ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none mono text-sm font-bold"
                  value={offerLetter.offerNumber}
                  onChange={e => setOfferLetter({ ...offerLetter, offerNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Offer Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                    value={offerLetter.offerDate}
                    onChange={e => setOfferLetter({ ...offerLetter, offerDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valid Until</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold"
                    value={offerLetter.validUntil}
                    onChange={e => setOfferLetter({ ...offerLetter, validUntil: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {showPreview && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 print:pb-0 print:mb-0">
            <div className="flex flex-col sm:flex-row justify-center mb-8 no-print gap-4 print:mb-0">
              <button onClick={() => {
                // Force browser to recalculate full document height
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(() => window.print(), 100);
              }} className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                <Download size={20} />
                Export PDF
              </button>
              <button
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95"
              >
                <Share2 size={20} />
                Share Offer Letter
              </button>
            </div>
            <OfferLetterPreview offerLetter={offerLetter} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferLetterEditor;
