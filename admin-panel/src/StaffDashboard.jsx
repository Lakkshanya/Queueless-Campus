import React, { useState, useEffect } from "react";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";
import { Link } from "react-router-dom";
import { Monitor, Activity, Users, Zap, CheckCircle2, ChevronRight } from "lucide-react";

const AssignedServiceCard = ({
  serviceName,
  counterNumber,
  staffName,
  liveTokens,
  maxTokens,
  isAssigned,
  isOnline,
  venue
}) => {
  if (!isAssigned) {
    return (
      <div className="bg-[#171412] rounded-[3rem] p-10 border-2 border-dashed border-stone-800 flex flex-col items-center justify-center py-24 mb-10 overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.02] blur-3xl rounded-full" />
        <div className="w-24 h-24 bg-stone-900/50 rounded-3xl flex items-center justify-center mb-8 border border-stone-800">
          <Monitor color="#292524" size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-stone-700 text-3xl font-bold tracking-tight mb-4 text-center leading-none uppercase">
          Standby Mode
        </h2>
        <div className="bg-orange-600/5 px-6 py-2 rounded-full border border-orange-600/10 mb-8">
          <span className="text-orange-600 text-xs font-bold tracking-tight uppercase">
            Awaiting Administrative Link
          </span>
        </div>
        <p className="text-stone-800 text-sm font-bold tracking-tight text-center max-w-sm leading-relaxed opacity-60">
          Dashboard linkage is inactive. Return to settings or wait for administrative station allocation to initialize processing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#171412] rounded-[3rem] p-12 border border-stone-800/60 relative overflow-hidden mb-12 shadow-2xl">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.04] blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Activity color="#EA580C" size={16} strokeWidth={3} />
            <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
              Active Station
            </span>
          </div>
          <h2 className="text-white text-5xl font-bold tracking-tight leading-none mb-4">
            {serviceName}
          </h2>
          <p className="text-stone-500 text-xs font-semibold tracking-tight italic opacity-80">
            Assigned to {staffName}
          </p>
          {venue && (
            <div className="mt-6 flex items-center bg-orange-600/10 w-fit px-5 py-2.5 border border-orange-600/20 rounded-full">
              <span className="text-orange-600 text-[11px] font-bold tracking-tight uppercase">{venue}</span>
            </div>
          )}
        </div>
        
        <div className={`px-8 py-3 rounded-2xl border-2 flex items-center shadow-inner ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
           <div className={`w-3 h-3 rounded-full mr-4 animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
           <span className={`font-bold tracking-tight text-xs uppercase ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
              {isOnline ? 'System Live' : 'On Break'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="bg-[#0C0A09] rounded-[2.5rem] p-10 border border-stone-800/80 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute -top-6 -right-6 bg-orange-600/5 w-24 h-24 rounded-full blur-xl" />
          <Monitor color="#EA580C" size={28} strokeWidth={2.5} className="mb-6" />
          <p className="text-stone-600 text-[11px] font-bold tracking-widest mb-4 uppercase opacity-70">
            Workstation ID
          </p>
          <p className="text-white text-5xl font-bold tracking-tight tabular-nums relative z-10">
            {counterNumber.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-[#0C0A09] rounded-[2.5rem] p-10 border border-stone-800/80 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute -top-6 -right-6 bg-orange-600/5 w-24 h-24 rounded-full blur-xl" />
          <Users color="#EA580C" size={28} strokeWidth={2.5} className="mb-6" />
          <p className="text-stone-600 text-[11px] font-bold tracking-widest mb-4 uppercase opacity-70">
            Queue Density
          </p>
          <p className="text-white text-5xl font-bold tracking-tight tabular-nums relative z-10 flex items-baseline">
            {liveTokens} <span className="text-lg text-stone-800 ml-2 font-medium">/{maxTokens}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const TokenStatsBar = ({ completed, remaining }) => {
  const total = completed + remaining;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  
  return (
    <div className="mb-12">
      <div className="bg-[#171412] rounded-[3rem] p-12 border border-stone-800/60 overflow-hidden relative shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div>
            <h3 className="text-stone-700 text-[11px] font-bold tracking-widest mb-6 uppercase opacity-60">
              Shift Progress
            </h3>
            <div className="flex items-baseline gap-4">
              <span className="text-white text-7xl font-bold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-stone-500">
                {completed}
              </span>
              <span className="text-stone-600 text-xs font-bold tracking-tight uppercase opacity-60">
                Served Today
              </span>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <span className="text-orange-600 text-5xl font-bold tracking-tight leading-none drop-shadow-md">
              {remaining}
            </span>
            <p className="text-stone-700 text-[10px] font-bold tracking-tight uppercase mt-3 opacity-80 border border-stone-800 px-4 py-2 rounded-full inline-block ml-auto">
              Waiting in Line
            </p>
          </div>
        </div>
        
        <div className="w-full h-4 bg-[#0C0A09] rounded-full border border-stone-800/60 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6 px-2">
          <span className="text-stone-600 text-xs font-bold tracking-tight uppercase bg-stone-900 px-4 py-1.5 rounded-xl border border-stone-800">
            Efficiency: {Math.round(progress)}%
          </span>
          <div className="flex items-center gap-2 bg-orange-600/10 px-4 py-1.5 rounded-xl border border-orange-600/20">
            <Zap color="#EA580C" size={14} strokeWidth={3} />
            <span className="text-orange-600 text-[10px] font-bold tracking-tight uppercase">
              System Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ served: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/counters/my-counter');
      setStats({
        served: response.data.stats?.todayTotal || 0,
        pending: response.data.waitingTokens?.length || 0,
      });
    } catch (e) {
      console.error('Failed to sync operator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
     return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center">
         <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
         <p className="text-stone-500 text-xs font-bold tracking-tight animate-pulse uppercase">Syncing Dashboard...</p>
       </div>
     );
  }

  return (
    <div className="font-sans space-y-12 animate-in pb-40">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-stone-800/40 pb-12">
        <div>
           <div className="flex items-center gap-3 mb-6">
             <div className="w-2.5 h-2.5 rounded-full bg-orange-600 shadow-[0_0_12px_rgba(234,88,12,0.8)] animate-pulse" />
             <span className="text-stone-500 text-[10px] font-bold tracking-widest uppercase opacity-60">Dashboard</span>
           </div>
           <h1 className="text-textPrimary text-5xl font-bold tracking-tight leading-none text-white">
             {user?.name || "Staff Member"}
           </h1>
        </div>
      </div>

      <AssignedServiceCard
        serviceName={user?.assignedServices?.[0]?.name || "Service Node"}
        counterNumber={user?.assignedCounter?.number || user?.assignedCounter || "N/A"}
        staffName={user?.name || "Authorized Staff"}
        liveTokens={stats.pending}
        maxTokens={user?.assignedServices?.[0]?.maxTokenLimit || 50}
        isAssigned={!!user?.assignedCounter}
        isOnline={true}
        venue={user?.assignedServices?.[0]?.venue || ""}
      />

      {!!user?.assignedCounter && (
        <>
          <TokenStatsBar completed={stats.served} remaining={stats.pending} />
          
          <div className="space-y-6">
            <Link
              to="/staff/queue"
              className="bg-orange-600 hover:bg-orange-500 text-white p-8 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-2xl shadow-orange-600/20"
            >
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Activity size={28} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold tracking-tight mb-2 leading-none uppercase">Queue Handling</h3>
                  <p className="text-orange-100 text-xs font-medium tracking-tight opacity-80">Initialize active processing matrix</p>
                </div>
              </div>
              <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform opacity-60" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
