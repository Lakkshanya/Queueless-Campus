import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Layers, 
  Database, 
  Users, 
  Monitor, 
  Activity, 
  Bell, 
  User, 
  LogOut,
  ChevronRight,
  Zap,
  ShieldCheck
} from 'lucide-react';
import DashboardStatus from './DashboardStatus';

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard', roles: ['admin'] },
    { to: '/admin/counters', icon: <Layers size={20} />, label: 'Counters', roles: ['admin'] },
    { to: '/admin/services', icon: <Database size={20} />, label: 'Services', roles: ['admin'] },
    { to: '/admin/staff', icon: <Users size={20} />, label: 'Staff Management', roles: ['admin'] },
    { to: '/admin/notifications', icon: <Bell size={20} />, label: 'Notifications', roles: ['admin'] },
    { to: '/admin/analytics', icon: <Activity size={20} />, label: 'Analytics', roles: ['admin'] },
    
    { to: '/staff/dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard', roles: ['staff'] },
    { to: '/staff/queue', icon: <Activity size={20} />, label: 'Queue Handling', roles: ['staff'] },
    { to: '/staff/notifications', icon: <Bell size={20} />, label: 'Notifications', roles: ['staff'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className="h-screen w-full bg-[#0C0A09] text-[#FAFAF9] font-display flex overflow-hidden selection:bg-orange-600/30" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Sidebar */}
      <aside className="w-80 h-full bg-[#171412] border-r border-stone-800/40 p-8 flex flex-col justify-between sticky top-0 z-50 overflow-hidden shadow-[20px_0_50px_-10px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-transparent opacity-50" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-600/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <header className="mb-16 animate-in">
            <Link to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center gap-5 group">
              <div className="p-3 bg-orange-600 rounded-2xl shadow-[0_10px_30px_-5px_rgba(234,88,12,0.4)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tighter text-white leading-none font-display">Queue Less</h1>
                <p className="text-[10px] font-black text-stone-600 tracking-[0.3em] uppercase mt-2">Administrative Node</p>
              </div>
            </Link>
          </header>

          <nav className="space-y-4">
            {filteredLinks.map((link, idx) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isActive 
                    ? 'bg-orange-600 text-white shadow-[0_15px_30px_-10px_rgba(234,88,12,0.4)]' 
                    : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900/50'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent opacity-50" />
                  )}
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-orange-600'}`}>
                      {link.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{link.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="animate-in" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-10 relative z-10 animate-in delay-500">
          <div className="bg-stone-900/30 border border-stone-800/80 rounded-3xl p-6 shadow-inner group transition-all hover:border-orange-600/30">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600 font-black shadow-inner group-hover:border-orange-600/50 transition-all duration-500">
                {user.name?.charAt(0).toUpperCase() || <User size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold tracking-tight text-white uppercase truncate font-display">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1 h-1 rounded-full ${user.role === 'admin' ? 'bg-orange-600' : 'bg-blue-500'} shadow-[0_0_5px_rgba(234,88,12,0.5)]`} />
                  <p className="text-[9px] font-bold text-stone-600 uppercase tracking-widest leading-none">{user.role === 'admin' ? 'Administrator' : 'Staff Member'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[8px] font-black tracking-[0.3em] uppercase bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              System Active
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 p-6 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg active:scale-95 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-[#0C0A09] overflow-hidden">
        <header className="px-12 py-6 border-b border-stone-800/40 flex justify-between items-center bg-[#0C0A09]/80 backdrop-blur-2xl sticky top-0 z-40">
           <div className="flex items-center gap-8">
              <DashboardStatus />
              <div className="h-6 w-[1px] bg-stone-800/60" />
              <button 
                onClick={() => { window.location.reload(); }}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_10px_20px_-5px_rgba(234,88,12,0.3)] transition-all flex items-center gap-3 active:scale-95"
              >
                <Zap size={14} strokeWidth={3} />
                Finalize & Deploy
              </button>
           </div>
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 text-stone-600 text-[9px] font-black uppercase tracking-[0.3em] bg-stone-900/20 px-4 py-2 rounded-full border border-stone-800/40">
                 <Activity size={12} className="text-orange-600 animate-pulse" strokeWidth={3} />
                 Real-time Link Enabled
              </div>
              <div className="h-6 w-[1px] bg-stone-800/60" />
              <div className="flex items-center gap-4 p-1.5 bg-stone-900/40 border border-stone-800/60 rounded-2xl group transition-all hover:border-orange-600/30">
                 <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-orange-950/20">
                    {user.name?.charAt(0)}
                 </div>
                 <div className="pr-1 hidden lg:block">
                    <p className="text-[10px] font-bold uppercase text-white leading-none mb-1 font-display">{user.name}</p>
                    <p className="text-[8px] font-bold text-stone-600 uppercase tracking-widest leading-none">Authorized</p>
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-[#0C0A09] border border-stone-800 rounded-xl text-stone-600 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-90"
                 >
                    <LogOut size={16} strokeWidth={3} />
                 </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 scroll-smooth">
            <div className="animate-in relative z-10">
              <Outlet />
            </div>
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-orange-600/[0.02] blur-[150px] pointer-events-none" />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C; }
      `}} />
    </div>
  );
};

export default PortalLayout;
