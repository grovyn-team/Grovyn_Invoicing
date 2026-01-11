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
import { Invoice, UserRole } from './types/refTypes';
import { useUserStore } from './stores/userStore';
import { useClientsStore } from './stores/clientsStore';
import { useInvoicesStore } from './stores/invoicesStore';
import { useAppStore } from './stores/appStore';

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

  const saveInvoice = async (invoice: Invoice) => {
    try {
      await saveInvoiceAction(invoice, clients);
      useAppStore.getState().setActiveTab('invoices');
      useAppStore.getState().setEditingInvoice(null);
      useAppStore.getState().setIsCreating(false);
      // Refresh invoices list
      await fetchInvoices(clients);
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      // You can add error handling UI here (e.g., toast notification)
      alert(error.message || 'Failed to save invoice. Please try again.');
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
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Company Legal Metadata</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Registered Entity Name</label>
                    <input
                      disabled={!isAdmin}
                      type="text"
                      defaultValue="GROVYN ENGINEERING PRIVATE LIMITED"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">GSTIN Protocol</label>
                    <input
                      disabled={!isAdmin}
                      type="text"
                      defaultValue="27AABCG1234F1Z1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mono disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">PAN Node</label>
                    <input
                      disabled={!isAdmin}
                      type="text"
                      defaultValue="AABCG1234F"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold mono disabled:opacity-70"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-teal-500 p-8 rounded-2xl text-white shadow-xl shadow-teal-500/20">
                <h3 className="font-black text-lg mb-4">Architecture Mode</h3>
                <p className="text-sm font-bold opacity-80 leading-relaxed mb-8 italic">
                  "Systems must be secure, compliant, and dependable over time. Quality is not an afterthought."
                </p>
                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Current SLA</p>
                  <p className="text-xl font-black">99.9% Uptime</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
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
  );
};

export default App;
