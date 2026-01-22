import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceEditor from './components/InvoiceEditor';
import QuotationEditor from './components/QuotationEditor';
import Quotations from './components/Quotations';
import OfferLetterEditor from './components/OfferLetterEditor';
import OfferLetters from './components/OfferLetters';
import Analytics from './components/Analytics';
import Clients from './components/Clients';
import ClientDetails from './components/ClientDetails';
import ClientOnboarding from './components/ClientOnboarding';
import Notifications from './components/Notifications';
import Auth from './components/Auth';
import SystemConfiguration from './components/SystemConfiguration';
import { ToastContainer } from './components/Toast';
import { Invoice, Quotation, OfferLetter, UserRole, Proposal } from './types/refTypes';
import { useUserStore } from './stores/userStore';
import { useClientsStore } from './stores/clientsStore';
import { useInvoicesStore } from './stores/invoicesStore';
import { useQuotationsStore } from './stores/quotationsStore';
import { useOfferLettersStore } from './stores/offerLettersStore';
import { useAppStore } from './stores/appStore';
import { useToastStore } from './stores/toastStore';
import Proposals from './components/Proposals';
import ProposalEditor from './components/ProposalEditor';
import { useProposalsStore } from './stores/proposalStore';
const App: React.FC = () => {
  const { user, loading, checkAuth, login, logout, updateUser } = useUserStore();
  const { clients, fetchClients, addClient } = useClientsStore();
  const invoices = useInvoicesStore((state) => state.invoices);
  const fetchInvoices = useInvoicesStore((state) => state.fetchInvoices);
  const quotations = useQuotationsStore((state) => state.quotations);
  const fetchQuotations = useQuotationsStore((state) => state.fetchQuotations);
  const offerLetters = useOfferLettersStore((state) => state.offerLetters);
  const fetchOfferLetters = useOfferLettersStore((state) => state.fetchOfferLetters);
  const saveInvoiceAction = useInvoicesStore((state) => state.saveInvoice);
  const saveQuotationAction = useQuotationsStore((state) => state.saveQuotation);
  const saveOfferLetterAction = useOfferLettersStore((state) => state.saveOfferLetter);
  const proposals = useProposalsStore((state: any) => state.proposals);
  const fetchProposals = useProposalsStore((state: any) => state.fetchProposals);
  const saveProposalAction = useProposalsStore((state: any) => state.saveProposal);
  const {
    activeTab,
    searchTerm,
    selectedClientId,
    editingInvoice,
    editingQuotation,
    editingOfferLetter,
    editingProposal,
    isCreating,
    setActiveTab,
    setSearchTerm,
    startNewInvoice,
    startEditInvoice,
    startNewQuotation,
    startEditQuotation,
    startNewOfferLetter,
    startEditOfferLetter,
    startNewProposal,
    startEditProposal,
    setEditingProposal,
    setIsCreating,
    viewClient,
    startNewClient,
    completeClientCreation,
  } = useAppStore();

  const [hasFetchedData, setHasFetchedData] = useState(false);
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const clientsLoading = useClientsStore((state) => state.loading);

  // Fetch clients when user is available
  useEffect(() => {
    if (user && clients.length === 0 && !clientsLoading) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clients.length, clientsLoading]); // Depend on user, clients.length, and loading state

  // Reset fetch flag when user changes
  useEffect(() => {
    if (!user) {
      setHasFetchedData(false);
    }
  }, [user]);

  // Fetch invoices and quotations once clients are loaded
  useEffect(() => {
    if (user && clients.length > 0 && !hasFetchedData) {
      const invoicesLoading = useInvoicesStore.getState().loading;
      const quotationsLoading = useQuotationsStore.getState().loading;

      // Only fetch if not already loading and data is empty
      if (!invoicesLoading && invoices.length === 0) {
        fetchInvoices(clients);
      }

      if (!quotationsLoading && quotations.length === 0) {
        fetchQuotations(clients);
      }

      const offerLettersLoading = useOfferLettersStore.getState().loading;
      if (!offerLettersLoading && offerLetters.length === 0) {
        fetchOfferLetters();
      }

      setHasFetchedData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clients.length, hasFetchedData, offerLetters.length]); // Only re-fetch if clients.length changes from 0 to >0

  const handleLogin = (userData: Parameters<typeof login>[0]) => {
    login(userData);
  };

  const handleLogout = () => {
    logout();
  };

  const handleUserUpdate = (updatedUser: any) => {
    updateUser(updatedUser);
  };

  const { toasts, removeToast } = useToastStore();

  const saveInvoice = async (invoice: Invoice) => {
    try {
      await saveInvoiceAction(invoice, clients);
      useAppStore.getState().setActiveTab('invoices');
      useAppStore.getState().setEditingInvoice(null);
      useAppStore.getState().setIsCreating(false);
      // Refresh invoices list
      await fetchInvoices(clients);
      // Show success toast
      useToastStore.getState().success('Invoice saved successfully!');
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      // Show error toast
      useToastStore.getState().error(error.message || 'Failed to save invoice. Please try again.');
    }
  };

  const handleViewClient = (clientId: string) => {
    viewClient(clientId);
  };

  const handleStartNewClient = () => {
    startNewClient();
  };

  const handleClientCreated = (client: Parameters<typeof addClient>[0]) => {
    addClient(client);
    completeClientCreation();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    startEditInvoice(invoice.id);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    startEditQuotation(quotation.id);
  };

  const handleEditOfferLetter = (offerLetter: OfferLetter) => {
    startEditOfferLetter(offerLetter.id);
  };

  const saveQuotation = async (quotation: Quotation) => {
    try {
      await saveQuotationAction(quotation, clients);
      useAppStore.getState().setActiveTab('quotations');
      useAppStore.getState().setEditingQuotation(null);
      useAppStore.getState().setIsCreating(false);
      await fetchQuotations(clients);
      useToastStore.getState().success('Quotation saved successfully!');
    } catch (error: any) {
      console.error('Failed to save quotation:', error);
      useToastStore.getState().error(error.message || 'Failed to save quotation. Please try again.');
    }
  };

  const editingInvoiceObj = editingInvoice
    ? invoices.find((inv) => inv.id === editingInvoice)
    : null;

  const editingQuotationObj = editingQuotation
    ? quotations.find((quo) => quo.id === editingQuotation)
    : null;

  const editingOfferLetterObj = editingOfferLetter
    ? offerLetters.find((ol: OfferLetter) => ol.id === editingOfferLetter)
    : null;

  const editingProposalObj = editingProposal
    ? proposals.find((p: Proposal) => p.id === editingProposal)
    : null;

  const saveOfferLetter = async (offerLetter: OfferLetter) => {
    try {
      await saveOfferLetterAction(offerLetter);
      useAppStore.getState().setActiveTab('offer-letters');
      useAppStore.getState().setEditingOfferLetter(null);
      useAppStore.getState().setIsCreating(false);
      await fetchOfferLetters();
      useToastStore.getState().success('Offer letter saved successfully!');
    } catch (error: any) {
      console.error('Failed to save offer letter:', error);
      useToastStore.getState().error(error.message || 'Failed to save offer letter. Please try again.');
    }
  };

  // Proposal handlers
  // Using startNewProposal and startEditProposal from store directly

  const handleEditProposal = (proposal: Proposal) => {
    startEditProposal(proposal.id);
    setActiveTab('proposals');
  };

  const saveProposal = async (proposal: Proposal) => {
    try {
      await saveProposalAction(proposal, clients);
      setActiveTab('proposals');
      setEditingProposal(null);
      setIsCreating(false);
      await fetchProposals(clients);
      useToastStore.getState().success('Proposal saved successfully!');
    } catch (error: any) {
      console.error('Failed to save proposal:', error);
      useToastStore.getState().error(error.message || 'Failed to save proposal. Please try again.');
    }
  };

  // Get the selected client object
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  // Search logic
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const isAdmin = user.role === UserRole.ADMIN;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard invoices={filteredInvoices} onCreateNew={startNewInvoice} onEditInvoice={handleEditInvoice} />;
      case 'invoices':
        return (
          <InvoiceEditor
            initialInvoice={editingInvoiceObj || undefined}
            onSave={saveInvoice}
            onCancel={() => setActiveTab('dashboard')}
            clients={clients}
          />
        );
      case 'quotations':
        if (isCreating || editingQuotationObj || editingQuotation) {
          return (
            <QuotationEditor
              initialQuotation={editingQuotationObj || undefined}
              onSave={saveQuotation}
              onCancel={() => {
                useAppStore.getState().setIsCreating(false);
                useAppStore.getState().setEditingQuotation(null);
                setActiveTab('quotations');
              }}
              clients={clients}
            />
          );
        }
        return (
          <Quotations
            quotations={quotations}
            onCreateNew={startNewQuotation}
            onEditQuotation={handleEditQuotation}
          />
        );
      case 'offer-letters':
        if (isCreating || editingOfferLetterObj || editingOfferLetter) {
          return (
            <OfferLetterEditor
              initialOfferLetter={editingOfferLetterObj || undefined}
              onSave={saveOfferLetter}
              onCancel={() => {
                useAppStore.getState().setIsCreating(false);
                useAppStore.getState().setEditingOfferLetter(null);
                setActiveTab('offer-letters');
              }}
            />
          );
        }
        return (
          <OfferLetters
            offerLetters={offerLetters}
            onCreateNew={startNewOfferLetter}
            onEditOfferLetter={handleEditOfferLetter}
          />
        );
      case 'proposals':
        if (isCreating || editingProposalObj || editingProposal) {
          return (
            <ProposalEditor
              initialProposal={editingProposalObj || undefined}
              onSave={saveProposal}
              onCancel={() => {
                useAppStore.getState().setIsCreating(false);
                useAppStore.getState().setEditingProposal(null);
                setActiveTab('proposals');
              }}
              clients={clients}
            />
          );
        }
        return <Proposals proposals={proposals} onCreateNew={startNewProposal} onEditProposal={handleEditProposal} />;
      case 'analytics':
        return isAdmin ? <Analytics /> : <Dashboard invoices={filteredInvoices} onCreateNew={startNewInvoice} onEditInvoice={handleEditInvoice} />;
      case 'clients':
        return <Clients onSearch={setSearchTerm} searchTerm={searchTerm} onViewDetails={handleViewClient} onCreateNew={handleStartNewClient} clients={clients} />;
      case 'client-details':
        if (!selectedClient) {
          setActiveTab('clients');
          return null;
        }
        return <ClientDetails client={selectedClient} invoices={invoices} onBack={() => setActiveTab('clients')} onEditInvoice={handleEditInvoice} userRole={user.role} />;
      case 'client-onboarding':
        return <ClientOnboarding onSave={handleClientCreated} onCancel={() => setActiveTab('clients')} />;
      case 'notifications':
        return <Notifications notifications={[]} onMarkAsRead={() => { }} onMarkAllAsRead={() => { }} />;
      case 'audit':
        return isAdmin ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">System Immutable Audit Trail</h2>
              <div className="space-y-6">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 border-l-2 border-teal-500 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0">
                      {inv.createdBy[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Invoice {inv.invoiceNumber} created by {inv.createdBy}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Timestamp: {inv.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;
      case 'settings':
        return <SystemConfiguration isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
        onSearch={setSearchTerm}
        onLogout={handleLogout}
        userAvatar={user.avatar}
        userName={user.name}
        userId={user.id || ''}
        userEmail={user.email || ''}
        onUserUpdate={handleUserUpdate}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
