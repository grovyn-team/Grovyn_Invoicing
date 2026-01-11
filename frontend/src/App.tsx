import React, { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceEditor from './components/InvoiceEditor';
import Analytics from './components/Analytics';
import Clients from './components/Clients';
import ClientDetails from './components/ClientDetails';
import ClientOnboarding from './components/ClientOnboarding';
import Notifications from './components/Notifications';
import Auth from './components/Auth';
import SystemConfiguration from './components/SystemConfiguration';
import { ToastContainer } from './components/Toast';
import { Invoice, UserRole } from './types/refTypes';
import { useUserStore } from './stores/userStore';
import { useClientsStore } from './stores/clientsStore';
import { useInvoicesStore } from './stores/invoicesStore';
import { useAppStore } from './stores/appStore';
import { useToastStore } from './stores/toastStore';

const App: React.FC = () => {
  const { user, loading, checkAuth, login, logout, updateUser } = useUserStore();
  const { clients, fetchClients, addClient } = useClientsStore();
  const { invoices, fetchInvoices } = useInvoicesStore();
  const saveInvoiceAction = useInvoicesStore((state) => state.saveInvoice);
  const {
    activeTab,
    searchTerm,
    selectedClientId,
    editingInvoice,
    setActiveTab,
    setSearchTerm,
    startNewInvoice,
    startEditInvoice,
    viewClient,
    startNewClient,
    completeClientCreation,
  } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, fetchClients]);

  useEffect(() => {
    if (user && clients.length > 0) {
      fetchInvoices(clients);
    }
  }, [user, clients, fetchInvoices]);

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

  // Get the editing invoice object
  const editingInvoiceObj = editingInvoice
    ? invoices.find((inv) => inv.id === editingInvoice)
    : null;

  // Get the selected client object
  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  // Search logic
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'analytics':
        return isAdmin ? <Analytics /> : <Dashboard invoices={filteredInvoices} onCreateNew={startNewInvoice} onEditInvoice={handleEditInvoice} />;
      case 'clients':
        return <Clients searchTerm={searchTerm} onViewDetails={handleViewClient} onCreateNew={handleStartNewClient} clients={clients} />;
      case 'client-details':
        if (!selectedClient) {
          setActiveTab('clients');
          return null;
        }
        return <ClientDetails client={selectedClient} invoices={invoices} onBack={() => setActiveTab('clients')} onEditInvoice={handleEditInvoice} userRole={user.role} />;
      case 'client-onboarding':
        return <ClientOnboarding onSave={handleClientCreated} onCancel={() => setActiveTab('clients')} />;
      case 'notifications':
        return <Notifications notifications={[]} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} />;
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
