import React from 'react';
import { TrendingUp, Filter, Download, Zap, Globe } from 'lucide-react';
import { REVENUE_DATA } from '../constants';

const Analytics: React.FC = () => {
  const revenueData = REVENUE_DATA;
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Advanced Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium">Quantitative analysis of Grovyn architectural performance.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Filter Period
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/10">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 grovyn-card p-10 rounded-3xl flex flex-col">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">Revenue Stream</h3>
                  <p className="text-sm text-slate-500 font-medium">Monthly fiscal synchronization across nodes.</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Revenue</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-6 h-64 border-b border-slate-100 pb-1">
               {revenueData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-4 group">
                     <div className="w-full relative bg-slate-50 rounded-t-2xl overflow-hidden border-x border-t border-slate-100 group-hover:border-teal-200 transition-all" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-teal-500 group-hover:bg-teal-600 transition-colors"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        <div className="absolute -top-10 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg border border-slate-800">₹{(d.revenue / 1000).toFixed(1)}k</span>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d.month}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="grovyn-card p-8 rounded-3xl border-t-4 border-indigo-500/50">
               <Globe className="text-indigo-500 mb-4" size={24} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Coverage</p>
               <h4 className="text-2xl font-black text-slate-900 mb-2">12 Regions</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">US, UK, UAE Presence</p>
            </div>
            <div className="grovyn-card p-8 rounded-3xl border-t-4 border-rose-500/50">
               <TrendingUp className="text-rose-500 mb-4" size={24} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Index</p>
               <h4 className="text-2xl font-black text-slate-900 mb-2">+24.8%</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Quarterly Scaling</p>
            </div>
            <div className="grovyn-card p-8 rounded-3xl border-t-4 border-teal-500/50">
               <Zap className="text-teal-500 mb-4" size={24} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Load</p>
               <h4 className="text-2xl font-black text-slate-900 mb-2">Optimal</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Within SLAs</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
