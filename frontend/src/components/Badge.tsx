import React from 'react';

interface BadgeProps {
  status: string;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Sent': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Overdue': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Partially Paid': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Cancelled': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles['Draft']} shadow-sm`}>
      {status}
    </span>
  );
};

export default Badge;
