import React, { useState, useEffect } from 'react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Power, 
  Play, 
  Pause, 
  ChevronRight, 
  CheckCircle2, 
  UserCheck, 
  Users,
  LogOut,
  Bell,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentToken, setCurrentToken] = useState(null);
  const [counter, setCounter] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStats, setSessionStats] = useState({ todayTotal: 0, avgPulse: '0m' });

  const fetchStatus = async () => {
    try {
      const response = await api.get('/counters/my-counter');
      setCounter(response.data.counter);
      setCurrentToken(response.data.counter.currentToken);
      setQueue(response.data.waitingTokens);
      if (response.data.stats) {
        setSessionStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15s refresh for staff responsiveness
    const timer = setInterval(() => setSessionSeconds(prev => prev + 1), 1000);
    return () => {
      clearInterval(interval);
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
        alert('Verification Queue Empty. No more subjects waiting.');
        setCurrentToken(null);
      }
    } catch (error) {
      alert('Failed to transmit call command. Please check network connectivity.');
    }
  };

  const handleToggleStatus = async () => {
    if (!counter || !user?.token) return;
    try {
      const newStatus = counter.status === 'active' ? 'paused' : 'active';
      await api.post('/counters/toggle-status', { counterId: counter._id, status: newStatus });
      fetchStatus();
    } catch (error) {
      alert('Failed to transition operational state.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest text-[#D6D3D1]">
      <div className="w-12 h-12 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Loading Dashboard...</p>
    </div>
  );

  if (!counter) return (
    <div className="min-h-screen bg-[#1C1917] text-[#FAFAF9] p-12 flex flex-col items-center justify-center font-sans text-center">
      <div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
        <HelpCircle size={48} className="text-stone-700" />
      </div>
      <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Terminal Offline</h2>
      <p className="text-[#D6D3D1] mb-12 max-w-md text-sm font-medium opacity-60 leading-relaxed">
        This workstation is not currently assigned in the system. Please coordinate with the Administration to authorize this terminal.
      </p>
      <button 
        onClick={handleLogout} 
        className="bg-stone-900 border border-stone-800 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-stone-800 transition-all"
      >
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1F1D1B] text-[#FAFAF9] font-sans flex flex-col">
      {/* Premium Navigation Header */}
      <nav className="bg-[#1C1917] border-b border-stone-800/50 px-12 py-6 flex flex-col md:flex-row justify-between items-center z-50">
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#9A3412] rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/20 rotate-3">
              <span className="text-white text-2xl font-black">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter lowercase leading-none">queue<span className="text-[#9A3412] uppercase font-bold text-lg">Less</span></h1>
              <p className="text-stone-600 text-[8px] font-bold tracking-[0.3em] uppercase">Staff Terminal</p>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-stone-800 hidden md:block" />
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center font-black text-[10px] text-[#9A3412]">
              {counter.number.toString().padStart(2, '0')}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Live Workstation Index</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStatus}
            className="p-2 px-4 bg-stone-900 border border-stone-800 rounded-full text-stone-500 hover:text-[#9A3412] transition-all flex items-center gap-2"
            title="Refresh Terminal"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest">Re-Sync</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-stone-900 border border-stone-800 rounded-full">
            <div className={`w-2 h-2 rounded-full ${counter.status === 'active' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D6D3D1]">{counter.status}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/10 border border-red-900/20 text-red-500 hover:bg-red-900/20 rounded-full transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 p-12 flex flex-col lg:flex-row gap-12">
        {/* Main Serving Bay */}
        <div className="flex-1 flex flex-col gap-8">
           {/* Current Subject Identity Card */}
           <div className="bg-[#1C1917] rounded-[3rem] p-12 border border-stone-800/50 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-[100px]" />
             
             <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">
               <Zap size={14} />
               Now Dispatching
             </div>

             <div className="relative mb-10">
               <h2 className="text-[140px] md:text-[180px] font-black text-[#FAFAF9] leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 {currentToken ? currentToken.number : '---'}
               </h2>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-stone-900 border border-stone-800 rounded-full shadow-xl">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FAFAF9]">Sequence ID</p>
               </div>
             </div>

             {currentToken ? (
               <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h3 className="text-4xl font-black text-[#FAFAF9] mb-3 uppercase tracking-tighter">{currentToken.student?.name || 'Verified Student'}</h3>
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9A3412]/10 border border-[#9A3412]/20 rounded-xl">
                   <p className="text-[#9A3412] uppercase font-black text-[10px] tracking-widest">{currentToken.service?.name}</p>
                 </div>
               </div>
             ) : (
               <div className="mb-12 opacity-30 text-stone-600 flex flex-col items-center gap-4">
                  <UserCheck size={48} strokeWidth={1} />
                  <p className="font-bold text-sm uppercase tracking-widest">Awaiting Student</p>
               </div>
             )}

             <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl relative inset-x-0 z-10 pt-8 border-t border-stone-800/50">
               <button 
                 onClick={handleNext}
                 className="flex-1 bg-[#292524] border border-stone-800 text-[#FAFAF9] py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase hover:bg-stone-900 hover:border-[#9A3412]/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 <CheckCircle2 size={18} className="text-stone-500" />
                 Resolve & Close
               </button>
               <button 
                 onClick={handleNext}
                 className="flex-1 bg-[#9A3412] text-white py-6 rounded-3xl font-black text-xs tracking-[0.3em] uppercase hover:bg-[#C2410C] shadow-2xl shadow-orange-950/60 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
               >
                 <ArrowUpRight size={18} className="animate-pulse" />
                 Engage Next
               </button>
             </div>
           </div>

           {/* Next Subject Preview Card */}
           <div className="bg-[#1C1917]/50 rounded-[2rem] p-6 border border-stone-800/30 flex items-center justify-between group-hover:border-[#9A3412]/20 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 transition-colors group-hover:text-[#9A3412]">
                   <ChevronRight size={20} />
                 </div>
                 <div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-stone-600 mb-0.5">Next in Sequence</p>
                   <p className="text-xl font-black text-[#FAFAF9] tracking-tighter">
                     {queue.length > 0 ? queue[0].number : '---'}
                   </p>
                 </div>
              </div>
              {queue.length > 0 && (
                <div className="text-right">
                   <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">{queue[0].student?.name || 'Waiting...'}</p>
                   <p className="text-[8px] text-[#9A3412] font-bold uppercase tracking-widest opacity-60">{queue[0].service?.name}</p>
                </div>
              )}
           </div>

           {/* Workspace Metrics */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Session Time', val: formatSessionTime(sessionSeconds), icon: <Clock className="text-blue-500" /> },
                { label: 'Today Total', val: sessionStats.todayTotal, icon: <Users className="text-[#9A3412]" /> },
                { label: 'Avg Pulse', val: sessionStats.avgPulse, icon: <Activity className="text-purple-500" /> },
                { label: 'Compliance', val: '100%', icon: <ShieldCheck className="text-green-500" /> },
              ].map((m, i) => (
                <div key={i} className="bg-[#1C1917] p-6 rounded-3xl border border-stone-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-600">{m.label}</span>
                    {m.icon}
                  </div>
                  <p className="text-xl font-black text-[#FAFAF9] tracking-tighter">{m.val}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Intelligence Queue */}
        <div className="w-full lg:w-[450px] flex flex-col gap-8">
           <div className="bg-[#1C1917] rounded-[3rem] p-10 border border-stone-800/50 flex flex-col flex-1 shadow-xl">
             <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Users className="text-[#9A3412]" size={20} />
                    Queue Buffer
                  </h3>
                  <p className="text-stone-600 text-[9px] font-bold uppercase tracking-widest mt-1">Pending Students</p>
               </div>
               <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center font-black text-xs text-[#9A3412] shadow-inner">
                 {queue.length}
               </div>
             </div>

             <div className="space-y-4 flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[500px]">
               {queue.map((token, index) => (
                 <div key={token._id} className="group relative flex items-center gap-4 p-5 bg-[#1F1D1B] rounded-[2rem] border border-stone-800/50 hover:border-[#9A3412]/30 transition-all cursor-pointer">
                   <div className="text-[8px] font-black text-stone-700 absolute top-4 left-6 group-hover:text-[#9A3412]/50 transition-colors uppercase tracking-[0.2em]">Rank #{index + 1}</div>
                   <div className="w-14 h-14 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center group-hover:border-[#9A3412]/30 transition-all">
                     <span className="font-black text-2xl text-[#FAFAF9] group-hover:text-[#9A3412] transition-colors tracking-tighter">{token.number}</span>
                   </div>
                   <div className="flex-1 min-w-0 pt-2">
                     <span className="block text-xs font-black text-[#FAFAF9] uppercase tracking-tighter truncate">{token.student?.name || 'Inbound Student'}</span>
                     <span className="block text-[10px] text-[#9A3412] font-bold uppercase tracking-widest mt-0.5 opacity-80">{token.service?.name}</span>
                   </div>
                   <ChevronRight size={18} className="text-stone-800 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
                 </div>
               ))}
               {queue.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center py-24 opacity-20">
                   <Bell size={48} className="mb-4 text-stone-800" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Queue Empty</p>
                   <p className="text-[8px] mt-2">Waiting for new student requests...</p>
                 </div>
               )}
             </div>

             <button 
              onClick={handleToggleStatus}
              className={`w-full mt-10 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
                counter.status === 'active' 
                ? 'bg-stone-900 text-[#FDBA74] border border-stone-800 hover:bg-stone-800' 
                : 'bg-[#9A3412] text-white border border-transparent shadow-2xl shadow-orange-950/40 hover:bg-[#C2410C]'
              }`}
            >
              {counter.status === 'active' ? (
                <>
                  <Pause size={16} fill="currentColor" />
                  Suspend Ops
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  Initiate Stream
                </>
              )}
            </button>
           </div>

           {/* Station Info Overlay */}
           <div className="bg-[#9A3412]/5 border border-[#9A3412]/10 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={14} className="text-[#9A3412]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#9A3412]">Terminal Protocol</span>
              </div>
              <p className="text-[#D6D3D1] text-[9px] leading-relaxed opacity-60">
                This workstation is tethered to the main academic registry. All transactions are digitally signed and verifiable under the campus security framework.
              </p>
           </div>
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

export default StaffDashboard;
