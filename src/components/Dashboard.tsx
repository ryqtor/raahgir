import { useState, useEffect } from 'react';
import { Globe, Radio, MessageSquare, Archive, Shield, User, MessageCircle, Bell, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { LiveFeed } from './dashboard/LiveFeed';
import { MyQueries } from './dashboard/MyQueries';
import { GlobalArchive } from './dashboard/GlobalArchive';
import { VerificationCenter } from './dashboard/VerificationCenter';
import { Profile } from './dashboard/Profile';
import { ScamAlerts } from './dashboard/ScamAlerts';
import { MapModal } from './dashboard/MapModal';
import { useNavigate } from '../hooks/useNavigate';

type TabType = 'feed' | 'queries' | 'scam' | 'archive' | 'verification' | 'profile';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showChat, setShowChat] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { userLocation, chatMessages, sendChatMessage } = useDemo();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'idle'>('idle');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      setSyncStatus('synced');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const navItems = [
    { id: 'feed' as TabType, label: 'Live Feed', icon: Radio },
    { id: 'queries' as TabType, label: 'My Queries', icon: MessageSquare },
    { id: 'scam' as TabType, label: 'Scam Alerts', icon: Shield },
    { id: 'archive' as TabType, label: 'Global Archive', icon: Archive },
    ...(profile?.role === 'local' || profile?.role === 'admin'
      ? [{ id: 'verification' as TabType, label: 'Verification Center', icon: Shield }]
      : []),
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">RAHGIR</span>
          </div>

          <div className="flex items-center gap-6">
            {syncStatus !== 'idle' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg animate-pulse">
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-teal-500'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {syncStatus === 'syncing' ? 'Global Data Syncing...' : 'Global Shield Active'}
                </span>
              </div>
            )}

            <button 
              onClick={() => setShowMap(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 hover:bg-teal-50 hover:border-teal-100 transition-all cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-left text-slate-600">
                <span className="font-semibold block leading-tight">Live Location</span>
                <span className="text-slate-500">{userLocation}</span>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-full transition-colors ${showChat ? 'bg-teal-50 text-teal-600' : 'hover:bg-gray-100 text-slate-600'}`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {profile && (
            <div className="p-4 border-t border-gray-200 mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {profile.full_name || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {profile.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'feed' && <LiveFeed />}
          {activeTab === 'queries' && <MyQueries />}
          {activeTab === 'scam' && <ScamAlerts />}
          {activeTab === 'archive' && <GlobalArchive />}
          {activeTab === 'verification' && <VerificationCenter />}
          {activeTab === 'profile' && <Profile />}
        </main>
      </div>

      {showChat && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          <div className="p-4 bg-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Support Chat</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="hover:text-teal-200 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender === 'You' 
                    ? 'bg-teal-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('message') as HTMLInputElement;
              if (input.value.trim()) {
                sendChatMessage(input.value);
                input.value = '';
              }
            }}
            className="p-4 border-t border-gray-200 bg-white"
          >
            <div className="flex gap-2">
              <input
                name="message"
                type="text"
                autoComplete="off"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button 
                type="submit"
                className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {showMap && userLocation && (
        <MapModal 
          location={userLocation} 
          onClose={() => setShowMap(false)} 
        />
      )}

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
            <Shield className="w-5 h-5 text-teal-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">Global Safety Sync Complete</span>
              <span className="text-[10px] text-slate-400">Successfully matched with 584 local safety protocols globally.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
