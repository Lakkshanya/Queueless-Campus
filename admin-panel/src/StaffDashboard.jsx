import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import { 
  HelpCircle, 
  RefreshCw, 
  LogOut, 
  UserCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Users, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  Bell, 
  Pause, 
  Play,
  Monitor,
  CheckCircle,
  Clock3
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentToken, setCurrentToken] = useState(null);
  const [counter, setCounter] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStats, setSessionStats] = useState({ todayTotal: 0, avgTime: '0m' });

  const fetchStatus = async () => {
    try {
      const response = await api.get('/counters/my-counter');
      if (response.data.counter) {
        setCounter(response.data.counter);
        setCurrentToken(response.data.counter.currentToken);
        setQueue(response.data.waitingTokens || []);
        if (response.data.stats) {
          setSessionStats({
            todayTotal: response.data.stats.todayTotal || 0,
            avgTime: response.data.stats.avgPulse || '0m'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 15000); 
    const timer = setInterval(() => setSessionSeconds(prev => prev + 1), 1000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(timer);
    };
  }, [user]);

  const formatSessionTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNext = async () => {
    if (!counter || !user?.token) return;
    try {
      const response = await api.post('/counters/call-next', { counterId: counter._id });
      if (response.data.token) {
        setCurrentToken(response.data.token);
        fetchStatus();
      } else {
        setCurrentToken(null);
        fetchStatus();
      }
    } catch (error) {
      console.error('Call next error:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!counter || !user?.token) return;
    try {
      const newStatus = counter.status === 'active' ? 'paused' : 'active';
      await api.post('/counters/toggle-status', { counterId: counter._id, status: newStatus });
      fetchStatus();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,88,12,0.2)]" />
      <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Restoring Session...</p>
    </div>
  );

  if (!counter) return (
    <div className="min-h-screen bg-[#0C0A09] text-white p-6 flex flex-col items-center justify-center font-sans text-center">
      <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center mb-10 shadow-inner">
        <Monitor size={32} className="text-stone-700" />
      </div>
      <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">No Counter Assigned</h2>
      <p className="text-stone-500 mb-8 max-w-md text-sm font-bold uppercase tracking-widest opacity-80 leading-relaxed">
        Your account is registered as staff, but no counter unit has been allocated to you by the administrator.
      </p>
      <button 
        onClick={handleLogout} 
        className="bg-stone-900 border border-stone-800 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-red-500 hover:bg-stone-800 transition-all shadow-2xl active:scale-95"
      >
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white font-display flex flex-col selection:bg-orange-600/30" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Header Navigation */}
      <nav className="bg-[#0C0A09]/80 backdrop-blur-xl border-b border-stone-800/60 px-6 py-5 flex flex-col md:flex-row justify-between items-center z-50 sticky top-0">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.3)] transform -rotate-6 group">
              <span className="text-white text-lg font-black group-hover:rotate-6 transition-transform">QC</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tighter leading-none flex items-center gap-1 font-display">
                STAFF<span className="text-orange-600">PORTAL</span>
              </h1>
              <p className="text-stone-600 text-[8px] font-black tracking-[0.3em] uppercase mt-1">Operational Environment</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 border-l border-stone-800/60 pl-6">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center font-black text-[10px] text-orange-600 shadow-inner">
              {counter.number.toString().padStart(2, '0')}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-700">Counter ID</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={fetchStatus}
            className="p-3 px-6 bg-stone-900/50 border border-stone-800 rounded-full text-stone-500 hover:text-orange-500 hover:border-orange-600/30 transition-all flex items-center gap-3 backdrop-blur-sm group"
          >
            <RefreshCw size={14} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Refresh Data</span>
          </button>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-stone-900 border border-stone-800 rounded-full shadow-inner">
            <div className={`w-2.5 h-2.5 rounded-full ${counter.status === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{counter.status === 'active' ? 'Operational' : 'On Break'}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-12 h-12 bg-red-950/10 border border-red-900/20 text-red-500 hover:bg-red-900/30 rounded-2xl transition-all shadow-xl flex items-center justify-center p-0"
            title="Sign Out"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8 max-w-[1800px] mx-auto w-full">
        {/* Main Console */}
        <div className="flex-1 flex flex-col gap-8">
           {/* Current Token Section */}
           <div className="bg-[#171412] rounded-[32px] p-10 border border-stone-800/60 flex flex-col items-center justify-center text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-1000 blur-[100px] pointer-events-none" />
             
             <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-10 bg-orange-600/5 px-6 py-2.5 rounded-full border border-orange-600/10">
               <Activity size={14} fill="currentColor" />
               Current Assignment
             </div>
  
             <div className="relative mb-12 animate-in zoom-in-50 duration-1000">
               <h2 className="text-8xl md:text-[10rem] font-black text-white leading-none tracking-tighter drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] filter transition-all group-hover:scale-105 duration-700">
                 {currentToken ? currentToken.number : '---'}
               </h2>
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#0C0A09] border border-stone-800 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Token ID</p>
               </div>
             </div>

             {currentToken ? (
               <div className="mb-10 animate-in slide-in-from-bottom-8 duration-700 w-full max-w-md">
                 <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter drop-shadow-xl">{currentToken.student?.name || 'Inbound User'}</h3>
                 <div className="inline-flex items-center gap-5 px-6 py-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-inner">
                   <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
                   <p className="text-orange-500 uppercase font-black text-[12px] tracking-[0.3em]">{currentToken.service?.name}</p>
                 </div>
               </div>
             ) : (
               <div className="mb-10 opacity-20 text-stone-700 flex flex-col items-center gap-8">
                  <UserCheck size={100} strokeWidth={1} />
                  <p className="font-black text-xl uppercase tracking-[0.6em]">Awaiting User</p>
               </div>
             )}

             <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl relative z-10 pt-12 border-t border-stone-800/40">
               <button 
                 onClick={handleNext}
                 disabled={!currentToken}
                 className="flex-1 bg-[#171412] border-2 border-stone-100/5 text-stone-600 py-5 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase hover:bg-stone-900 hover:border-emerald-600/30 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
               >
                 <CheckCircle size={22} className="group-hover/btn:text-emerald-500 transition-colors" strokeWidth={2.5} />
                 Resolve
               </button>
               <button 
                 onClick={handleNext}
                 className="flex-1 bg-orange-600 text-white py-5 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase hover:bg-orange-500 shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-4 active:scale-95 group/nxt"
               >
                 Call Next
                 <ArrowUpRight size={22} className="group-hover/nxt:translate-x-1 group-hover/nxt:-translate-y-1 transition-transform" strokeWidth={3} />
               </button>
             </div>
           </div>

           {/* Metrics Panel */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Session Time', val: formatSessionTime(sessionSeconds), icon: <Clock3 className="text-blue-500" size={18} /> },
                { label: 'Total Served', val: sessionStats.todayTotal, icon: <Users className="text-orange-600" size={18} /> },
                { label: 'Avg Time', val: sessionStats.avgTime, icon: <Activity className="text-purple-500" size={18} /> },
                { label: 'Status', val: 'SECURE', icon: <ShieldCheck className="text-emerald-500" size={18} /> },
              ].map((m, i) => (
                <div key={i} className="bg-[#171412] p-6 rounded-2xl border border-stone-800/60 shadow-xl group hover:border-stone-700 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-700 group-hover:text-stone-500 transition-colors">{m.label}</span>
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-inner group-hover:border-stone-800 transition-all">
                      {m.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white tracking-tighter drop-shadow-md">{m.val}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar - Upcoming Queue */}
        <div className="w-full lg:w-[450px] flex flex-col gap-8">
           <div className="bg-[#171412] rounded-[32px] p-6 border border-stone-800/60 flex flex-col flex-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-80 bg-orange-600/5 blur-[100px] pointer-events-none group-hover:opacity-100 transition-opacity" />
             
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-4 text-white">
                     <div className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                      <Users size={20} />
                     </div>
                     Pending Queue
                   </h3>
                   <p className="text-stone-600 text-[9px] font-black uppercase tracking-[0.2em] mt-3 ml-14">Upcoming Users</p>
                </div>
                <div className="w-14 h-14 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-center font-black text-lg text-orange-600 shadow-inner group-hover:border-orange-600/30 transition-all">
                   {queue.length}
                </div>
             </div>

             <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[650px] relative z-10">
               {queue.map((token, index) => (
                 <div key={token._id} className="group/token relative flex items-center gap-6 p-6 bg-[#0C0A09]/40 rounded-2xl border border-stone-800/60 hover:border-orange-600/30 hover:bg-[#1C1917]/60 transition-all cursor-pointer animate-in fade-in slide-in-from-right-10 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                   <div className="text-[10px] font-black text-stone-800 absolute top-6 right-10 group-hover/token:text-orange-600/40 transition-colors uppercase tracking-[0.4em]">POSITION #{index + 1}</div>
                   <div className="w-16 h-16 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-center group-hover/token:border-orange-600/40 transition-all shadow-inner">
                     <span className="font-black text-xl text-stone-500 group-hover/token:text-white transition-colors tracking-tighter">{token.number}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <span className="block text-[14px] font-black text-stone-500 group-hover/token:text-white uppercase tracking-tighter truncate transition-colors duration-500">{token.student?.name || 'Unknown student'}</span>
                     <span className="block text-[10px] text-orange-600/60 font-bold uppercase tracking-[0.2em] mt-2 group-hover/token:text-orange-500 transition-colors">{token.service?.name}</span>
                   </div>
                   <ChevronRight size={22} className="text-stone-800 group-hover/token:text-orange-600 group-hover/token:translate-x-2 transition-all" strokeWidth={3} />
                 </div>
               ))}
               {queue.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center py-40 opacity-10">
                   <Bell size={100} className="mb-10 text-stone-800" strokeWidth={1} />
                   <p className="text-lg font-black uppercase tracking-[0.6em]">Queue Empty</p>
                   <p className="text-[12px] mt-6 font-bold tracking-[0.3em] italic">No users currently in line.</p>
                 </div>
               )}
             </div>

             <button 
              onClick={handleToggleStatus}
              className={`w-full mt-8 py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-5 group/btn-p active:scale-95 shadow-2xl ${
                counter.status === 'active' 
                ? 'bg-[#171412] text-orange-400 border-2 border-stone-800 hover:bg-stone-900 hover:border-stone-700' 
                : 'bg-orange-600 text-white border-2 border-transparent hover:bg-orange-500 shadow-[0_25px_50px_-12px_rgba(234,88,12,0.4)]'
              }`}
            >
              {counter.status === 'active' ? (
                <>
                  <Pause size={20} fill="currentColor" />
                  Request Break
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" />
                  Resume Service
                </>
              )}
            </button>
           </div>

           {/* Security Flag */}
           <div className="bg-orange-600/[0.03] border border-orange-600/10 p-7 rounded-[28px] flex items-start gap-6 relative group overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600 opacity-40 shadow-[0_0_20px_rgba(234,88,12,0.4)]" />
              <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-600/20 group-hover:scale-110 transition-transform duration-700">
                <ShieldCheck size={32} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-orange-600 text-[11px] font-black uppercase tracking-[0.4em] mb-3">System Integrity</p>
                <p className="text-stone-500 text-[12px] font-black uppercase leading-relaxed tracking-[0.1em] opacity-80">
                  Authentication token verified. Academic database monitoring active for all transactions.
                </p>
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 1px solid #1C1917; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #1C1917; border-color: #292524; }
      `}} />
    </div>
  );
};

export default StaffDashboard;
