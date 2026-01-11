import React from 'react';
import { Users, Search, Mail, ShieldCheck, UserPlus, ChevronRight } from 'lucide-react';
import { Client } from '../types/refTypes';

interface ClientsProps {
  searchTerm?: string;
  onViewDetails: (clientId: string) => void;
  onCreateNew: () => void;
  clients: Client[];
}

const Clients: React.FC<ClientsProps> = ({ searchTerm = '', onViewDetails, onCreateNew, clients }) => {
  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Entity Directory</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage all enterprise partners and verified engineering nodes.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-lg shadow-teal-500/10 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          Onboard New Client
        </button>
      </div>

      <div className="grovyn-card rounded-3xl overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter active scope..." 
                  value={searchTerm}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500/50 transition-all shadow-sm"
                />
             </div>
             <button className="px-4 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-500 hover:border-teal-200 transition-all">
                <Users size={20} />
             </button>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black rounded-full border border-teal-100 uppercase tracking-widest">Total: {clients.length}</span>
             <span className="px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-full border border-sky-100 uppercase tracking-widest">Matches: {filteredClients.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full">
              <thead>
                 <tr className="bg-white text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-5">Verified Entity</th>
                    <th className="px-8 py-5">Active Objective</th>
                    <th className="px-8 py-5">Temporal Index</th>
                    <th className="px-8 py-5 text-right">Fiscal Input</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredClients.map(client => (
                    <tr 
                      key={client.id} 
                      className="hover:bg-slate-50 group transition-colors cursor-pointer"
                      onClick={() => onViewDetails(client.id)}
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-teal-600 border border-slate-200 group-hover:bg-white group-hover:border-teal-200 transition-all uppercase">
                                {client.companyName[0]}
                             </div>
                             <div>
                                <p className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{client.companyName}</p>
                                <p className="text-xs text-slate-500 font-medium">{client.name}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <ShieldCheck size={14} className="text-sky-500" />
                             <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">{client.projectTitle}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-[11px] text-slate-400 mono font-bold">
                          JOINED {client.joinedDate}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <p className="font-black text-slate-900 mono">₹{(client.totalSpent || 0).toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${client.status === 'Active' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                             {client.status}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-2 text-slate-300 hover:text-teal-500 transition-colors" onClick={(e) => { e.stopPropagation(); }}><Mail size={18} /></button>
                             <button className="p-2 text-slate-300 hover:text-teal-600 transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={18} /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredClients.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                       No entities matched your current query filter.
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
