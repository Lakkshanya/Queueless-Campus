import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Monitor, 
  Layers, 
  Users, 
  Database, 
  Bell, 
  BarChart3, 
  LogOut,
  User,
  Activity
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
    // Admin Sidebar
    { to: '/admin/dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard', roles: ['admin'] },
    { to: '/admin/counters', icon: <Layers size={18} />, label: 'Counters', roles: ['admin'] },
    { to: '/admin/services', icon: <Database size={18} />, label: 'Services', roles: ['admin'] },
    { to: '/admin/staff', icon: <Users size={18} />, label: 'Staff Management', roles: ['admin'] },
    { to: '/admin/monitoring', icon: <Monitor size={18} />, label: 'Monitoring', roles: ['admin'] },
    { to: '/admin/analytics', icon: <Activity size={18} />, label: 'Analytics', roles: ['admin'] },
    { to: '/admin/notifications', icon: <Bell size={18} />, label: 'Notifications', roles: ['admin'] },
    { to: '/admin/profile', icon: <User size={18} />, label: 'Profile', roles: ['admin'] },

    // Staff Sidebar
    { to: '/staff/dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard', roles: ['staff'] },
    { to: '/staff/queue', icon: <Activity size={18} />, label: 'Queue Handling', roles: ['staff'] },
    { to: '/staff/notifications', icon: <Bell size={18} />, label: 'Notifications', roles: ['staff'] },
    { to: '/staff/profile', icon: <User size={18} />, label: 'Profile', roles: ['staff'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#1F1D1B] text-[#FAFAF9] font-sans flex text-[10px]">
      <aside className="w-72 bg-[#1C1917] border-r border-stone-800/50 flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <Link to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 bg-[#9A3412] rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/20 rotate-3 group-hover:rotate-0 transition-transform">
              <span className="text-white text-2xl font-black">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter lowercase leading-none">queue<span className="text-[#9A3412] uppercase font-bold text-lg">Less</span></h1>
              <p className="text-stone-600 text-[8px] font-bold tracking-[0.3em] uppercase">Control Center</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive 
                    ? 'bg-[#9A3412]/10 text-white border border-[#9A3412]/20 shadow-inner shadow-[#9A3412]/5' 
                    : 'text-stone-500 hover:text-[#FAFAF9] hover:bg-stone-900 border border-transparent'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#9A3412]' : 'group-hover:text-[#9A3412]'} transition-colors`}>
                    {link.icon}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-stone-800/50 bg-[#1C1917]/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-900 rounded-full border border-stone-800 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-stone-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest truncate">{user?.name}</p>
              <p className="text-[9px] text-[#9A3412] font-bold uppercase tracking-widest">{user?.role === 'admin' ? 'Administrator' : 'Academic Staff'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-950/10 border border-red-900/20 text-red-500 hover:bg-red-900/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <header className="px-12 py-6 border-b border-stone-800/20 flex justify-between items-center bg-[#1F1D1B]/80 backdrop-blur-xl sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <DashboardStatus />
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-stone-600 text-[10px] font-bold uppercase tracking-widest hidden md:flex">
                 <Activity size={14} className="text-[#9A3412]" />
                 Live Updates Enabled
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/40 rounded-full transition-all text-[9px] font-black uppercase tracking-widest group"
              >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                Logout
              </button>
           </div>
        </header>

        <div className="p-12">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
