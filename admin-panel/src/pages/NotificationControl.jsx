import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Send, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  ArrowLeft, 
  Zap, 
  Info, 
  Activity, 
  Radio,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BellRing
} from 'lucide-react';

const NotificationControl = () => {
  const [formData, setFormData] = useState({ title: '', message: '', targetRole: 'all' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/notifications/broadcast', formData);
      setStatus({ type: 'success', text: `Notification sent successfully to ${formData.targetRole} users.` });
      setFormData({ title: '', message: '', targetRole: 'all' });
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to send notification. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                <BellRing size={14} />
                Communication Hub
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Send Notifications</h1>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-[#1C1917] px-8 py-5 rounded-[2rem] border border-stone-800 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#9A3412] opacity-50" />
                <div className="w-10 h-10 rounded-2xl bg-[#9A3412]/10 flex items-center justify-center text-[#9A3412]">
                   <Radio size={20} className="animate-pulse" />
                </div>
                <div>
                   <p className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-600">System Status</p>
                   <p className="text-xs font-black text-white">Notification Service: Ready</p>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#1C1917] rounded-[4rem] p-12 border border-stone-800/50 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4 mb-6 flex items-center gap-2">
                     <Users size={10} className="text-[#9A3412]" /> Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'all', label: 'All Users', icon: <Users size={18} /> },
                      { id: 'student', label: 'Students', icon: <GraduationCap size={18} /> },
                      { id: 'staff', label: 'Staff', icon: <ShieldCheck size={18} /> },
                    ].map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, targetRole: role.id })}
                        className={`group p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 relative overflow-hidden active:scale-[0.98] ${
                          formData.targetRole === role.id 
                          ? 'bg-[#9A3412]/10 border-[#9A3412] text-[#FAFAF9] shadow-xl shadow-orange-950/10' 
                          : 'bg-[#1F1D1B] border-stone-800 text-stone-600 hover:border-stone-700'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          formData.targetRole === role.id ? 'bg-[#9A3412] text-white shadow-lg' : 'bg-stone-900 text-stone-700 group-hover:text-stone-500'
                        }`}>
                           {role.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{role.label}</span>
                        {formData.targetRole === role.id && (
                           <div className="absolute top-2 right-2 text-[#9A3412]">
                              <CheckCircle2 size={12} />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                     <BellRing size={10} className="text-[#9A3412]" /> Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ENTER SUBJECT..."
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-6 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-900 border-dashed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                     <Activity size={10} className="text-[#9A3412]" /> Message
                  </label>
                  <textarea
                    required
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-[2.5rem] p-8 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition h-48 resize-none placeholder-stone-900 border-dashed leading-relaxed"
                  />
                </div>

                {status && (
                  <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                    <div className="flex items-center gap-4">
                       {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                       <p className="text-[10px] font-black uppercase tracking-[0.3em]">{status.text}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-[#9A3412] hover:bg-[#C2410C] py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-orange-950/40 hover:scale-[0.99] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       Sending...
                    </div>
                  ) : (
                    <>
                       <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                       Send Notification
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-[#1C1917] p-10 rounded-[3.5rem] border border-stone-800/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
               <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <Info className="text-[#9A3412]" size={20} /> 
                  Guidelines
               </h3>
               <ul className="space-y-6">
                  {[
                    "Notifications are sent in real-time to the selected audience.",
                    "Service Status: Online",
                    "Ensure content is clear and concise.",
                    "Staff filters ensure messages reach only verified staff."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 group/item">
                       <div className="text-[#9A3412] opacity-30 mt-1 font-black group-hover/item:opacity-100 transition-opacity text-xs">0{i+1}.</div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 leading-relaxed group-hover/item:text-stone-400 transition-colors">
                         {item}
                       </p>
                    </li>
                  ))}
               </ul>
            </div>
            
            <div className="bg-[#9A3412]/5 p-10 rounded-[3.5rem] border border-[#9A3412]/20 relative overflow-hidden">
               <div className="absolute -bottom-8 -right-8 text-[#9A3412] opacity-5">
                  <Zap size={120} strokeWidth={1} />
               </div>
               <div className="flex items-center gap-3 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <Activity size={14} /> System Health
               </div>
               <p className="text-4xl font-black tracking-tighter uppercase text-[#FAFAF9]">Online</p>
               <p className="text-[9px] text-stone-600 font-black uppercase tracking-[0.2em] mt-4 leading-relaxed">
                  The notification service is fully operational and optimized.
               </p>
            </div>

            <div className="bg-[#1C1917] p-10 rounded-[3.5rem] border border-stone-800/50 flex flex-col items-center text-center gap-6 group hover:border-stone-700 transition-colors">
               <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 group-hover:text-[#9A3412] group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <BellRing size={28} />
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">History Log</p>
                  <Link to="/admin/logs" className="text-xs font-black text-[#FAFAF9] hover:text-[#9A3412] transition-colors flex items-center gap-2 mt-2 uppercase">
                     View Notification History <ChevronRight size={14} />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationControl;
