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
  RefreshCw,
  Globe,
  Cpu,
  Server
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
      <div className="w-16 h-16 border-4 border-orange-600/10 border-t-orange-600 rounded-full animate-spin mb-6" />
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse">Initializing Neural Link...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Globe size={14} className="animate-pulse" />
            Global Terminal
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white">Console</h1>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mt-4 italic opacity-80">Real-time system telemetry and resource management</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStats}
            className="w-14 h-14 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-orange-600 hover:border-orange-600/30 transition-all active:rotate-180 duration-500 shadow-xl"
            title="Force Re-sync"
          >
            <RefreshCw size={20} />
          </button>
          <div className="bg-[#1C1917] px-8 py-5 rounded-[2rem] border border-stone-800 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-600/10 rounded-full blur-2xl -mr-6 -mt-6" />
             <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 border border-emerald-600/20">
                <Activity size={18} className="animate-pulse" />
             </div>
             <div>
                <p className="text-[9px] uppercase font-black tracking-[0.3em] text-stone-600">Infrastructure</p>
                <p className="text-xs font-black text-white tracking-widest">STABLE</p>
             </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Tokens Generated', val: stats?.totalTokensToday || 0, icon: <Zap className="text-orange-500" />, sub: 'Today (Global)', color: 'orange' },
          { label: 'Active Terminals', val: stats?.activeCounters || 0, icon: <Monitor className="text-emerald-500" />, sub: 'Staff Online', color: 'emerald' },
          { label: 'Active Queue', val: stats?.pendingToday || 0, icon: <Activity className="text-blue-500" />, sub: 'Waiting Tokens', color: 'blue' },
          { label: 'Wait Efficiency', val: `${stats?.avgWaitTime || 0}m`, icon: <Clock className="text-purple-500" />, sub: 'Avg Service Time', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1C1917] p-10 rounded-[3.5rem] border border-stone-800/60 relative overflow-hidden group hover:border-orange-600/30 transition-all shadow-2xl">
            <div className={`absolute top-0 right-0 w-48 h-48 bg-${stat.color}-600 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity blur-3xl`} />
            <div className="flex items-center justify-between mb-8">
              <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-600/10 flex items-center justify-center`}>
                 {stat.icon}
              </div>
            </div>
            <h3 className="text-5xl font-black mb-3 tracking-tighter text-white">{stat.val}</h3>
            <p className="text-stone-700 text-[9px] font-bold uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-16">
        {/* Queue Trends */}
        <div className="bg-[#1C1917] p-12 rounded-[4rem] border border-stone-800/60 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 opacity-[0.02] blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                 <Server className="text-orange-600" size={24} /> Load Distribution
               </h3>
               <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-2 px-10">Real-time service telemetry</p>
            </div>
            <ArrowUpRight className="text-stone-700" size={20} />
          </div>
          
          <div className="space-y-10 px-2">
            {stats?.serviceStats?.map((s, i) => (
              <div key={i} className="group">
                <div className="flex justify-between mb-4 items-end">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xs text-stone-600 group-hover:text-orange-600 group-hover:border-orange-600/30 transition-all uppercase">
                       {s.prefix || s.name.charAt(0)}
                    </div>
                    <div>
                       <span className="text-sm font-black uppercase tracking-tighter text-stone-300 group-hover:text-white transition-colors">{s.name}</span>
                       <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mt-0.5 opacity-60">Allocation Tier</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="text-lg font-black text-white tracking-tighter">{s.count}</span>
                     <p className="text-[8px] text-stone-700 font-bold uppercase tracking-widest">Active nodes</p>
                  </div>
                </div>
                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800 shadow-inner p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 group-hover:brightness-125 bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.4)]" 
                    style={{ width: `${Math.min(100, (s.count / (stats.totalTokensToday || 1)) * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
            {(!stats?.serviceStats || stats.serviceStats.length === 0) && (
               <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
                  <Cpu size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Waiting for telemetry data...</p>
               </div>
            )}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-[#1C1917] p-12 rounded-[4rem] border border-stone-800/60 shadow-2xl relative overflow-hidden flex flex-col">
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-[0.02] blur-3xl pointer-events-none" />
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                   <TrendingUp className="text-blue-600" size={24} /> Traffic Density
                 </h3>
                 <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-2 px-10">24-hour peak hour mapping</p>
              </div>
              <div className="bg-stone-900 px-6 py-2 rounded-full border border-stone-800 shadow-inner flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Live Scan</span>
              </div>
           </div>
           
           <div className="flex-1 flex items-end justify-between gap-1.5 px-4 h-48 relative pt-10">
              {peakHours.map((h, i) => (
                <div key={i} className="relative group/bar flex-1 h-full">
                   <div 
                     className={`absolute bottom-0 w-full group-hover/bar:bg-blue-500 transition-all rounded-sm ${h > 0 ? 'bg-blue-600/60 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-stone-900 border border-stone-800/50'}`} 
                     style={{ height: `${Math.max(4, Math.min(100, (h / (Math.max(...peakHours, 1))) * 100))}%` }} 
                   >
                      {h > 0 && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 shadow-2xl">
                           <p className="text-[9px] font-black text-white">{h} Events</p>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-10 flex justify-between px-2">
              {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'].map((t, i) => (
                 <span key={i} className="text-[9px] font-black uppercase tracking-widest text-stone-700">{t}</span>
              ))}
           </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[#1C1917] rounded-[4rem] border border-stone-800/60 shadow-2xl overflow-hidden mb-16">
        <header className="p-12 border-b border-stone-800/30 flex justify-between items-center bg-stone-900/10">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                 <ShieldCheck className="text-emerald-500" size={28} /> Audit Logs
               </h3>
               <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-2 italic px-10">Historical system transaction history</p>
            </div>
            <Link to="/admin/analytics" className="bg-stone-900/50 border border-stone-800 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white hover:border-orange-600/30 transition-all flex items-center gap-3 group shadow-xl">
              Expand Ledger <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </header>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-stone-700 text-[10px] font-black uppercase tracking-[0.4em] border-b border-stone-800/20 bg-stone-900/20">
                <th className="px-12 py-8">Signifier</th>
                <th className="px-10 py-8">Module</th>
                <th className="px-10 py-8">Event Payload</th>
                <th className="px-10 py-8">Subject Reference</th>
                <th className="px-12 py-8 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/10">
              {recentActivity.map((log, i) => (
                <tr key={i} className="group hover:bg-stone-900/40 transition-colors">
                  <td className="px-12 py-7 font-mono text-[10px] text-stone-600 group-hover:text-orange-600 transition-colors">#{log.id?.slice(-8) || `TRX-${1000 + i}`}</td>
                  <td className="px-10 py-7">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-stone-950 border border-stone-800 rounded-xl">
                      <div className="w-1 h-1 rounded-full bg-orange-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{log.module || 'SYSTEM'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-xs font-black text-stone-300 uppercase tracking-tighter leading-relaxed italic">{log.desc}</td>
                  <td className="px-10 py-7">
                     <p className="text-[10px] font-black text-stone-700 uppercase tracking-[0.2em]">{log.sub || 'STAKEHOLDER'}</p>
                  </td>
                  <td className="px-12 py-7 text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${log.color === 'text-emerald-500' ? 'border-emerald-900/20 bg-emerald-900/5' : 'border-orange-900/20 bg-orange-900/5'}`}>
                       <div className={`w-1 h-1 rounded-full ${log.color === 'text-emerald-500' ? 'bg-emerald-500' : 'bg-orange-600'}`} />
                       <span className={`text-[9px] font-black uppercase tracking-widest ${log.color || 'text-stone-500'}`}>{log.status === 'Completed' ? 'VALIDATED' : log.status || 'PENDING'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center opacity-10 italic">
                    <div className="flex flex-col items-center gap-6">
                       <Database size={64} strokeWidth={1} />
                       <p className="text-sm font-black uppercase tracking-widest">No transaction signatures found stored in local ledger.</p>
                    </div>
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
