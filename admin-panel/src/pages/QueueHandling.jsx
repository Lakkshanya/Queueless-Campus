import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Play, CheckCircle, Clock, Timer as TimerIcon, Users, Activity, Loader } from "lucide-react";

const QueueHandling = () => {
  const { user } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServing, setIsServing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalServed, setTotalServed] = useState(0);
  
  const isAssigned = !!user?.assignedCounter;

  const fetchData = async () => {
    if (!isAssigned) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/counters/my-counter');
      setWaitingQueue(response.data.waitingTokens || []);
      const current = response.data.counter?.currentToken;
      setActiveToken(current || null);
      setIsServing(!!current);
      setTotalServed(response.data.stats?.todayTotal || 0);
      
      if (current) {
        const start = new Date(current.startTime || new Date()).getTime();
        const now = new Date().getTime();
        setTimer(Math.floor((now - start) / 1000));
      } else {
        setTimer(0);
      }
    } catch (e) {
      console.error('Failed to sync operator queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const inv = setInterval(fetchData, 10000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    let interval;
    if (isServing) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isServing]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartNext = async () => {
    if (waitingQueue.length === 0) return;
    try {
      setLoading(true);
      const nextTokenId = waitingQueue[0]._id;
      const response = await api.put('/tokens/start', { tokenId: nextTokenId });
      setActiveToken(response.data.token);
      setIsServing(true);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!activeToken) return;
    try {
      setLoading(true);
      await api.put('/tokens/complete', { tokenId: activeToken._id });
      setActiveToken(null);
      setIsServing(false);
      setTimer(0);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAssigned) {
    return (
      <div className="flex-1 min-h-[60vh] bg-[#0C0A09] flex flex-col items-center justify-center p-12">
        <Activity color="#292524" size={64} strokeWidth={1.5} />
        <h2 className="text-stone-700 text-2xl font-bold tracking-tight mt-10 text-center">
          Workstation Offline
        </h2>
        <p className="text-stone-800 text-xs mt-6 max-w-sm text-center leading-relaxed font-bold tracking-tight">
          Your account is active, but you have not been linked to a physical service console. Please return to your portal or contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full animate-in font-sans pb-40">
      {/* Active Token Card */}
      <div className="flex-1 lg:max-w-xl">
        <div className="bg-[#171412] rounded-[3rem] p-12 border border-stone-800/60 shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.04] blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="bg-white/5 px-6 py-2.5 rounded-full border border-white/10 mb-8">
               <span className="text-stone-400 text-[10px] font-bold tracking-tight uppercase">
                 {isServing ? 'Currently Serving' : waitingQueue.length > 0 ? 'Awaiting Service' : 'Grid Idle'}
               </span>
            </div>
            
            <h1 className="text-white text-8xl font-bold tracking-tight leading-none mb-3">
              {activeToken ? activeToken.number : waitingQueue[0]?.number || '---'}
            </h1>
            
            {(activeToken || waitingQueue[0]) && (
              <h2 className="text-stone-400 text-2xl font-bold tracking-tight leading-none mb-8">
                {activeToken?.user?.name || activeToken?.student?.name || waitingQueue[0]?.user?.name || waitingQueue[0]?.student?.name || 'Authorized Student'}
              </h2>
            )}
            
            {(activeToken?.service?.name || waitingQueue[0]?.service?.name) && (
               <div className="mb-6 px-4 py-2 bg-stone-900/60 rounded-full border border-stone-800">
                  <span className="text-stone-400 font-bold uppercase tracking-tight text-[10px]">
                    {activeToken?.service?.name || waitingQueue[0]?.service?.name}
                  </span>
               </div>
            )}
            
            {isServing ? (
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex items-center gap-4 bg-[#0C0A09] px-8 py-5 rounded-3xl border border-orange-600/20 shadow-inner">
                  <TimerIcon color={timer > 600 ? '#EF4444' : '#EA580C'} size={24} strokeWidth={3} />
                  <span className={`font-bold tracking-tight text-5xl tabular-nums ${timer > 600 ? 'text-red-500' : 'text-orange-600'}`}>
                    {formatTime(timer)}
                  </span>
                </div>
                <span className="text-stone-700 text-[10px] font-bold tracking-tight mt-6 uppercase opacity-60">
                  Session Duration
                </span>
              </div>
            ) : waitingQueue.length > 0 && (
              <div className="flex flex-col items-center justify-center w-full">
                 <div className="flex items-center gap-4 bg-stone-950 px-8 py-5 rounded-3xl border border-stone-800 opacity-40">
                    <TimerIcon color="#292524" size={24} strokeWidth={3} />
                    <span className="font-bold tracking-tight text-5xl tabular-nums text-stone-700">00:00</span>
                 </div>
                 <span className="text-stone-800 text-[10px] font-bold tracking-tight mt-6 uppercase opacity-40">Timer Ready</span>
              </div>
            )}
            
            {(activeToken?.service?.venue || waitingQueue[0]?.service?.venue) && (
               <div className="mt-8 flex items-center bg-stone-900/50 px-5 py-2.5 rounded-full border border-stone-800">
                  <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                    {activeToken?.service?.venue || waitingQueue[0]?.service?.venue}
                  </span>
               </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full mt-6">
              <button
                id="start-session-btn"
                onClick={handleStartNext}
                disabled={isServing || waitingQueue.length === 0 || loading}
                className={`flex-1 py-6 rounded-[2rem] font-bold tracking-tight text-sm uppercase flex items-center justify-center gap-4 transition-all ${
                  !isServing && waitingQueue.length > 0
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20 hover:bg-orange-500 active:scale-95'
                    : 'bg-[#0C0A09] border border-stone-800 text-stone-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {loading && !isServing ? <Loader className="animate-spin" size={20} /> : <Play size={20} />}
                Start Session
              </button>

              <button
                id="end-session-btn"
                onClick={handleComplete}
                disabled={!isServing || loading}
                className={`flex-1 py-6 rounded-[2rem] font-bold tracking-tight text-sm uppercase flex items-center justify-center gap-4 transition-all ${
                  isServing
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/30 active:scale-95'
                    : 'bg-[#0C0A09] border border-stone-800 text-stone-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {loading && isServing ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                End Session
              </button>
          </div>
        </div>
      </div>

      {/* Queue Preview Panel */}
      <div className="flex-1">
         <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-[#171412] rounded-2xl flex items-center justify-center border border-stone-800">
                  <Users color="#EA580C" size={24} strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-textPrimary text-3xl font-bold tracking-tight text-white mb-1">Queue Preview</h3>
                  <p className="text-stone-500 text-[11px] font-bold tracking-widest uppercase">Total Served: {totalServed}</p>
               </div>
            </div>
            <div className="bg-[#171412] px-5 py-2 rounded-full border border-stone-800">
               <span className="text-stone-400 text-xs font-bold tracking-tight">{waitingQueue.length} In Line</span>
            </div>
         </div>
         
         <div className="space-y-4 pr-2 max-h-[800px] overflow-y-auto custom-scrollbar">
            {waitingQueue.length > 0 ? (
               waitingQueue.map((item, idx) => (
                  <div key={item._id} className={`bg-[#171412] rounded-3xl p-6 border flex items-center gap-6 ${idx === 0 ? 'border-orange-600/40' : 'border-stone-800/40'}`}>
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${idx === 0 ? 'bg-orange-600/10 border-orange-600/20' : 'bg-[#0C0A09] border-stone-800'}`}>
                        <span className={`text-xl font-bold tracking-tight ${idx === 0 ? 'text-orange-600' : 'text-stone-500'}`}>
                           #{idx + 1}
                        </span>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-white text-xl font-bold tracking-tight leading-none truncate">
                             {item.user?.name || item.student?.name || 'Authorized Student'}
                           </h4>
                           {idx === 0 && (
                              <div className="bg-orange-600/10 px-3 py-1 rounded-full border border-orange-600/20 whitespace-nowrap">
                                 <span className="text-orange-600 text-[9px] font-bold tracking-tight uppercase">Next Up</span>
                              </div>
                           )}
                        </div>
                        <p className="text-stone-500 text-[10px] font-bold tracking-widest uppercase">
                          {item.number} • Targeting {item.service?.name}
                        </p>
                     </div>
                  </div>
               ))
            ) : (
               <div className="bg-[#171412] rounded-[2.5rem] p-12 border border-stone-800 flex flex-col items-center justify-center text-center opacity-40">
                  <Activity size={48} className="text-stone-700 mb-6" />
                  <p className="text-stone-500 text-sm font-bold tracking-tight uppercase">Queue is completely empty.</p>
               </div>
            )}
         </div>
      </div>
      
      <style
        dangerouslySetInnerHTML={{
          __html: ` .custom-scrollbar::-webkit-scrollbar { width: 5px;} .custom-scrollbar::-webkit-scrollbar-track { background: transparent;} .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09;} .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C;}`,
        }}
      />
    </div>
  );
};

export default QueueHandling;
