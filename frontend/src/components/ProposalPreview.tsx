import React from 'react';
import { Proposal } from '../types/refTypes';
import { COMPANY_DEFAULTS } from '../constants';
import { formatDateDDMonYYYY } from '../utils/dateFormat';
import { normalizeToHtml, sanitizeProposalHtml } from '../utils/proposalRichText';

interface ProposalPreviewProps {
    proposal: Proposal;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({ proposal }) => {
    const renderRichText = (content: string) => ({
        __html: sanitizeProposalHtml(normalizeToHtml(content)),
    });

    const LegalFooter: React.FC = () => (
        <div className="mt-8 pt-4 border-t border-slate-200 text-[12px] text-slate-500 leading-relaxed">
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
        <div className="w-full overflow-x-auto bg-slate-50 p-4 md:p-6 lg:bg-transparent lg:p-0 print:overflow-visible print:m-0 print:p-0">
            <div className="proposal-document bg-white p-6 md:p-8 shadow-xl border border-slate-200 lg:min-w-0 w-full max-w-[920px] mx-auto print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none text-slate-800" style={{ height: 'auto', minHeight: 'auto' } as React.CSSProperties}>

                <div className="mb-6 space-y-4 print:mb-4">
                    <table className="w-full border-collapse border-b-2 border-emerald-600 pb-4 print:pb-3">
                        <tbody>
                            <tr>
                                <td className="w-1/2 align-top text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 shrink-0 flex items-center justify-center print:w-10 print:h-10">
                                            <img
                                                src="/grovyn.png"
                                                alt="G"
                                                className="w-8 h-8 object-contain print:w-7 print:h-7"
                                            />
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-semibold tracking-tight text-slate-900 leading-none">GROVYN</h1>
                                        </div>
                                    </div>
                                    <div className="mt-5 space-y-1">
                                        <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Proposal Prepared For</p>
                                        <h2 className="text-[16px] font-semibold text-slate-900 uppercase tracking-tight">{proposal.client.companyName}</h2>
                                        <p className="text-[12px] font-medium text-slate-600">{proposal.client.name}</p>
                                    </div>
                                </td>
                                <td className="w-1/2 align-top text-right">
                                    <div className="space-y-1">
                                        <h1 className="text-[16px] font-semibold tracking-tight text-slate-900 leading-none">Proposal</h1>
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <span className="text-[12px] font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-sm">#{proposal.proposalNumber}</span>
                                            <span className="text-[12px] font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-sm">{proposal.version}</span>
                                        </div>
                                        <div className="mt-5">
                                            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 text-right">Drafted On</p>
                                            <p className="text-[14px] font-semibold text-slate-900 mt-1">{formatDateDDMonYYYY(proposal.proposalDate)}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-6 print:mb-4">
                    <h2 className="text-[16px] font-semibold tracking-tight text-slate-900 leading-[1.4] mb-2">
                        {proposal.projectName || 'Project Architectural Proposal'}
                    </h2>
                    <div className="w-20 h-1 bg-emerald-600"></div>
                </div>

                <div className="space-y-5 print:space-y-4">
                    <section>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[14px] font-semibold text-emerald-600 leading-none">01</span>
                            <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-wide border-l-2 border-emerald-600 pl-3">The Challenge</h3>
                        </div>
                        <div
                            className="proposal-rich-content text-[14px] leading-6 text-slate-700 pl-8"
                            dangerouslySetInnerHTML={renderRichText(proposal.problemStatement)}
                        />
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[14px] font-semibold text-emerald-600 leading-none">02</span>
                            <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-wide border-l-2 border-emerald-600 pl-3">Our Approach</h3>
                        </div>
                        <div
                            className="proposal-rich-content text-[14px] leading-6 text-slate-700 pl-8 bg-slate-50 p-4 rounded-md border border-slate-200"
                            dangerouslySetInnerHTML={renderRichText(proposal.solution)}
                        />
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[14px] font-semibold text-emerald-600 leading-none">03</span>
                            <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-wide border-l-2 border-emerald-600 pl-3">Strategic Scope</h3>
                        </div>
                        <div
                            className="proposal-rich-content text-[14px] leading-6 text-slate-700 pl-8"
                            dangerouslySetInnerHTML={renderRichText(proposal.scope)}
                        />
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[14px] font-semibold text-emerald-600 leading-none">04</span>
                            <h3 className="text-[14px] font-semibold text-slate-900 uppercase tracking-wide border-l-2 border-emerald-600 pl-3">Key Deliverables</h3>
                        </div>
                        <div
                            className="proposal-rich-content text-[14px] leading-6 text-slate-700 pl-8"
                            dangerouslySetInnerHTML={renderRichText(proposal.deliverables)}
                        />
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                        <section>
                            <h4 className="text-[12px] font-semibold text-emerald-600 uppercase tracking-wide mb-2">Estimated Timeline</h4>
                            <div
                                className="proposal-rich-content text-[12px] text-slate-600 leading-6"
                                dangerouslySetInnerHTML={renderRichText(proposal.timelineEstimate)}
                            />
                        </section>
                        <section>
                            <h4 className="text-[12px] font-semibold text-emerald-600 uppercase tracking-wide mb-2">Project Exclusions</h4>
                            <div
                                className="proposal-rich-content text-[12px] text-slate-600 leading-6"
                                dangerouslySetInnerHTML={renderRichText(proposal.exclusions)}
                            />
                        </section>
                    </div>

                    {proposal.nextSteps && (
                        <section className="border border-emerald-200 bg-emerald-50/30 p-4 rounded-md">
                            <h3 className="text-[14px] font-semibold uppercase tracking-wide mb-2 border-l-2 border-emerald-600 pl-3 text-slate-900">Path Forward</h3>
                            <div
                                className="proposal-rich-content text-[14px] leading-6 text-slate-700"
                                dangerouslySetInnerHTML={renderRichText(proposal.nextSteps)}
                            />
                        </section>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Contact & Support</p>
                            <div className="space-y-1 text-[12px] font-medium text-slate-600">
                                <p>support@grovyn.in</p>
                                <p>www.grovyn.in</p>
                                <p>{COMPANY_DEFAULTS.address}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block text-right">
                                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Authorized Signature</p>
                                <div className="w-40 h-10 mb-2 ml-auto overflow-hidden opacity-80">
                                    <img src="/signature.png" alt="Signature" className="h-full object-contain ml-auto" />
                                </div>
                                <div className="w-48 border-b border-slate-900 ml-auto mb-2"></div>
                                <p className="text-[14px] font-semibold text-slate-900">Aman K.A</p>
                                <p className="text-[12px] font-semibold text-emerald-600 uppercase tracking-wide">Director's Office, Grovyn</p>
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
