import React from 'react';
import { Proposal } from '../types/refTypes';
import { COMPANY_DEFAULTS } from '../constants';
import { formatDateDDMonYYYY } from '../utils/dateFormat';

interface ProposalPreviewProps {
    proposal: Proposal;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({ proposal }) => {
    const LegalFooter: React.FC = () => (
        <div className="mt-12 pt-6 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed mb-8">
            <p className="font-bold mb-1 uppercase tracking-widest">Confidentiality Notice:</p>
            <p>
                This proposal and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
                If you have received this document in error, please notify the sender. This document represents a high-level design and value proposition,
                and does not constitute a binding legal contract until a formal Service Agreement is executed.
            </p>
            <p className="mt-4 font-bold">© {new Date().getFullYear()} G{COMPANY_DEFAULTS.name}. All rights reserved.</p>
        </div>
    );

    return (
        <div className="w-full overflow-x-auto bg-slate-50 p-4 md:p-8 lg:bg-transparent lg:p-0 print:overflow-visible print:m-0 print:p-0">
            <div className="bg-white p-6 md:p-12 shadow-2xl border border-slate-100 min-w-[800px] lg:min-w-0 w-full max-w-4xl mx-auto print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none text-slate-800 font-serif" style={{ height: 'auto', minHeight: 'auto' } as React.CSSProperties}>

                <div className="mb-12 space-y-8 print:mb-6">
                    <table className="w-full border-collapse border-b-8 border-teal-500 pb-12 print:pb-6">
                        <tbody>
                            <tr>
                                <td className="w-1/2 align-top text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 shrink-0 flex items-center justify-center print:w-12 print:h-12">
                                            <img
                                                src="/grovyn.png"
                                                alt="G"
                                                className="w-10 h-10 object-contain print:w-8 print:h-8"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none ml-[-20px]">rovyn</h1>
                                        </div>
                                    </div>
                                    <div className="mt-10 space-y-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Proposal Prepared For</p>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{proposal.client.companyName}</h2>
                                        <p className="text-sm font-medium text-slate-500">{proposal.client.name}</p>
                                    </div>
                                </td>
                                <td className="w-1/2 align-top text-right">
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Proposal</h1>
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-sm">#{proposal.proposalNumber}</span>
                                            <span className="text-xs font-black bg-teal-500 text-white px-3 py-1 rounded-sm">{proposal.version}</span>
                                        </div>
                                        <div className="mt-8">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Drafted On</p>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{formatDateDDMonYYYY(proposal.proposalDate)}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-12 print:mb-8 print:break-inside-avoid">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-4">
                        {proposal.projectName || 'Project Architectural Proposal'}
                    </h2>
                    <div className="w-32 h-2 bg-teal-500"></div>
                </div>

                <div className="space-y-12 print:space-y-8">
                    <section className="print:break-inside-avoid page-break-inside-avoid mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-4xl font-black text-slate-300 leading-none">01</span>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4">The Challenge</h3>
                        </div>
                        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-sans pl-12">
                            {proposal.problemStatement}
                        </div>
                    </section>

                    <section className="print:break-inside-avoid page-break-inside-avoid mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-black text-slate-300 leading-none">02</span>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4">Our Approach</h3>
                        </div>
                        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-sans pl-12 bg-slate-50 p-8 rounded-xl border-l-4 border-teal-500">
                            {proposal.solution}
                        </div>
                    </section>

                    <section className="print:break-inside-avoid page-break-inside-avoid mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-black text-slate-300 leading-none">03</span>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4">Strategic Scope</h3>
                        </div>
                        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-sans pl-12 italic border-l-4 border-slate-100">
                            {proposal.scope}
                        </div>
                    </section>

                    <section className="print:break-inside-avoid page-break-inside-avoid mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-black text-slate-300 leading-none">04</span>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4">Key Deliverables</h3>
                        </div>
                        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-sans pl-12">
                            {proposal.deliverables}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t-2 border-slate-100 print:page-break-inside-avoid">
                        <section className="print:break-inside-avoid">
                            <h4 className="text-sm font-black text-teal-600 uppercase tracking-[0.2em] mb-4">Estimated Timeline</h4>
                            <div className="text-base text-slate-600 leading-relaxed font-sans">
                                {proposal.timelineEstimate}
                            </div>
                        </section>
                        <section className="print:break-inside-avoid">
                            <h4 className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Project Exclusions</h4>
                            <div className="text-base text-slate-600 leading-relaxed font-sans">
                                {proposal.exclusions}
                            </div>
                        </section>
                    </div>

                    {proposal.nextSteps && (
                        <section className="print:break-inside-avoid page-break-inside-avoid bg-slate-900 text-white p-12 rounded-2xl relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -mb-32 -mr-32 blur-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase tracking-widest mb-6 border-l-4 border-teal-500 pl-4">Path Forward</h3>
                                <div className="text-lg leading-relaxed whitespace-pre-wrap font-sans opacity-90">
                                    {proposal.nextSteps}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className="mt-32 pt-12 border-t-2 border-slate-100 print:mt-12 print:pt-8">
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Contact & Support</p>
                            <div className="space-y-1 text-sm font-medium text-slate-600">
                                <p>support@grovyn.in</p>
                                <p>www.grovyn.in</p>
                                <p>{COMPANY_DEFAULTS.address}</p>
                            </div>
                        </div>
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
                    <LegalFooter />
                </div>

            </div>
        </div>
    );
};

export default ProposalPreview;
