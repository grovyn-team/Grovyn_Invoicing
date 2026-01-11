import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Clock } from 'lucide-react';
import { AppNotification } from '../types/refTypes';

interface NotificationsProps {
  notifications: AppNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      case 'error': return <XCircle className="text-rose-500" size={20} />;
      default: return <Info className="text-sky-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time system events and financial alerts.</p>
        </div>
        {onMarkAllAsRead && (
          <button 
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest px-4 py-2 bg-teal-50 rounded-lg border border-teal-100 transition-all"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 flex gap-4 items-start transition-colors hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-teal-50/20' : ''}`}
              onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
            >
              <div className={`p-2 rounded-xl border ${!notif.read ? 'bg-white border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-sm ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {notif.timestamp}
                  </div>
                </div>
                <p className={`text-sm mt-1 leading-relaxed ${!notif.read ? 'text-slate-700' : 'text-slate-500'}`}>{notif.message}</p>
                {!notif.read && (
                  <div className="mt-3 flex gap-2">
                    <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-teal-500 text-white rounded-md shadow-sm">View Details</button>
                    <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1 text-slate-400 hover:text-slate-600">Dismiss</button>
                  </div>
                )}
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-20 text-center">
            <Bell size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No new notifications in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
