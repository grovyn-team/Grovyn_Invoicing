import React from 'react';
import { OfferLetter } from '../types/refTypes';
import { COMPANY_DEFAULTS } from '../constants';
import { formatDateDDMonYYYY } from '../utils/dateFormat';

interface OfferLetterPreviewProps {
  offerLetter: OfferLetter;
}

const OfferLetterPreview: React.FC<OfferLetterPreviewProps> = ({ offerLetter }) => {
  const isInternship = offerLetter.employmentType === 'Internship';
  const isUnpaid = isInternship && (!offerLetter.salaryDetails.baseSalary || offerLetter.salaryDetails.baseSalary === 0);
  const showCompensation = offerLetter.salaryDetails.baseSalary > 0 || isUnpaid;
  // Section number offset: if compensation section is hidden, reduce all subsequent section numbers by 1
  const sectionOffset = showCompensation ? 0 : -1;

  // Calculate end date (3 months for internship, or custom)
  const getEndDate = () => {
    const startDate = new Date(offerLetter.startDate);
    if (isInternship) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      return formatDateDDMonYYYY(endDate.toISOString().split('T')[0]);
    }
    return formatDateDDMonYYYY(offerLetter.validUntil);
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

  const calculateCTC = () => {
    const base = offerLetter.salaryDetails.baseSalary;
    const variable = offerLetter.salaryDetails.variablePay || 0;
    return base + variable;
  };

  const LegalFooter: React.FC = () => (
    <div className="mt-8 pt-4 border-t border-slate-200 text-[8px] text-slate-500 leading-relaxed mb-5">
      <p className="font-bold mb-1">Legal Disclaimer:</p>
      <p>
        This document is confidential and intended solely for the individual to whom it is addressed.
        This offer letter and any associated annexures do not constitute an employment contract unless explicitly stated and do not create any vested rights beyond those expressly mentioned herein.
      </p>
      <p className="mt-2">
        Grovyn reserves the right to interpret, modify, amend, suspend, or withdraw any terms, policies, incentives, or conditions mentioned in this document at its sole discretion, subject to applicable laws.
      </p>
      <p className="mt-2">
        Any dispute arising out of or in connection with this document shall be subject to the exclusive jurisdiction of courts as specified herein.
      </p>
      <p className="mt-2 font-bold">
        Unauthorized copying, sharing, or misuse of this document is strictly prohibited and may invite legal action.
      </p>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl lg:bg-transparent lg:rounded-none print:overflow-visible print:m-0 print:p-0">
      <div className="bg-white p-6 md:p-12 shadow-2xl border border-slate-200 rounded-sm min-w-[700px] lg:min-w-0 w-full max-w-4xl mx-auto print:shadow-none print:border-none print:m-0 print:pt-0 print:px-3 print:pb-0 print:w-full print:max-w-none text-slate-800" style={{ height: 'auto', minHeight: 'auto', paddingTop: 0, paddingBottom: 0 } as React.CSSProperties}>
        {/* Header */}
        <div className="mb-8 mt-6 border-b-4 border-teal-500 pb-4 print:break-inside-avoid print:mt-0 print:pt-0 print:mb-4 print:pb-2">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-1/2 align-top print:align-middle">
                  <div
                    className="
      flex items-center gap-2
      print:inline-flex
      print:items-center
      print:gap-2
      print:flex-nowrap
      print:whitespace-nowrap
    "
                  >
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                      <img
                        src="/grovyn.png"
                        alt="GROVYN"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </td>
                <td className="align-top text-left w-1/2">
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 print:text-2xl print:leading-tight">
                    {isInternship ? 'INTERNSHIP ' : ''}OFFER LETTER
                  </h1>
                </td>
                <td className="align-top text-right w-1/2">
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 print:text-2xl print:leading-tight">
                    GROVYN
                  </h1>

                  <div className="mt-2">
                    <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded inline-block print:text-xs">
                      #{offerLetter.offerNumber}
                    </span>
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 print:text-[9px]">
                    DATED {formatDateDDMonYYYY(offerLetter.offerDate)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recipient Information */}
        <div className="mb-8 print:break-inside-avoid">
          <p className="text-sm font-bold text-slate-900 mb-2">To,</p>
          <p className="text-sm font-bold text-slate-900 mb-1">{offerLetter.candidateName}</p>
          {offerLetter.candidateAddress && (
            <p className="text-sm text-slate-700">{offerLetter.candidateAddress}</p>
          )}
          <p className="text-sm font-bold text-slate-900 mt-4 mb-2">Subject: {isInternship ? 'Offer of Internship' : 'Offer of Employment'} for {offerLetter.position} at G{COMPANY_DEFAULTS.name}</p>
        </div>

        {/* Salutation */}
        <div className="mb-8 print:break-inside-avoid">
          <p className="text-sm font-bold text-slate-900 mb-2">Dear {offerLetter.candidateName.split(' ')[0]},</p>
          {isInternship ? (
            <p className="text-sm leading-relaxed text-slate-700">
              We are pleased to offer you an <span className="font-bold">Internship position</span> with <span className="font-bold">G{COMPANY_DEFAULTS.name}</span> for the role of <span className="font-bold">{offerLetter.position}</span>, subject to the terms and conditions outlined in this letter.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">
              We are pleased to extend this offer of employment to you for the position of <span className="font-bold">{offerLetter.position}</span> at G{COMPANY_DEFAULTS.name}.
              After careful consideration of your qualifications and experience, we believe you would be a valuable addition to our team.
            </p>
          )}
          {isInternship && (
            <p className="text-sm leading-relaxed text-slate-700 mt-2">
              {offerLetter.internshipDescription || `This internship is designed to provide hands-on exposure to growth strategy, partnerships, outreach, and business development in a fast-moving remote-first environment, while allowing G${COMPANY_DEFAULTS.name} to evaluate your contribution and professional conduct.`}
            </p>
          )}
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            Please read this letter carefully, as it defines the complete understanding between you and G{COMPANY_DEFAULTS.name}.
          </p>
        </div>

        {/* Section 1: Nature of Engagement */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">1. Nature of Engagement</h2>
          {isInternship ? (
            <div className="text-sm leading-relaxed text-slate-700 space-y-2">
              <p>
                This engagement is strictly an <span className="font-bold">internship</span> and <span className="font-bold">does not constitute employment</span> under any labour, employment, or industrial law in India.
              </p>
              <p className="font-bold mt-4">You acknowledge and agree that:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>This is an <span className="font-bold">unpaid internship</span></li>
                <li>No fixed salary, stipend, or guaranteed remuneration is promised</li>
                <li>This internship does not create an employer-employee relationship</li>
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">
              This is a {offerLetter.employmentType.toLowerCase()} position with G{COMPANY_DEFAULTS.name}.
              Your employment will be governed by the company's policies and procedures as amended from time to time.
            </p>
          )}
        </div>

        {/* Section 2: Role and Responsibilities */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">2. Role and Responsibilities</h2>
          <p className="text-sm leading-relaxed text-slate-700 mb-2">
            You are being onboarded as a <span className="font-bold">{offerLetter.designation}</span>.
          </p>
          {isInternship ? (
            <div className="text-sm leading-relaxed text-slate-700">
              <p className="mb-2">Your responsibilities may include but are not limited to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {offerLetter.responsibilities && offerLetter.responsibilities.length > 0 ? (
                  offerLetter.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))
                ) : (
                  <>
                    <li>Identifying potential partnerships and growth opportunities</li>
                    <li>Outreach to founders, businesses, and decision-makers</li>
                    <li>Assisting in onboarding deals, partnerships, or projects</li>
                    <li>Supporting sales, partnerships, and growth initiatives</li>
                  </>
                )}
              </ul>
              <p className="mt-2">Your scope of work may be modified at G{COMPANY_DEFAULTS.name}'s discretion based on business needs.</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">
              Your responsibilities will be communicated by your reporting manager {offerLetter.reportingManager ? `(${offerLetter.reportingManager})` : ''} and may evolve based on business requirements.
            </p>
          )}
        </div>

        {/* Section 3: Duration */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">
            {isInternship ? '3. Internship Duration' : '3. Employment Duration'}
          </h2>
          {isInternship ? (
            <div className="text-sm leading-relaxed text-slate-700">
              <p>
                The internship shall be for a <span className="font-bold">fixed period of three months</span>,
                commencing from <span className="font-bold">{formatDateDDMonYYYY(offerLetter.startDate)}</span> and ending on <span className="font-bold">{getEndDate()}</span>,
                unless terminated earlier in accordance with this letter.
              </p>
              <p className="mt-2">Completion of the internship does not guarantee future employment or extension.</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">
              Your employment will commence on <span className="font-bold">{formatDateDDMonYYYY(offerLetter.startDate)}</span>.
              {offerLetter.probationPeriod && (
                <> You will be on probation for <span className="font-bold">{offerLetter.probationPeriod}</span>.</>
              )}
            </p>
          )}
        </div>

        {/* Section 4: Place of Work */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">4. Place of Work</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            G{COMPANY_DEFAULTS.name} is a <span className="font-bold">remote-first company</span>.
          </p>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            Your place of work shall be <span className="font-bold">fully remote</span>, and you will be expected to perform your duties from a location of your choice using your own infrastructure unless otherwise specified.
          </p>
        </div>

        {/* Section 5: Working Commitment */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">5. Working Commitment</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            You are expected to devote sincere effort, professional conduct, and reasonable working hours toward assigned tasks.
            However, this {isInternship ? 'internship' : 'position'} does not guarantee fixed working hours and may vary based on project needs.
          </p>
        </div>

        {/* Section 6: Compensation - Only show if salary > 0 or unpaid internship */}
        {showCompensation && (
          <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">
              {isInternship ? '6. Compensation and Incentive Structure' : '6. Compensation Package'}
            </h2>
            {isUnpaid ? (
              <div className="text-sm leading-relaxed text-slate-700 space-y-2">
                <p className="font-bold">This internship is unpaid.</p>
                <p>
                  However, G{COMPANY_DEFAULTS.name} may, at its sole discretion, offer <span className="font-bold">performance-based incentives</span> subject to internal policies and conditions.
                </p>
                <p className="mt-4 font-bold">If applicable, incentives shall be calculated as follows:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {offerLetter.incentiveTerms && offerLetter.incentiveTerms.length > 0 ? (
                    offerLetter.incentiveTerms.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))
                  ) : (
                    <>
                      <li>A <span className="font-bold">percentage-based incentive ranging from 0.5 percent to 2 percent</span></li>
                      <li>Applicable only on <span className="font-bold">successfully onboarded deals, partnerships, or projects</span></li>
                      <li>The <span className="font-bold">exact percentage per deal shall be decided solely by G{COMPANY_DEFAULTS.name}</span></li>
                      <li>Incentives are conditional upon successful closure, payment realization, and client onboarding</li>
                      <li>No incentive is guaranteed unless explicitly approved in writing by G{COMPANY_DEFAULTS.name}</li>
                    </>
                  )}
                </ul>
                <p className="mt-4">
                  G{COMPANY_DEFAULTS.name} reserves full rights to revise, withhold, approve, or deny incentives based on performance, quality of contribution, and business judgment.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Annual CTC:</span>
                    <span className="font-black text-slate-900 text-lg">{formatCurrency(calculateCTC(), offerLetter.salaryDetails.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Base Salary:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(offerLetter.salaryDetails.baseSalary, offerLetter.salaryDetails.currency)}</span>
                  </div>
                  {offerLetter.salaryDetails.variablePay && offerLetter.salaryDetails.variablePay > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Variable Pay:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(offerLetter.salaryDetails.variablePay, offerLetter.salaryDetails.currency)}</span>
                    </div>
                  )}
                </div>
                {offerLetter.salaryDetails.salaryBreakdown && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-2">Salary Breakdown:</p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{offerLetter.salaryDetails.salaryBreakdown}</p>
                  </div>
                )}
                {offerLetter.salaryDetails.benefits && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-2">Benefits & Perks:</p>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{offerLetter.salaryDetails.benefits}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Continue with remaining sections... */}
        {/* Section 7-15 will follow similar pattern */}
        {/* Section 7: Performance and Conduct */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{7 + sectionOffset}. Performance and Conduct</h2>
          <p className="text-sm leading-relaxed text-slate-700 mb-2">Your continuation in this {isInternship ? 'internship' : 'position'} is subject to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
            <li>Satisfactory performance</li>
            <li>Professional behavior</li>
            <li>Adherence to company values and instructions</li>
          </ul>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            Any form of negligence, misrepresentation, misconduct, or non-cooperation may result in immediate termination.
          </p>
        </div>

        {/* Section 8: Confidentiality */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{8 + sectionOffset}. Confidentiality and Non-Disclosure</h2>
          <p className="text-sm leading-relaxed text-slate-700 mb-2">
            During and after the {isInternship ? 'internship' : 'employment'}, you shall maintain strict confidentiality regarding all non-public information related to G{COMPANY_DEFAULTS.name}, including but not limited to:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
            <li>Business strategies and plans</li>
            <li>Client and partner information</li>
            <li>Pricing, proposals, and negotiations</li>
            <li>Internal tools, documents, data, and communications</li>
            <li>Any insider or sensitive company information</li>
          </ul>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            You shall not disclose, copy, store, or share such information in any form without written authorization.
          </p>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            This obligation shall survive the completion or termination of this {isInternship ? 'internship' : 'employment'}.
          </p>
        </div>

        {/* Section 9: Intellectual Property */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{9 + sectionOffset}. Intellectual Property Rights</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            All work, content, ideas, documents, leads, strategies, data, and materials created or contributed by you during this {isInternship ? 'internship' : 'employment'} shall be the <span className="font-bold">exclusive intellectual property of G{COMPANY_DEFAULTS.name}</span>.
          </p>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            You waive any ownership or moral rights over such work to the maximum extent permitted by Indian law.
          </p>
        </div>

        {/* Section 10: Conflict of Interest */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{10 + sectionOffset}. Conflict of Interest</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            You shall not engage in any activity, {isInternship ? 'internship' : 'employment'}, or business that conflicts with G{COMPANY_DEFAULTS.name}'s interests during this {isInternship ? 'internship' : 'employment'} period without prior written consent.
          </p>
        </div>

        {/* Section 11: Misconduct */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{11 + sectionOffset}. Misconduct and Disciplinary Action</h2>
          <p className="text-sm leading-relaxed text-slate-700 mb-2">
            G{COMPANY_DEFAULTS.name} reserves the right to terminate this {isInternship ? 'internship' : 'employment'} immediately in cases including but not limited to:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
            <li>Breach of confidentiality</li>
            <li>Misrepresentation or fraud</li>
            <li>Insubordination or unethical conduct</li>
            <li>Damage to company reputation or relationships</li>
            <li>Unauthorized communication on behalf of G{COMPANY_DEFAULTS.name}</li>
          </ul>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            No compensation or certificate shall be owed in such cases.
          </p>
        </div>

        {/* Section 12: Termination */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{12 + sectionOffset}. Termination and Notice Period</h2>
          {isInternship ? (
            <div className="text-sm leading-relaxed text-slate-700">
              <p>
                Either party may terminate this internship by providing <span className="font-bold">45 days' written notice</span>.
              </p>
              <p className="mt-2">
                G{COMPANY_DEFAULTS.name} reserves the right to terminate the internship <span className="font-bold">without notice</span> in cases of serious misconduct or breach of this agreement.
              </p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">
              {offerLetter.noticePeriod ? (
                <>Either party may terminate this employment by providing <span className="font-bold">{offerLetter.noticePeriod} notice</span>.</>
              ) : (
                <>Either party may terminate this employment as per company policy and applicable laws.</>
              )}
            </p>
          )}
        </div>

        {/* Section 13: Company Policies */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{13 + sectionOffset}. Company Policies and Rights</h2>
          <p className="text-sm leading-relaxed text-slate-700 mb-2">
            You agree to comply with all current and future policies, guidelines, and instructions issued by G{COMPANY_DEFAULTS.name}.
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            G{COMPANY_DEFAULTS.name} reserves the <span className="font-bold">absolute right to modify, amend, or change any terms, policies, incentive structures, or conditions</span> at any time without prior notice, subject to applicable law.
          </p>
        </div>

        {/* Section 14: Governing Law */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{14 + sectionOffset}. Governing Law and Jurisdiction</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            This letter shall be governed by the laws of India. Courts located in <span className="font-bold">Raipur, Chhattisgarh</span> shall have exclusive jurisdiction.
          </p>
        </div>

        {/* Section 15: Acceptance */}
        <div className="mb-8 print:break-inside-avoid page-break-inside-avoid">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">{15 + sectionOffset}. Acceptance</h2>
          <p className="text-sm leading-relaxed text-slate-700">
            By signing below, you confirm that you have read, understood, and agreed to all the terms and conditions stated in this letter.
          </p>
          <p className="text-sm leading-relaxed text-slate-700 mt-2">
            We look forward to your contribution and wish you a {isInternship ? 'meaningful learning experience' : 'successful journey'} with G{COMPANY_DEFAULTS.name}.
          </p>
        </div>

        {/* Closing */}
        <div className="mb-12 print:break-inside-avoid page-break-inside-avoid">
          <p className="text-sm font-bold text-slate-900 mb-2">Warm regards,</p>
          <p className="text-sm text-slate-700 mb-4">For G{COMPANY_DEFAULTS.name}</p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 mb-8 print:break-inside-avoid">
          <div className="space-y-4">
            <section>
              <h3 className="font-black text-slate-900 uppercase tracking-widest mb-2 text-[10px]">Contact Information</h3>
              <p className="text-[11px] text-slate-600">{COMPANY_DEFAULTS.address}</p>
              <p className="text-[11px] text-slate-600">Email: hr@g{COMPANY_DEFAULTS.name.toLowerCase()}.in</p>
              <p className="text-[11px] text-slate-600">Udyam RN: {COMPANY_DEFAULTS.gstin}</p>
            </section>
          </div>
          <div className="relative w-full h-[140px] print:h-[110px]">
            <div className="absolute right-0 bottom-0 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                Authorized Signatory
              </p>

              {/* Signature */}
              <div className="w-[120px] h-[40px] mb-1 ml-auto overflow-hidden">
                <img
                  src="/signature.png"
                  alt="Signature"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Line */}
              <div className="w-48 border-b-2 border-slate-900 ml-auto mb-2"></div>

              <p className="font-bold text-slate-900 text-sm">Aman K.A</p>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                Director's Office, G{COMPANY_DEFAULTS.name}
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Acceptance Section */}
        <div className="mb-12 print:break-inside-avoid page-break-inside-avoid">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-4">
            {isInternship ? 'Intern' : 'Candidate'} Acceptance
          </h3>
          <p className="text-sm leading-relaxed text-slate-700 mb-4">
            I, <span className="font-bold">{offerLetter.candidateName}</span>, accept this {isInternship ? 'internship' : 'employment'} offer and agree to all terms and conditions stated above.
          </p>
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2">Signature:</p>
              <div className="w-64 border-b-2 border-slate-900 mb-4"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2">Date:</p>
              <div className="w-64 border-b-2 border-slate-900"></div>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mb-8 print:break-inside-avoid">
          <LegalFooter />
        </div>

        {/* ANNEXURE A - Non-Disclosure Agreement */}
        <div className="mt-12 pt-12 border-t-4 border-slate-900">
          <h1 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">ANNEXURE A</h1>
          <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT</h2>

          <p className="text-sm leading-relaxed text-slate-700 mb-8">
            This Non-Disclosure Agreement ("Agreement") is entered into on <span className="font-bold">{formatDateDDMonYYYY(offerLetter.offerDate)}</span>
          </p>

          <div className="mb-8 space-y-2">
            <p className="text-sm font-bold text-slate-900">BY AND BETWEEN</p>
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-bold">G{COMPANY_DEFAULTS.name}</span>, a remote-first company operating under the laws of India, having its principal place of business as determined by management
              <br />(hereinafter referred to as "Company")
            </p>
            <p className="text-sm font-bold text-slate-900 mt-4">AND</p>
            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-bold">{offerLetter.candidateName}</span>, {offerLetter.candidateAddress || 'residing at [Address]'}
              <br />(hereinafter referred to as "{isInternship ? 'Intern' : 'Employee'}")
            </p>
          </div>

          {/* Annexure Sections */}
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">1. Purpose</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                The {isInternship ? 'Intern' : 'Employee'} agrees to receive certain confidential, proprietary, and sensitive information solely for the purpose of performing duties related to the {isInternship ? 'internship' : 'employment'} with G{COMPANY_DEFAULTS.name}.
              </p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">2. Definition of Confidential Information</h3>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">"Confidential Information" includes but is not limited to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
                <li>Business plans, project roadmaps, and internal strategies</li>
                <li>Client, partner, and vendor information</li>
                <li>Pricing models, proposals, contracts, and technical specifications</li>
                <li>Financial data, internal reports, and proprietary algorithms</li>
                <li>Software source code, design assets, and development workflows</li>
                <li>Internal communications, documents, tools, and credentials</li>
                <li>Any information marked or understood to be confidential</li>
                <li>Any non-public information shared verbally, digitally, or in writing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">3. Obligations of the {isInternship ? 'Intern' : 'Employee'}</h3>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">The {isInternship ? 'Intern' : 'Employee'} agrees that they shall:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
                <li>Keep all Confidential Information strictly confidential</li>
                <li>Not disclose such information to any third party</li>
                <li>Not use Confidential Information for personal or external benefit</li>
                <li>Not copy, store, or retain Confidential Information beyond {isInternship ? 'internship' : 'employment'} needs</li>
                <li>Take reasonable measures to protect such information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">4. Exceptions</h3>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">Confidential Information does not include information that:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
                <li>Is publicly available without breach of this Agreement</li>
                <li>Is lawfully obtained from a third party without restriction</li>
                <li>Is required to be disclosed by law or court order, subject to prior notice to the Company where legally permitted</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">5. Intellectual Property</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                All work, data, materials, leads, documentation, strategies, or outputs created or accessed during the {isInternship ? 'internship' : 'employment'} remain the <span className="font-bold">exclusive property of G{COMPANY_DEFAULTS.name}</span>.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 mt-2">No license or ownership rights are granted to the {isInternship ? 'Intern' : 'Employee'}.</p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">6. Non-Solicitation</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                During the {isInternship ? 'internship' : 'employment'} and for a reasonable period thereafter as permitted by law, the {isInternship ? 'Intern' : 'Employee'} shall not solicit G{COMPANY_DEFAULTS.name}'s clients, partners, vendors, or employees for competing or personal purposes.
              </p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">7. Data Protection and Security</h3>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">The {isInternship ? 'Intern' : 'Employee'} agrees to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
                <li>Use only authorized devices and tools</li>
                <li>Not share login credentials</li>
                <li>Immediately report any data breach or security incident</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">8. Term and Survival</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                This Agreement shall remain effective <span className="font-bold">during the {isInternship ? 'internship' : 'employment'} and indefinitely thereafter</span>, regardless of the manner of termination.
              </p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">9. Breach and Remedies</h3>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">
                The {isInternship ? 'Intern' : 'Employee'} acknowledges that any breach may cause irreparable harm to the Company.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 mb-2">G{COMPANY_DEFAULTS.name} shall be entitled to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-slate-700">
                <li>Injunctive relief</li>
                <li>Monetary damages</li>
                <li>Legal costs and expenses</li>
                <li>Any other remedy available under Indian law</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">10. No Employment Relationship</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                This Agreement does not create an employment relationship, partnership, or agency between the parties.
              </p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">11. Governing Law and Jurisdiction</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                This Agreement shall be governed by the laws of India. Courts located in <span className="font-bold">Raipur, Chhattisgarh</span> shall have exclusive jurisdiction.
              </p>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">12. Entire Agreement</h3>
              <p className="text-sm leading-relaxed text-slate-700">
                This Agreement constitutes the entire understanding between the parties concerning confidentiality and supersedes all prior communications.
              </p>
            </div>
          </div>

          {/* Annexure Signature Section */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-6">Signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="text-sm font-bold text-slate-900 mb-4">For G{COMPANY_DEFAULTS.name}</p>
                <div className="mb-4">
                  <img src="/signature.png" alt="Signature" className="h-12 signature-img object-contain print:h-8" />
                </div>
                <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                <p className="font-bold text-slate-900 text-sm">Aman K.A</p>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Director's Office, G{COMPANY_DEFAULTS.name}</p>
                <p className="text-xs text-slate-600 mt-4">Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-4">{isInternship ? 'Intern' : 'Employee'}</p>
                <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                <p className="font-bold text-slate-900 text-sm">{offerLetter.candidateName}</p>
                <p className="text-xs text-slate-600 mt-4">Date: __________________</p>
              </div>
            </div>
          </div>

          {/* Legal Footer at end of Annexure */}
          <div className="mt-8 print:break-inside-avoid">
            <LegalFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPreview;
