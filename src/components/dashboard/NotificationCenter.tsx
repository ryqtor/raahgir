import { Bell, Info, MessageSquare, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useSafeTravel } from '../../contexts/SafeTravelContext';
import { Notification } from '../../lib/supabase';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { notifications, markNotificationRead } = useSafeTravel();

  const getIcon = (type: string) => {
    switch (type) {
      case 'answer': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'verification': return <ShieldCheck className="w-4 h-4 text-teal-500" />;
      case 'helpful': return <Sparkles className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
            <p className="text-sm text-slate-400">All quiet for now!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n: Notification) => (
              <div 
                key={n.id} 
                onClick={() => !n.is_read && markNotificationRead(n.id)}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-teal-50/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-2">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 text-center">
        <button className="text-[10px] font-bold text-teal-600 hover:text-teal-700">
          Clear All
        </button>
      </div>
    </div>
  );
}
