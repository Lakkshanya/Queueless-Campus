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
    const name = prompt('Type the 4-word tunnel name from your terminal (e.g. mold-farms-sandwich):');
    if (name) {
      const clean = name.trim().toLowerCase();
      localStorage.setItem('serverUrl', `https://${clean}.trycloudflare.com/api`);
      localStorage.setItem('portalUrl', `https://${clean}.trycloudflare.com`);
      alert('Server Synced! Re-trying... (The page will reload to apply)');
      window.location.reload();
    }
  };

  return (
    <button 
      onClick={handleSync}
      className={`px-4 py-2 border rounded-full flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group shadow-lg ${
        status === 'online' 
        ? 'bg-green-950/20 border-green-900/30' 
        : status === 'offline' 
        ? 'bg-red-950/20 border-red-900/30 animate-pulse' 
        : 'bg-stone-950/50 border-stone-800'
      }`}
    >
      <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${
        status === 'online' 
        ? 'bg-green-500 shadow-green-500/50' 
        : status === 'offline' 
        ? 'bg-red-500 shadow-red-500/50' 
        : 'bg-orange-500 shadow-orange-500/50'
      }`} />
      
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
        status === 'online' ? 'text-green-500' : status === 'offline' ? 'text-red-500' : 'text-stone-500'
      }`}>
        {status === 'online' ? 'Tunnel Active' : status === 'offline' ? 'Tunnel Down' : 'Syncing...'}
      </span>

      <RefreshCw size={10} className={`text-stone-600 transition-transform ${status === 'offline' ? 'text-red-500' : 'group-hover:rotate-180'}`} />
    </button>
  );
};

export default DashboardStatus;
