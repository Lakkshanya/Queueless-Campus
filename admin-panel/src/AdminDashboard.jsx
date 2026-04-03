import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Activity, 
  Bell, 
  Users, 
  BarChart3, 
  Database, 
  LogOut, 
  ClipboardList, 
  Layers, 
  Monitor,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [peakHours, setPeakHours] = useState(new Array(24).fill(0));
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [statsRes, peakRes, activityRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/peak-hours'),
        api.get('/analytics/recent-activity')
      ]);
      setStats(statsRes.data);
      setPeakHours(peakRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      // Background fetch without setting loading(true) again
      Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/peak-hours'),
        api.get('/analytics/recent-activity')
      ]).then(([s, p, a]) => {
        setStats(s.data);
        setPeakHours(p.data);
        setRecentActivity(a.data);
      });
    }, 30000); 
    return () => clearInterval(interval);
  }, [user]);

  if (loading && !stats) return (
    <div className="flex flex-col items-center justify-center py-40 font-sans">
      <div className="w-16 h-16 border-4 border-[#9A3412]/10 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing Terminal...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <Activity size={12} />
            System Insights
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter">Administration</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStats}
            className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
            title="Manual Re-sync"
          >
            <RefreshCw size={18} />
          </button>
          <div className="px-5 py-3 bg-[#1C1917] border border-stone-800 rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D6D3D1]">System Operational</span>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Tokens Today', val: stats?.totalTokensToday || 0, icon: <TrendingUp className="text-orange-500" />, sub: 'Token Generation' },
          { label: 'Active Counters', val: stats?.activeCounters || 0, icon: <Zap className="text-yellow-500" />, sub: 'Online Terminals' },
          { label: 'Pending Documents', val: stats?.pendingDocuments || 0, icon: <ClipboardList className="text-blue-500" />, sub: 'Verification Queue' },
          { label: 'Wait Efficiency', val: `${stats?.avgWaitTime || 0}m`, icon: <Clock className="text-purple-500" />, sub: 'Avg Processing Time' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1C1917] p-8 rounded-[2.5rem] border border-stone-800/50 relative overflow-hidden group hover:border-[#9A3412]/30 transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              {stat.icon}
            </div>
            <h3 className="text-4xl font-black mb-1 tracking-tighter">{stat.val}</h3>
            <p className="text-stone-600 text-[9px] font-bold uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
        {/* Queue Trends */}
        <div className="bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Database className="text-[#9A3412]" size={24} />
              Queue Trends: Service Load
            </h3>
            <ArrowUpRight className="text-stone-700" size={20} />
          </div>
          
          <div className="space-y-8">
            {stats?.serviceStats?.map((s, i) => (
              <div key={i} className="group">
                <div className="flex justify-between mb-3 items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9A3412] shadow-[0_0_8px_rgba(154,52,18,0.5)]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#FAFAF9]">{s.name}</span>
                  </div>
                  <span className="text-[10px] text-[#9A3412] font-black uppercase tracking-widest">{s.count} Subjects</span>
                </div>
                <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800/30 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-[#9A3412] to-[#C2410C] h-full rounded-full transition-all duration-1000 group-hover:brightness-125" 
                    style={{ width: `${(s.count / (stats.totalTokensToday || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 shadow-2xl relative overflow-hidden flex flex-col">
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/5 blur-3xl pointer-events-none" />
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                <TrendingUp className="text-blue-500" size={24} />
                Peak Hour Distribution
              </h3>
              <div className="bg-stone-900/50 px-4 py-1.5 rounded-full border border-stone-800">
                 <span className="text-[8px] font-black uppercase tracking-widest text-stone-500">Live Traffic Scan</span>
              </div>
           </div>
           <div className="flex-1 flex items-center justify-center min-h-[150px] relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-xl scale-75">
                  <Activity size={180} />
              </div>
              <div className="grid grid-cols-24 gap-1 items-end w-full px-4 h-32">
                 {peakHours.map((h, i) => (
                   <div key={i} className="relative group/bar flex-1 h-full">
                      <div 
                        className={`absolute bottom-0 w-full group-hover/bar:bg-[#9A3412] transition-all rounded-sm ${h > 0 ? 'bg-[#9A3412]/60' : 'bg-stone-900 border border-stone-800/50'}`} 
                        style={{ height: `${Math.min(100, (h / (Math.max(...peakHours, 1))) * 100)}%` }} 
                      />
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-8 flex justify-between px-4">
              {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'].map((t, i) => (
                 <span key={i} className="text-[8px] font-black uppercase tracking-widest text-stone-700">{t}</span>
              ))}
           </div>
        </div>
      </div>

      {/* Activity Table (FORMALIZED) */}
      <div className="bg-[#1C1917] rounded-[3.5rem] border border-stone-800/50 shadow-2xl overflow-hidden mb-12">
        <header className="p-10 border-b border-stone-800/30 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Zap className="text-[#9A3412]" size={24} />
              Recent System Activity
            </h3>
            <Link to="/admin/analytics" className="text-[10px] font-black uppercase tracking-widest text-stone-600 hover:text-[#9A3412] transition-colors flex items-center gap-2 group">
              Audit Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </header>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-stone-700 text-[9px] font-black uppercase tracking-[0.3em] border-b border-stone-800/20">
                <th className="px-10 py-6">Transaction ID</th>
                <th className="px-8 py-6">Event Module</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6">Subject</th>
                <th className="px-10 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/20">
              {recentActivity.map((log, i) => (
                <tr key={i} className="group hover:bg-[#1F1D1B]/40 transition-colors">
                  <td className="px-10 py-5 font-mono text-[10px] text-stone-600 group-hover:text-stone-400 transition-colors">{log.id}</td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg">
                      <div className="w-1 h-1 rounded-full bg-[#9A3412]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">{log.module}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-bold text-[#FAFAF9] uppercase tracking-tighter">{log.desc}</td>
                  <td className="px-8 py-5 text-[10px] font-black text-stone-700 uppercase tracking-widest">{log.sub}</td>
                  <td className="px-10 py-5 text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-stone-700 text-[10px] font-black uppercase tracking-widest opacity-30">
                    Scanning for system events...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #292524; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9A3412; }
      `}} />
    </div>
  );
};

export default AdminDashboard;
