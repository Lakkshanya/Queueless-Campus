import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Search,
  Zap,
  ShieldCheck,
  User,
  Activity,
  Send,
  Users,
  MessageSquare
} from "lucide-react";

const StaffNotificationView = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab & Broadcast State
  const [activeTab, setActiveTab] = useState("broadcast");
  const [target, setTarget] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/notifications");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching notification history:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    } else {
      setFetching(false);
    }
  }, [activeTab]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatus({ type: "error", text: "Please enter a message before sending." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      if (target === "student") {
        const serviceId = user?.assignedServices?.[0]?._id;
        if (!serviceId) {
          setStatus({ type: "error", text: "No assigned service node detected for targeted broadcast." });
          setLoading(false);
          return;
        }
        await api.post("/notifications/staff/broadcast", {
          serviceId,
          message,
        });
        setStatus({ type: "success", text: "Alert broadcast to all students in your line." });
      } else {
        await api.post("/notifications/admin/notify", { message });
        setStatus({ type: "success", text: "Administration notified successfully." });
      }
      setMessage("");
    } catch (error) {
      setStatus({
        type: "error",
        text: error.response?.data?.message || "Network authorization error.",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setHistory(history.map(h => h._id === id ? { ...h, isRead: true } : h));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const filteredHistory = history.filter(
    (h) =>
      (h.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.message || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-stone-800/40 pb-12">
        <div>
          <div className="flex items-center gap-3 text-orange-600 text-[10px] font-bold tracking-tight mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10 uppercase">
            <Bell size={12} strokeWidth={3} /> Staff Alert System
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-none">
            Inbox & Alerts
          </h1>
          <p className="text-stone-500 text-xs font-bold tracking-tight mt-6 max-w-xl leading-relaxed">
            Manage your incoming assignments or broadcast updates directly to your active queue.
          </p>
        </div>
        
        {activeTab === "history" && (
          <div className="relative group/search flex-1 lg:max-w-md w-full">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-800 group-focus-within/search:text-orange-600 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171412] border border-stone-800/60 p-4 pl-12 rounded-2xl outline-none text-xs font-bold tracking-tight text-white placeholder-stone-900 focus:border-orange-600/40 transition-all shadow-inner"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
         <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-5 rounded-2xl font-bold tracking-tight text-xs uppercase transition-all shadow-lg ${activeTab === 'broadcast' ? 'bg-orange-600/10 border border-orange-600 text-orange-600' : 'bg-[#171412] border border-stone-800 text-stone-500 hover:border-stone-700'}`}
         >
            Broadcast
         </button>
         <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-5 rounded-2xl font-bold tracking-tight text-xs uppercase transition-all shadow-lg ${activeTab === 'history' ? 'bg-orange-600/10 border border-orange-600 text-orange-600' : 'bg-[#171412] border border-stone-800 text-stone-500 hover:border-stone-700'}`}
         >
            History / Inbox
         </button>
      </div>

      {activeTab === "broadcast" ? (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
               <div className="bg-[#171412] rounded-[3rem] p-10 border border-stone-800/60 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] blur-[100px] pointer-events-none" />
                  
                  <div className="mb-10">
                     <p className="text-stone-700 text-[10px] font-bold tracking-widest mb-6 uppercase opacity-60">Active Service</p>
                     <div className="bg-[#0C0A09] rounded-3xl p-6 border border-stone-800 flex flex-row items-center">
                        <div className="w-12 h-12 bg-[#171412] rounded-2xl flex items-center justify-center border border-stone-800 mr-5 shadow-inner">
                           <Activity color="#EA580C" size={18} />
                        </div>
                        <div>
                           <p className="text-white font-bold tracking-tight text-lg">{user?.assignedServices?.[0]?.name || 'No Service Assigned'}</p>
                           <p className="text-stone-800 text-[10px] font-bold tracking-tight uppercase mt-1 opacity-60">Auto-linked to your service node</p>
                        </div>
                     </div>
                  </div>

                  <form onSubmit={handleDispatch} className="space-y-10 z-10 relative">
                     <div className="space-y-5">
                       <label className="text-stone-600 text-xs font-bold tracking-tight uppercase">
                         Target Allocation
                       </label>
                       <div className="flex gap-4">
                         <button
                           type="button"
                           onClick={() => setTarget('student')}
                           className={`flex-1 p-6 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                             target === 'student'
                               ? 'bg-orange-600/10 border-orange-600 text-orange-600 shadow-lg'
                               : 'bg-[#0C0A09] border-stone-800 text-stone-700'
                           }`}
                         >
                           <Users size={20} className="mb-3" />
                           <span className="font-bold tracking-tight text-[11px] uppercase">STUDENTS</span>
                         </button>
                         <button
                           type="button"
                           onClick={() => setTarget('admin')}
                           className={`flex-1 p-6 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                             target === 'admin'
                               ? 'bg-orange-600/10 border-orange-600 text-orange-600 shadow-lg'
                               : 'bg-[#0C0A09] border-stone-800 text-stone-700'
                           }`}
                         >
                           <ShieldCheck size={20} className="mb-3" />
                           <span className="font-bold tracking-tight text-[11px] uppercase">ADMIN</span>
                         </button>
                       </div>
                     </div>

                     <div className="space-y-4">
                       <label className="text-stone-700 text-[10px] font-bold tracking-widest uppercase opacity-60">
                         Message Content
                       </label>
                       <textarea
                         required
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         className="w-full bg-[#0C0A09] border border-stone-800 p-8 rounded-3xl outline-none text-sm font-medium text-stone-300 focus:text-white focus:border-orange-600 transition h-48 resize-none shadow-inner placeholder-stone-800 leading-relaxed custom-scrollbar"
                         placeholder="Type your message here..."
                       />
                     </div>
                     {status && (
                       <div className={`p-6 rounded-2xl border animate-in slide-in-from-top-2 flex items-center gap-4 ${status.type === "success" ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" : "bg-red-500/5 border-red-500/10 text-red-500"}`}>
                         <Activity size={18} className="animate-pulse" />
                         <p className="text-xs font-bold tracking-tight leading-tight">{status.text}</p>
                       </div>
                     )}
                     <button
                       type="submit"
                       disabled={loading}
                       className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-[2rem] font-bold tracking-tight text-white shadow-2xl shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase text-xs"
                     >
                       {loading ? (
                         <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       ) : (
                         <><Send size={18} strokeWidth={3} /> Broadcast Alert</>
                       )}
                     </button>
                  </form>
               </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#171412]/50 border border-stone-800/40 rounded-[2.5rem] p-8">
                  <div className="flex items-center mb-6">
                    <Activity color="#EA580C" size={14} />
                    <span className="text-stone-500 text-[10px] font-bold tracking-tight ml-3 uppercase">Secure Network Alert</span>
                  </div>
                  <p className="text-stone-600 text-xs font-bold tracking-tight leading-relaxed italic opacity-80">
                    All broadcast traffic is encrypted and logged for auditing. Communications to the student network are prioritized based on current queue line positions (1-3).
                  </p>
                </div>
            </div>
         </div>
      ) : (
         fetching ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
             <p className="text-stone-500 text-xs font-bold tracking-tight animate-pulse uppercase">
                Fetching Alerts...
             </p>
          </div>
         ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Quick Stats Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#171412] p-8 rounded-[2.5rem] border border-stone-800/60 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/[0.03] blur-2xl pointer-events-none" />
                <Activity size={24} className="text-orange-600 mb-6" />
                <p className="text-stone-700 text-[10px] font-bold tracking-widest uppercase mb-1">Unread Alerts</p>
                <p className="text-4xl font-bold tracking-tight text-white leading-none">
                  {history.filter(h => !h.isRead).length}
                </p>
              </div>
              
              <div className="bg-[#171412] p-8 rounded-[2.5rem] border border-stone-800/60 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/[0.03] blur-2xl pointer-events-none" />
                <CheckCircle2 size={24} className="text-emerald-500 mb-6" />
                <p className="text-stone-700 text-[10px] font-bold tracking-widest uppercase mb-1">Total Received</p>
                <p className="text-4xl font-bold tracking-tight text-white leading-none">
                  {history.length}
                </p>
              </div>
            </div>

            {/* Notification Feed */}
            <div className="lg:col-span-9 space-y-6">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, i) => (
                  <div
                    key={i}
                    className={`group relative bg-[#171412] border transition-all duration-500 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-center ${item.isRead ? 'border-stone-800/40 opacity-80' : 'border-orange-600/30 ring-1 ring-orange-600/10'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${item.isRead ? 'bg-[#0C0A09] text-stone-700' : 'bg-orange-600 text-white shadow-orange-950/40'}`}>
                      {item.type === 'staff_alert' ? <AlertCircle size={24} /> : item.type === 'assignment' ? <ShieldCheck size={24} /> : <Bell size={24} />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`text-xl font-bold tracking-tight leading-none ${item.isRead ? 'text-stone-400' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-stone-500 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="flex items-center gap-2 text-stone-700 font-bold tracking-tight text-[10px] uppercase">
                          <Clock size={12} /> {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {!item.isRead && (
                      <button 
                        onClick={() => markAsRead(item._id)}
                        className="px-6 py-3 bg-[#0C0A09] border border-stone-800 rounded-xl text-stone-500 text-[10px] font-bold tracking-tight uppercase hover:text-orange-600 hover:border-orange-600/40 transition-all active:scale-95"
                      >
                        Mark Seen
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-24 text-center border border-stone-800/40 border-dashed rounded-[3rem] opacity-30 flex flex-col items-center gap-6">
                  <Zap size={48} />
                  <p className="text-sm font-bold tracking-tight uppercase">
                    Inbox is clear. No active alerts.
                  </p>
                </div>
              )}
            </div>
          </div>
         )
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: ` .custom-scrollbar::-webkit-scrollbar { width: 5px;} .custom-scrollbar::-webkit-scrollbar-track { background: transparent;} .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09;} .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C;}`,
        }}
      />
    </div>
  );
};

export default StaffNotificationView;
