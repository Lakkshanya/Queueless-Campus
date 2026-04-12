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
  Server,
  Layout,
  MessageSquare,
  History
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
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center font-sans px-5">
      <div className="w-16 h-16 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,88,12,0.2)]" />
      <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Admin Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0A09] selection:bg-orange-600/30 font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4 bg-orange-600/5 w-fit px-5 py-2 rounded-full border border-orange-600/10">
              <ShieldCheck size={14} className="animate-pulse" strokeWidth={3} />
              Administrative Control
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl">Overview</h1>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mt-4 ml-1 opacity-80 italic">Real-time system metrics and professional resource management</p>
          </div>
          
          <div className="flex items-center gap-4 animate-in slide-in-from-right duration-700">
            <button 
              onClick={fetchStats}
              className="w-12 h-12 bg-[#171412] border border-stone-800 rounded-xl flex items-center justify-center text-stone-600 hover:text-orange-600 hover:border-orange-600/40 transition-all active:rotate-180 duration-700 shadow-2xl group"
              title="Refresh Data"
            >
              <RefreshCw size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="bg-[#171412] px-5 py-3 rounded-xl border border-stone-800/80 flex items-center gap-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-600/5 rounded-full blur-2xl -mr-6 -mt-3 pointer-events-none" />
               <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-500 shadow-inner group-hover:border-emerald-500/30 transition-all">
                  <Activity size={18} className="animate-pulse" strokeWidth={2.5} />
               </div>
               <div>
                  <p className="text-[9px] uppercase font-black tracking-[0.3em] text-stone-600 mb-0.5">System Status</p>
                  <p className="text-xs font-black text-white tracking-widest flex items-center gap-2">
                    OPTIMAL <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </p>
               </div>
            </div>
          </div>
        </header>

        {/* Essential Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-in fade-in duration-1000 delay-300">
          {[
            { label: 'Total Tokens', val: stats?.totalTokensToday || 0, icon: <Zap size={20} />, sub: 'Issued Today', color: 'orange' },
            { label: 'Active Counters', val: stats?.activeCounters || 0, icon: <Monitor size={20} />, sub: 'Operational Units', color: 'emerald' },
            { label: 'Pending Queue', val: stats?.pendingToday || 0, icon: <Activity size={20} />, sub: 'Waiting Students', color: 'blue' },
            { label: 'Avg Wait Time', val: `${stats?.avgWaitTime || 0}m`, icon: <Clock size={20} />, sub: 'Estimated Delay', color: 'stone' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#171412] p-6 rounded-2xl border border-stone-800/60 relative overflow-hidden group hover:border-orange-600/40 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] cursor-default">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-0 group-hover:opacity-[0.03] transition-opacity blur-[40px] pointer-events-none`} />
              <div className="flex items-center justify-between mb-8">
                <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
                <div className="w-11 h-11 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-orange-600 shadow-inner group-hover:border-orange-600/30 transition-all">
                   {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-black mb-2 tracking-tighter text-white drop-shadow-lg">{stat.val}</h3>
              <p className="text-stone-700 text-[9px] font-black uppercase tracking-[0.15em]">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-20 animate-in slide-in-from-bottom-10 duration-1000 delay-500">
          {/* Service Distribution */}
          <div className="bg-[#171412] p-6 rounded-[2.5rem] border border-stone-800/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[120px] pointer-events-none group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                 <h3 className="text-lg font-black uppercase tracking-tighter text-white flex items-center gap-5">
                   <div className="w-11 h-11 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                    <Layers size={22} />
                   </div>
                   Departmental Load
                 </h3>
                 <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3 ml-16">Transaction density per service unit</p>
              </div>
              <ArrowUpRight className="text-stone-800 group-hover:text-orange-600 transition-colors" size={24} strokeWidth={3} />
            </div>
            
            <div className="space-y-12 px-2 relative z-10">
              {stats?.serviceStats?.map((s, i) => (
                <div key={i} className="group/item">
                  <div className="flex justify-between mb-5 items-end">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-stone-950 border border-stone-800 flex items-center justify-center font-black text-xs text-stone-600 group-hover/item:text-orange-600 group-hover/item:border-orange-600/40 transition-all uppercase shadow-inner">
                         {s.prefix || s.name.charAt(0)}
                      </div>
                      <div>
                         <span className="text-xl font-black uppercase tracking-tighter text-stone-400 group-hover/item:text-white transition-colors duration-500">{s.name}</span>
                         <p className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em] mt-1.5 opacity-60">Professional Service Unit</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-white tracking-tighter drop-shadow-md">{s.count}</span>
                       <p className="text-[9px] text-stone-700 font-black uppercase tracking-[0.3em] mt-1">Pending Tokens</p>
                    </div>
                  </div>
                  <div className="w-full bg-stone-950 h-5 rounded-full overflow-hidden border-2 border-stone-900 shadow-inner p-1 group/bar">
                    <div 
                      className="h-full rounded-full transition-all duration-[2s] group-hover/item:brightness-125 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.3)]" 
                      style={{ width: `${Math.min(100, (s.count / (stats.totalTokensToday || 1)) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
              {(!stats?.serviceStats || stats.serviceStats.length === 0) && (
                 <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                    <Database size={100} strokeWidth={1} />
                    <p className="text-sm font-black uppercase tracking-[0.6em] italic">Waiting for active service data...</p>
                 </div>
              )}
            </div>
          </div>

          {/* Activity Map */}
          <div className="bg-[#171412] p-6 rounded-[2.5rem] border border-stone-800/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col group">
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] pointer-events-none group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center justify-between mb-16 relative z-10">
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tighter text-white flex items-center gap-5">
                     <div className="w-11 h-11 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                      <TrendingUp size={22} />
                     </div>
                     Peak Hour Metrics
                   </h3>
                   <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3 ml-16">24-hour volume monitoring and peak analysis</p>
                </div>
                <div className="bg-stone-950/80 px-5 py-2.5 rounded-2xl border border-stone-800 shadow-inner flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Live Sweep</span>
                </div>
             </div>
             
             <div className="flex-1 flex items-end justify-between gap-3 px-6 h-64 relative pt-16 z-10">
                {peakHours.map((h, i) => (
                   <div key={i} className="relative group/bar flex-1 h-full flex flex-col justify-end gap-5">
                      <div 
                        className={`w-full group-hover/bar:bg-blue-500 transition-all duration-500 rounded-t-xl cursor-crosshair ${h > 0 ? 'bg-blue-600/40 shadow-[0_0_25px_rgba(37,99,235,0.25)]' : 'bg-stone-900/50 border-t border-x border-stone-800/30'}`} 
                        style={{ height: `${Math.max(8, Math.min(100, (h / (Math.max(...peakHours, 1))) * 100))}%` }} 
                      >
                         {h > 0 && (
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#171412] border border-stone-700 px-5 py-3 rounded-2xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 z-50 shadow-[0_30px_60px_rgba(0,0,0,0.8)] pointer-events-none scale-90 group-hover/bar:scale-100 backdrop-blur-md">
                              <p className="text-[11px] font-black text-white whitespace-nowrap tracking-[0.2em]">{h} TOKENS</p>
                           </div>
                         )}
                      </div>
                      <div className={`w-full h-1.5 rounded-full transition-colors ${i % 4 === 0 ? 'bg-stone-800' : 'bg-transparent'}`} />
                   </div>
                ))}
             </div>
             <div className="mt-8 flex justify-between px-6 relative z-10">
                {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'].map((t, i) => (
                   <span key={i} className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-800">{t}</span>
                ))}
             </div>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className="bg-[#171412] rounded-[2.5rem] border border-stone-800/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden mb-20 animate-in slide-in-from-bottom-20 duration-1000 delay-700">
          <header className="p-6 border-b border-stone-800/30 flex justify-between items-center bg-stone-900/20">
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-5">
                   <div className="w-11 h-11 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                    <History size={22} />
                   </div>
                   Service Audit Log
                 </h3>
                 <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.3em] mt-3 ml-16 opacity-80">Chronological list of recent system interactions</p>
              </div>
              <Link to="/admin/analytics" className="bg-stone-900/50 border border-stone-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-white hover:border-orange-600/40 transition-all flex items-center gap-4 group shadow-xl backdrop-blur-md">
                Full Analytics <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
          </header>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-stone-700 text-[11px] font-black uppercase tracking-[0.5em] border-b border-stone-800/20 bg-stone-950/30">
                  <th className="px-8 py-8">Action ID</th>
                  <th className="px-8 py-8">Module</th>
                  <th className="px-8 py-8">Description</th>
                  <th className="px-8 py-8">Reference</th>
                  <th className="px-8 py-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/10">
                {recentActivity.map((log, i) => (
                   <tr key={i} className="group hover:bg-stone-900/40 transition-all duration-500">
                     <td className="px-8 py-6 font-mono text-[11px] text-stone-700 group-hover:text-orange-600 transition-colors uppercase tracking-widest">#{log.id?.slice(-8) || `ACT-${2000 + i}`}</td>
                     <td className="px-8 py-6">
                       <div className="inline-flex items-center gap-5 px-6 py-2.5 bg-stone-950/50 border border-stone-800/60 rounded-2xl group-hover:border-stone-700 transition-all shadow-inner">
                         <div className="w-2 h-2 rounded-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]" />
                         <span className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-600 group-hover:text-stone-400 transition-colors">{log.module || 'SYSTEM'}</span>
                       </div>
                     </td>
                     <td className="px-8 py-6 text-[12px] font-black text-stone-400 uppercase tracking-tighter leading-relaxed italic group-hover:text-white transition-colors duration-500">{log.desc}</td>
                     <td className="px-8 py-6">
                        <p className="text-[11px] font-black text-stone-800 uppercase tracking-[0.4em] group-hover:text-stone-600 transition-colors">{log.sub || 'GENERAL'}</p>
                     </td>
                     <td className="px-8 py-6 text-right">
                       <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-full border-2 ${log.status === 'Completed' ? 'border-emerald-900/20 bg-emerald-900/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-orange-900/20 bg-orange-900/5 shadow-[0_0_20px_rgba(234,88,12,0.05)]'}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${log.status === 'Completed' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-600'}`} />
                          <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${log.status === 'Completed' ? 'text-emerald-500' : 'text-orange-500'}`}>{log.status === 'Completed' ? 'VERIFIED' : log.status || 'ACTIVE'}</span>
                       </div>
                     </td>
                   </tr>
                ))}
                {(!recentActivity || recentActivity.length === 0) && (
                   <tr>
                     <td colSpan={5} className="px-8 py-48 text-center opacity-10 italic">
                       <div className="flex flex-col items-center gap-8">
                          <ClipboardList size={110} strokeWidth={1} />
                          <p className="text-2xl font-black uppercase tracking-[0.8em] ml-12">No Log Signatures</p>
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
