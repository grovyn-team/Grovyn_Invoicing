import { Request, Response } from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Payment from '../models/Payment.js';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  globalCoverage: {
    regions: number;
    countries: string[];
  };
  growthIndex: {
    percentage: number;
    period: string;
  };
  systemLoad: {
    status: string;
    invoicesProcessed: number;
  };
}

const getMonthAbbr = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()];
};

const getLastNMonths = (n: number): { month: string; startDate: Date; endDate: Date }[] => {
  const months: { month: string; startDate: Date; endDate: Date }[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    months.push({
      month: getMonthAbbr(date),
      startDate,
      endDate,
    });
  }
  
  return months;
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find().lean();
    const payments = await Payment.find().lean();
    const clients = await Client.find({ isActive: true }).lean();

    const last6Months = getLastNMonths(6);
    const monthlyRevenue: MonthlyRevenue[] = last6Months.map(({ month, startDate, endDate }) => {
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate >= startDate && invDate <= endDate;
      });

      const revenue = monthInvoices
        .filter(inv => inv.status !== 'draft' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      return { month, revenue };
    });

    const uniqueCountries = new Set<string>();
    clients.forEach(client => {
      if (client.country) {
        uniqueCountries.add(client.country);
      }
    });

    const countryList = Array.from(uniqueCountries);
    const regions = countryList.length;

    const countryDisplayNames: Record<string, string> = {
      'India': 'IN',
      'United States': 'US',
      'USA': 'US',
      'United Kingdom': 'UK',
      'UK': 'UK',
      'United Arab Emirates': 'UAE',
      'UAE': 'UAE',
    };
    
    const displayCountries = countryList
      .map(c => countryDisplayNames[c] || c.substring(0, 3).toUpperCase())
      .slice(0, 3)
      .join(', ');
    
    const last3MonthsRevenue = monthlyRevenue.slice(-3).reduce((sum, m) => sum + m.revenue, 0);
    const previous3MonthsRevenue = monthlyRevenue.slice(0, 3).reduce((sum, m) => sum + m.revenue, 0);
    
    let growthPercentage = 0;
    if (previous3MonthsRevenue > 0) {
      growthPercentage = ((last3MonthsRevenue - previous3MonthsRevenue) / previous3MonthsRevenue) * 100;
    } else if (last3MonthsRevenue > 0) {
      growthPercentage = 100;
    }

    const totalInvoices = invoices.length;
    const last30DaysInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      const daysAgo = (Date.now() - invDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    let systemStatus = 'Optimal';
    if (last30DaysInvoices > 100) {
      systemStatus = 'High';
    } else if (last30DaysInvoices > 50) {
      systemStatus = 'Moderate';
    }
    
    const analyticsData: AnalyticsData = {
      monthlyRevenue,
      globalCoverage: {
        regions,
        countries: countryList,
      },
      growthIndex: {
        percentage: growthPercentage,
        period: 'Quarterly Scaling',
      },
      systemLoad: {
        status: systemStatus,
        invoicesProcessed: totalInvoices,
      },
    };
    
    res.json(analyticsData);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
};
