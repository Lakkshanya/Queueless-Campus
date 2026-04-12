import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Send, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Activity, 
  CheckCircle2,
  BellRing,
  History,
  Trash2,
  Search,
  MessageSquare,
  Clock,
  AlertCircle,
  Zap,
  Layout
} from 'lucide-react';

const NotificationControl = () => {
  const [formData, setFormData] = useState({ title: '', message: '', targetRole: 'all' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await api.get('/notifications');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // Requirement: uses FCM broadcast (/notifications/send call)
      await api.post('/notifications/send', formData);
      setStatus({ type: 'success', text: `BROADCAST_SUCCESS: Protocol dispatched to ${formData.targetRole.toUpperCase()} network.` });
      setFormData({ title: '', message: '', targetRole: 'all' });
      fetchHistory();
    } catch (error) {
      setStatus({ type: 'error', text: 'DISPATCH_ERROR: Network authorization failed.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    (h.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (fetching) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Communication Node...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-orange-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10">
            <BellRing size={12} strokeWidth={3} />
            Global Communications Engine
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">Broadcast Alerts</h1>
          <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-6 max-w-xl leading-relaxed">
            Dispatch critical campus updates and operational notifications across the mobile and web network via real-time FCM link.
          </p>
        </div>
        
        <div className="bg-[#171412] px-8 py-4 rounded-[2rem] border border-stone-800/60 shadow-2xl relative overflow-hidden group transition-all hover:border-orange-600/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/[0.03] blur-2xl pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600 shadow-inner group-hover:scale-105 transition-transform duration-500">
               <Zap size={20} strokeWidth={2.5} />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-stone-600 mb-1">Grid Traffic</p>
               <p className="text-2xl font-black text-white tracking-tighter leading-none">{history.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Form */}
        <div className="lg:col-span-5">
           <div className="bg-[#171412] border border-stone-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden sticky top-32">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] blur-[100px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-12">
                 <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-950/40">
                    <MessageSquare size={18} className="text-white fill-white" />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Create Protocol</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em] ml-2">Target Audience</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'all', label: 'ALL', icon: <Layout size={14} /> },
                      { id: 'student', label: 'STUDENTS', icon: <GraduationCap size={14} /> },
                      { id: 'staff', label: 'STAFF', icon: <ShieldCheck size={14} /> },
                    ].map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetRole: role.id })}
                        className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all active:scale-95 ${
                          formData.targetRole === role.id 
                          ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-950/40' 
                          : 'bg-[#0C0A09] border-stone-800 text-stone-700 hover:border-stone-700'
                        }`}
                      >
                         <div className={formData.targetRole === role.id ? 'text-white' : 'text-stone-800 group-hover:text-stone-600'}>
                          {role.icon}
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-widest leading-none">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em] ml-2">Broadcast Headline</label>
                  <input
                    type="text" required value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0C0A09] border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black uppercase tracking-[0.1em] text-white focus:border-orange-600 transition shadow-inner placeholder-stone-900"
                    placeholder="E.G. EMERGENCY_MAINTENANCE..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em] ml-2">Protocol Details</label>
                  <textarea
                    required value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0C0A09] border border-stone-800 p-8 rounded-3xl outline-none text-[11px] font-medium tracking-wide text-stone-500 focus:text-white focus:border-orange-600 transition h-48 resize-none shadow-inner placeholder-stone-900 leading-relaxed custom-scrollbar"
                    placeholder="Enter exhaustive details for the campus network..."
                  />
                </div>

                {status && (
                  <div className={`p-6 rounded-2xl border animate-in slide-in-from-top-2 flex items-center gap-4 ${status.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                     <Activity size={18} className="animate-pulse shadow-emerald-500/10" />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{status.text}</p>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-black uppercase tracking-[0.6em] text-white shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-5 leading-none"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Send size={18} strokeWidth={3} /> INITIALIZE DISPATCH</>}
                </button>
              </form>
           </div>
        </div>

        {/* Staff Alerts Monitor (Integrated from Audio Requirement) */}
        <div className="lg:col-span-7 space-y-8">
           <div className="flex items-center justify-between gap-8 mb-4">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                 <AlertCircle size={20} className="text-orange-600" /> Staff Operational Alerts
              </h3>
              <div className="px-4 py-2 bg-orange-600/10 border border-orange-600/20 rounded-xl text-[9px] font-black text-orange-600 uppercase tracking-widest animate-pulse">
                Live Monitoring
              </div>
           </div>

           <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 mb-12">
              {history.filter(h => h.type === 'staff_alert').length > 0 ? (
                history.filter(h => h.type === 'staff_alert').map((item, i) => (
                  <div key={i} className="group relative bg-[#1c1917] border border-orange-600/20 p-8 rounded-[2rem] transition-all hover:bg-orange-600/[0.02] shadow-xl overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
                             <ShieldCheck size={20} />
                          </div>
                          <div>
                             <h4 className="text-lg font-black uppercase tracking-tighter text-white">{item.title}</h4>
                             <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                          </div>
                       </div>
                       <button className="text-stone-800 hover:text-orange-600 transition-colors">
                          <CheckCircle2 size={18} />
                       </button>
                    </div>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider leading-relaxed italic">
                      "{item.message}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border border-stone-800/40 border-dashed rounded-[2rem] opacity-30 flex flex-col items-center gap-4">
                   <Clock size={32} />
                   <p className="text-[10px] font-black uppercase tracking-widest">No Operational Alerts Pending</p>
                </div>
              )}
           </div>

           {/* Global Transmission Log */}
           <div className="flex items-center justify-between gap-8 mb-4 pt-8 border-t border-stone-800/40">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                 <History size={20} className="text-stone-700" /> Broadcast History
              </h3>
              <div className="relative group/search flex-1 lg:max-w-xs">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-800 group-focus-within/search:text-orange-600 transition-colors" size={12} />
                <input 
                  type="text" placeholder="FILTER LOGS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#171412] border border-stone-800/60 p-4 pl-12 rounded-2xl outline-none text-[10px] font-black tracking-widest text-white placeholder-stone-900 focus:border-orange-600/40 transition-all shadow-inner"
                />
              </div>
           </div>

           <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
              {filteredHistory.filter(h => h.type !== 'staff_alert').map((item, i) => (
                <div key={i} className="group relative bg-[#171412] border border-stone-800/40 p-8 rounded-[2.5rem] transition-all hover:border-orange-600/30 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-800/40">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner bg-gradient-to-br ${item.targetRole === 'student' ? 'from-emerald-600/20 to-emerald-900/10' : item.targetRole === 'staff' ? 'from-blue-600/20 to-blue-900/10' : 'from-orange-600/20 to-orange-900/10'}`}>
                           {item.targetRole === 'student' ? <GraduationCap size={20} /> : item.targetRole === 'staff' ? <ShieldCheck size={20} /> : <Users size={20} />}
                        </div>
                        <div>
                           <h4 className="text-xl font-black uppercase tracking-tighter text-white leading-none mb-2">{item.title}</h4>
                           <span className="text-[9px] font-black text-stone-700 uppercase tracking-widest">
                             {new Date(item.createdAt).toLocaleString()}
                           </span>
                        </div>
                     </div>
                     <span className="px-4 py-1.5 bg-[#0C0A09] border border-stone-800 rounded-lg text-[8px] font-black text-stone-600 uppercase tracking-widest">
                        {item.targetRole?.toUpperCase() || 'ALL'}
                     </span>
                  </div>
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-[0.1em] leading-relaxed">
                     {item.message}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C; }
      `}} />
    </div>
  );
};

export default NotificationControl;
