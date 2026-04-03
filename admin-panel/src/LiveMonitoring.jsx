import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  Radio, 
  Power, 
  Users, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Monitor,
  AlertCircle
} from 'lucide-react';

const LiveMonitoring = () => {
  const { user } = useAuth();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      const response = await api.get('/counters');
      setCounters(response.data);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 10000); // 10s refresh for "live" feel
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#1F1D1B] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Synchronizing Global Stream...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                <Monitor size={14} strokeWidth={3} />
                Strategic Operations Center
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white">Live Monitoring</h1>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-[#1C1917] px-8 py-5 rounded-[2rem] border border-stone-800 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute top-0 -right-0 transition-opacity" />
                <div className="w-10 h-10 rounded-2xl bg-red-950/20 flex items-center justify-center text-red-500">
                   <Radio size={20} />
                </div>
                <div>
                   <p className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-600">Secure Stream</p>
                   <p className="text-xs font-black text-white">Active Feed: High Bandwidth</p>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {counters.map((counter) => (
            <div key={counter._id} className="group bg-[#1C1917] rounded-[3.5rem] p-10 border border-stone-800/50 hover:border-[#9A3412]/30 transition-all shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-20 h-20 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center text-[#FAFAF9] group-hover:text-[#9A3412] transition-colors shadow-inner">
                   <span className="text-3xl font-black tracking-tighter">{counter.counterNumber.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    counter.status === 'active' ? 'bg-green-950/20 text-green-500 border-green-900/30' : 'bg-red-950/20 text-red-500 border-red-900/30'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${counter.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {counter.status === 'active' ? 'Operational' : 'Idle'}
                  </div>
                  <p className="text-[10px] text-stone-600 mt-4 uppercase font-black tracking-[0.2em] pr-2">{counter.service?.name || 'General Operations'}</p>
                </div>
              </div>

              <div className="space-y-8 mb-12 relative z-10 flex-1">
                <div className="bg-[#1F1D1B] p-8 rounded-[2.5rem] border border-stone-800/50 group-hover:border-[#9A3412]/20 transition-all">
                  <p className="text-[9px] uppercase text-stone-600 tracking-[0.3em] mb-4 font-black">Counter Load Activity</p>
                  {counter.currentToken ? (
                    <div className="flex justify-between items-center">
                      <h2 className="text-4xl font-black text-[#9A3412] tracking-tighter">{counter.currentToken.number}</h2>
                      <div className="w-12 h-12 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/20 flex items-center justify-center text-[#9A3412]">
                         <Zap size={24} className="animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-stone-800">
                       <Clock size={28} strokeWidth={1} />
                       <p className="text-2xl font-black uppercase tracking-tighter opacity-30">Terminal Idle</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-stone-900 rounded-2xl border border-stone-800/50 flex items-center justify-center text-stone-600 group-hover:text-[#FAFAF9] transition-colors">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="text-[9px] uppercase text-stone-700 tracking-widest mb-1 font-black">Staff In-Charge</p>
                        <p className="text-sm font-black text-[#FAFAF9] uppercase tracking-widest group-hover:text-[#9A3412] transition-colors">{counter.staff?.name || 'Unassigned'}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] uppercase text-stone-700 tracking-widest mb-1 font-black">Queue Backlog</p>
                     <p className="text-2xl font-black text-[#FAFAF9] tracking-tighter">{counter.workload || 0}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-800/50 flex items-center justify-between text-[9px] font-black text-stone-600 uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={12} className="text-[#9A3412]" />
                     Load Index: {Math.min(100, (counter.workload || 0) * 12.5).toFixed(1)}%
                  </div>
                  <span className="text-[#9A3412]">Nominal Status</span>
              </div>
            </div>
          ))}
        </div>

        {counters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-48 opacity-20 group">
             <div className="w-24 h-24 bg-stone-900 border-4 border-stone-800 rounded-full border-t-[#9A3412] animate-spin mb-10 shadow-2xl" />
             <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-6 text-stone-800" />
                <h2 className="text-3xl font-black uppercase tracking-[0.4em] text-stone-800">Searching Network</h2>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-900">Scanning for active terminal nodes in the campus network...</p>
             </div>
          </div>
        )}

        {/* Global Overview Section */}
        <div className="mt-20 bg-[#1C1917] p-12 rounded-[4rem] border border-stone-800/50 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#9A3412] opacity-[0.01] blur-[150px] pointer-events-none" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full">
              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Total Terminals</p>
                 <p className="text-4xl font-black text-[#FAFAF9]">{counters.length}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Active Operators</p>
                 <p className="text-4xl font-black text-[#9A3412]">{counters.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Total Enqueued</p>
                 <p className="text-4xl font-black text-[#FAFAF9]">{counters.reduce((acc, c) => acc + (c.workload || 0), 0)}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">System Pulse</p>
                 <div className="flex items-center gap-3">
                    <Activity size={24} className="text-green-500 animate-pulse" />
                    <p className="text-lg font-black text-green-500 uppercase">Optimal</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
