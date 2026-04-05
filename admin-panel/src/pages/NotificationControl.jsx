import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Send, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Zap, 
  Activity, 
  Radio,
  CheckCircle2,
  BellRing,
  History,
  Trash2,
  Search,
  Filter
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
      await api.post('/notifications/broadcast', formData);
      setStatus({ type: 'success', text: `Broadcast successful. Delivered to ${formData.targetRole} nodes.` });
      setFormData({ title: '', message: '', targetRole: 'all' });
      fetchHistory();
    } catch (error) {
      setStatus({ type: 'error', text: 'Broadcast failed. Network protocols interrupted.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Radio size={14} className="animate-pulse" />
            Communication Hub
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white">Broadcast</h1>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mt-4">Dispatch system-wide notifications & alerts</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-[#1C1917] px-8 py-5 rounded-[2rem] border border-stone-800 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-orange-600/10 rounded-full blur-2xl -mr-6 -mt-6" />
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-600 border border-orange-600/20">
                 <Activity size={20} />
              </div>
              <div>
                 <p className="text-[9px] uppercase font-black tracking-[0.3em] text-stone-600">Total Transmissions</p>
                 <p className="text-2xl font-black text-white tracking-tighter">{history.length}</p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Broadcast Form */}
        <div className="lg:col-span-5">
          <div className="bg-[#1C1917] rounded-[3.5rem] p-10 border border-stone-800/60 shadow-2xl relative overflow-hidden sticky top-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.02] blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-10 flex items-center gap-3">
              <Zap size={20} className="text-orange-600" /> New Transmission
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4 mb-4 flex items-center gap-2">
                   Target Nodes
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'all', label: 'Global', icon: <Radio size={16} /> },
                    { id: 'student', label: 'Students', icon: <GraduationCap size={16} /> },
                    { id: 'staff', label: 'Staff', icon: <ShieldCheck size={16} /> },
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetRole: role.id })}
                      className={`font-black uppercase tracking-widest text-[9px] p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                        formData.targetRole === role.id 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg' 
                        : 'bg-stone-900 border-stone-800 text-stone-600 hover:border-stone-700'
                      }`}
                    >
                       {role.icon}
                       {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="IDENTIFIER..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4">Payload Content</label>
                <textarea
                  required
                  placeholder="Enter transmission data..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-[2rem] p-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition h-40 resize-none placeholder-stone-800 shadow-inner leading-relaxed"
                />
              </div>

              {status && (
                <div className={`p-5 rounded-2xl border animate-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                  <div className="flex items-center gap-3">
                     {status.type === 'success' ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                     <p className="text-[9px] font-black uppercase tracking-[0.3em]">{status.text}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-orange-950/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-white text-[11px]"
              >
                {loading ? 'TRANSMITTING...' : (
                  <>
                    <Send size={18} strokeWidth={3} /> Dispatch Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-7">
          <div className="bg-[#1C1917] rounded-[3.5rem] border border-stone-800/60 overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="p-10 border-b border-stone-800/50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <History size={22} className="text-orange-600" /> Archive
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH LOGS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 p-3 pl-10 rounded-xl outline-none focus:border-stone-700 text-[9px] font-black uppercase tracking-[0.2em] text-white placeholder-stone-800"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-h-[700px]">
              {fetching ? (
                <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                   <div className="w-10 h-10 border-2 border-stone-800 border-t-orange-600 rounded-full animate-spin" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-white">Syncing Logs...</p>
                </div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item, i) => (
                  <div key={i} className="bg-stone-900/40 border border-stone-800 p-6 rounded-[2rem] hover:border-stone-700 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                          item.targetRole === 'student' ? 'bg-emerald-500/10 text-emerald-500' : 
                          item.targetRole === 'staff' ? 'bg-blue-500/10 text-blue-500' : 
                          'bg-orange-600/10 text-orange-600'
                        }`}>
                          {item.targetRole === 'student' ? 'S' : item.targetRole === 'staff' ? 'T' : 'G'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter">{item.title}</p>
                          <p className="text-[8px] font-bold text-stone-600 uppercase tracking-widest mt-0.5">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-stone-950 rounded-full border border-stone-800 text-[8px] font-black text-stone-600 uppercase tracking-widest">
                        {item.targetRole || 'Global'}
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest leading-relaxed mb-4 relative z-10 italic">
                      {item.message}
                    </p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-stone-700 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20 flex flex-col items-center gap-6">
                   <BellRing size={48} strokeWidth={1} />
                   <div className="max-w-[200px]">
                      <p className="text-sm font-black uppercase tracking-widest">Archive Empty</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest mt-2 leading-relaxed">No historical transmission logs found in system archive.</p>
                   </div>
                </div>
              )}
            </div>
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

export default NotificationControl;
