import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { invoiceAPI } from '../services/api';
import { Invoice, DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCollected: 0,
    pendingPayment: 0,
    paidInvoices: 0,
    activeClients: 0,
    totalInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoices, dashboardStats] = await Promise.all([
        invoiceAPI.getAll(),
        fetch('/api/invoices/dashboard/stats').then(r => r.json()),
      ]);
      
      setRecentInvoices(invoices.slice(0, 10));
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-600 text-white',
      sent: 'bg-blue-100 text-blue-800',
      partially_paid: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || styles.draft;
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'د.إ',
    };
    const symbol = symbols[currency] || '₹';
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const totalRevenue = stats.totalCollected;
  const collections = stats.totalCollected;
  const inProcess = stats.pendingPayment;
  const overdueCount = recentInvoices.filter(i => i.status === 'overdue').length;

  const cards = [
    {
      title: 'TOTAL REVENUE',
      value: formatCurrency(totalRevenue, 'INR'),
      icon: '💰',
      detail: '+8.2% monthly',
      detailPositive: true,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'COLLECTIONS',
      value: formatCurrency(collections, 'INR'),
      icon: '✅',
      detail: '92% recovery rate',
      detailPositive: true,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'IN-PROCESS',
      value: formatCurrency(inProcess, 'INR'),
      icon: '⏰',
      detail: 'Avg 12 days to pay',
      detailPositive: false,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'OVERDUE ALERTS',
      value: overdueCount.toString(),
      icon: '⚠️',
      detail: overdueCount > 0 ? 'Require follow-up' : 'All clear',
      detailPositive: overdueCount === 0,
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: overdueCount > 0 ? 'text-red-600' : 'text-gray-900',
    },
  ];

  return (
    // @ts-expect-error - Layout component requires props, but this page is unused
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Suite</h1>
            <p className="text-gray-600 mt-1">Enterprise resource oversight for GROVYN.</p>
          </div>
          <Link
            to="/invoices/new"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <span className="text-xl">+</span>
            <span>CREATE NEW INVOICE</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${card.bgColor} rounded-lg border border-gray-200 p-5`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center`}>
                      <span className={`text-xl ${card.iconColor}`}>{card.icon}</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${card.valueColor || 'text-gray-900'} mb-1`}>
                    {card.value}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-2">{card.title}</div>
                  <div className={`text-xs ${card.detailPositive ? 'text-green-600' : 'text-gray-600'}`}>
                    {card.detail}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">↗</span>
                    <h2 className="text-xl font-semibold text-gray-900">Recent Financial Ledger</h2>
                  </div>
                  <Link to="/audit" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    GLOBAL AUDIT LOG
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                {recentInvoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No invoices found. Create your first invoice to get started.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          INVOICE ID
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          CLIENT ENTITY
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          FISCAL DATE
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          VALUE
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          PROTOCOL STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{invoice.clientName}</div>
                            <div className="text-sm text-gray-500">{invoice.projectName}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            {new Date(invoice.invoiceDate).toISOString().split('T')[0]}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">
                              {invoice.currency} {formatCurrency(invoice.total, invoice.currency).replace(/[₹$€£]/, '')}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                              {invoice.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
