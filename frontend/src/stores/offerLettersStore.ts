import { create } from 'zustand';
import { OfferLetter, OfferLetterStatus } from '../types/refTypes';
import { offerLetterAPI } from '../services/api';

interface OfferLettersState {
  offerLetters: OfferLetter[];
  loading: boolean;
  error: string | null;
  setOfferLetters: (offerLetters: OfferLetter[]) => void;
  addOfferLetter: (offerLetter: OfferLetter) => void;
  updateOfferLetter: (id: string, updates: Partial<OfferLetter>) => void;
  removeOfferLetter: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchOfferLetters: () => Promise<void>;
  saveOfferLetter: (offerLetter: OfferLetter) => Promise<OfferLetter>;
}

const transformStatus = (backendStatus: string): OfferLetterStatus => {
  const statusMap: Record<string, OfferLetterStatus> = {
    'draft': OfferLetterStatus.DRAFT,
    'sent': OfferLetterStatus.SENT,
    'accepted': OfferLetterStatus.ACCEPTED,
    'rejected': OfferLetterStatus.REJECTED,
    'expired': OfferLetterStatus.EXPIRED,
  };
  return statusMap[backendStatus.toLowerCase()] || OfferLetterStatus.DRAFT;
};

const transformBackendOfferLetter = (backendOfferLetter: any): OfferLetter => {
  return {
    id: backendOfferLetter._id || backendOfferLetter.id,
    offerNumber: backendOfferLetter.offerNumber,
    offerDate: backendOfferLetter.offerDate ? new Date(backendOfferLetter.offerDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: backendOfferLetter.validUntil ? new Date(backendOfferLetter.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    candidateName: backendOfferLetter.candidateName || '',
    candidateEmail: backendOfferLetter.candidateEmail || '',
    candidatePhone: backendOfferLetter.candidatePhone,
    candidateAddress: backendOfferLetter.candidateAddress,
    position: backendOfferLetter.position || '',
    department: backendOfferLetter.department || '',
    designation: backendOfferLetter.designation || '',
    reportingManager: backendOfferLetter.reportingManager,
    startDate: backendOfferLetter.startDate ? new Date(backendOfferLetter.startDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    employmentType: backendOfferLetter.employmentType || 'Full-Time',
    workLocation: backendOfferLetter.workLocation || '',
    salaryDetails: backendOfferLetter.salaryDetails || {
      baseSalary: 0,
      currency: 'INR',
    },
    noticePeriod: backendOfferLetter.noticePeriod,
    probationPeriod: backendOfferLetter.probationPeriod,
    termsAndConditions: backendOfferLetter.termsAndConditions,
    additionalNotes: backendOfferLetter.additionalNotes,
    acceptanceDeadline: backendOfferLetter.acceptanceDeadline ? new Date(backendOfferLetter.acceptanceDeadline).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: transformStatus(backendOfferLetter.status || 'draft'),
    createdAt: backendOfferLetter.createdAt || new Date().toISOString(),
    createdBy: backendOfferLetter.createdBy?.name || backendOfferLetter.createdBy || 'Admin',
  };
};

export const useOfferLettersStore = create<OfferLettersState>((set, get) => ({
  offerLetters: [],
  loading: false,
  error: null,

  setOfferLetters: (offerLetters) => set({ offerLetters }),

  addOfferLetter: (offerLetter) => set((state) => ({
    offerLetters: [...state.offerLetters, offerLetter],
  })),

  updateOfferLetter: (id, updates) => set((state) => ({
    offerLetters: state.offerLetters.map((ol) =>
      ol.id === id ? { ...ol, ...updates } : ol
    ),
  })),

  removeOfferLetter: (id) => set((state) => ({
    offerLetters: state.offerLetters.filter((ol) => ol.id !== id),
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchOfferLetters: async () => {
    set({ loading: true, error: null });
    try {
      const backendOfferLetters = await offerLetterAPI.getAll();
      const transformedOfferLetters = backendOfferLetters.map((ol: any) => transformBackendOfferLetter(ol));
      set({ offerLetters: transformedOfferLetters, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch offer letters', loading: false });
    }
  },

  saveOfferLetter: async (offerLetter: OfferLetter) => {
    try {
      const backendData: any = {
        offerDate: offerLetter.offerDate,
        validUntil: offerLetter.validUntil,
        candidateName: offerLetter.candidateName,
        candidateEmail: offerLetter.candidateEmail,
        candidatePhone: offerLetter.candidatePhone,
        candidateAddress: offerLetter.candidateAddress,
        position: offerLetter.position,
        department: offerLetter.department,
        designation: offerLetter.designation,
        reportingManager: offerLetter.reportingManager,
        startDate: offerLetter.startDate,
        employmentType: offerLetter.employmentType,
        workLocation: offerLetter.workLocation,
        salaryDetails: offerLetter.salaryDetails,
        noticePeriod: offerLetter.noticePeriod,
        probationPeriod: offerLetter.probationPeriod,
        termsAndConditions: offerLetter.termsAndConditions,
        additionalNotes: offerLetter.additionalNotes,
        acceptanceDeadline: offerLetter.acceptanceDeadline,
        status: offerLetter.status.toLowerCase().replace(' ', '_') || 'draft',
      };

      let savedOfferLetter;
      if (offerLetter.id && offerLetter.id.length > 10) {
        savedOfferLetter = await offerLetterAPI.update(offerLetter.id, backendData);
      } else {
        savedOfferLetter = await offerLetterAPI.create(backendData);
      }

      const transformedOfferLetter = transformBackendOfferLetter(savedOfferLetter);
      
      if (offerLetter.id && offerLetter.id.length > 10) {
        get().updateOfferLetter(transformedOfferLetter.id, transformedOfferLetter);
      } else {
        get().addOfferLetter(transformedOfferLetter);
      }

      return transformedOfferLetter;
    } catch (error: any) {
      set({ error: error.message || 'Failed to save offer letter' });
      throw error;
    }
  },
}));
