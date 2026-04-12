import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, RefreshCw } from 'lucide-react';

const DashboardStatus = () => {
  const [status, setStatus] = useState('testing');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/ping', { timeout: 3000 });
        if (res.status === 200) setStatus('online');
        else setStatus('offline');
      } catch (err) {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    const name = prompt('Server Synchronization: Enter the 4-word tunnel identifier (e.g. mold-farms-sandwich):');
    if (name) {
      const clean = name.trim().toLowerCase();
      localStorage.setItem('serverUrl', `https://${clean}.trycloudflare.com/api`);
      localStorage.setItem('portalUrl', `https://${clean}.trycloudflare.com`);
      alert('SYN_ACK: Frequency shifted. Re-establishing connection... (Page reloading)');
      window.location.reload();
    }
  };

  return (
    <button 
      onClick={handleSync}
      className={`px-6 py-3 border rounded-full flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group shadow-2xl backdrop-blur-md overflow-hidden relative ${
        status === 'online' 
        ? 'bg-emerald-950/10 border-emerald-900/20' 
        : status === 'offline' 
        ? 'bg-red-950/10 border-red-900/20 animate-pulse' 
        : 'bg-stone-900/40 border-stone-800'
      }`}
    >
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-gradient-to-r ${status === 'online' ? 'from-emerald-600' : status === 'offline' ? 'from-red-600' : 'from-orange-600'}`} />
      
      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px] relative z-10 ${
        status === 'online' 
        ? 'bg-emerald-500 shadow-emerald-500/50' 
        : status === 'offline' 
        ? 'bg-red-500 shadow-red-500/50' 
        : 'bg-orange-600 shadow-orange-600/50'
      }`}>
         <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${status === 'online' ? 'bg-emerald-500' : status === 'offline' ? 'bg-red-500' : 'bg-orange-600'}`} />
      </div>
      
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] relative z-10 flex items-center gap-2 ${
        status === 'online' ? 'text-emerald-500' : status === 'offline' ? 'text-red-500' : 'text-stone-500'
      }`}>
        {status === 'online' ? 'Link Secured' : status === 'offline' ? 'Link Severed' : 'Establishing Link...'}
        <span className="text-stone-800 hidden lg:inline">|</span>
        <span className="text-[9px] text-stone-700 font-bold hidden lg:inline">{status === 'online' ? 'ENCRYPTED' : 'FAILURE'}</span>
      </span>

      <div className="relative z-10 w-6 h-6 rounded-lg bg-stone-900/50 border border-stone-800/60 flex items-center justify-center group-hover:border-orange-600/30 transition-all">
        <RefreshCw size={12} className={`text-stone-600 transition-transform duration-700 ${status === 'offline' ? 'text-red-500' : 'group-hover:rotate-180'}`} strokeWidth={3} />
      </div>
    </button>
  );
};

export default DashboardStatus;
