import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Building, 
  UserX, 
  UserCheck,
  X,
  Plus,
  Search,
  Activity,
  Monitor,
  CheckCircle2,
  Settings2
} from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', department: '', role: 'staff' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [staffRes, counterRes] = await Promise.all([
        api.get('/auth/staff'),
        api.get('/counters')
      ]);
      setStaff(staffRes.data);
      setCounters(counterRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/create-staff', newStaff);
      setIsModalOpen(false);
      setNewStaff({ name: '', email: '', department: '', role: 'staff' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleVerifyStaff = async (staffId, status) => {
    try {
      await api.post('/auth/verify-staff', { staffId, isVerified: status });
      fetchData();
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/auth/staff/${id}`);
      fetchData();
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const handleAssignCounter = async (counterId) => {
    if (!selectedStaff) return;
    try {
       // This endpoint might vary based on backend implementation
       await api.post(`/auth/assign-counter`, { 
         staffId: selectedStaff._id, 
         counterId 
       });
       setIsCounterModalOpen(false);
       fetchData();
    } catch (error) {
       alert('Counter assignment failed');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-6" />
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.4em]">Syncing Personnel Database...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Users size={14} />
            Human Resources
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white">Personnel</h1>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mt-4">Administrative access & counter management</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH STAFF..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1917] border border-stone-800 p-5 pl-14 rounded-3xl focus:border-orange-600 outline-none transition text-[10px] font-black uppercase tracking-widest text-white placeholder-stone-700 shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white p-5 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-3 active:scale-95 transition-all"
          >
            <UserPlus size={18} strokeWidth={3} />
            Add Staff
          </button>
        </div>
      </header>

      {/* Staff Table */}
      <div className="bg-[#1C1917] rounded-[3.5rem] border border-stone-800/60 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 opacity-[0.02] blur-3xl pointer-events-none" />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-800/50 bg-stone-900/30">
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Employee Details</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Department</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Terminal Assignment</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Status</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/20">
              {filteredStaff.map(s => (
                <tr key={s._id} className="hover:bg-stone-900/40 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xl text-stone-600 group-hover:text-orange-600 group-hover:border-orange-600/30 transition-all">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tighter text-lg">{s.name}</p>
                        <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                           <Mail size={10} className="text-orange-600" /> {s.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600">
                         <Building size={14} />
                       </div>
                       <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">{s.department || 'CENTRAL ADMIN'}</span>
                    </div>
                  </td>
                  <td className="p-8">
                     <button 
                       onClick={() => { setSelectedStaff(s); setIsCounterModalOpen(true); }}
                       className="group/btn flex items-center gap-3 px-5 py-3 bg-stone-900/50 hover:bg-stone-900 border border-stone-800 rounded-2xl transition-all"
                     >
                        <Monitor size={14} className="text-orange-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                           {s.assignedCounter ? `TERM #${s.assignedCounter.number}` : 'UNASSIGNED'}
                        </span>
                        <Settings2 size={12} className="text-stone-700 group-hover/btn:text-white transition-colors" />
                     </button>
                  </td>
                  <td className="p-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-950 rounded-full border border-stone-800/50 shadow-inner">
                       <div className={`w-1.5 h-1.5 rounded-full ${s.isVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                       <span className={`text-[9px] font-black uppercase tracking-widest ${s.isVerified ? 'text-emerald-500' : 'text-red-500'}`}>
                         {s.isVerified ? 'VERIFIED' : 'PENDING'}
                       </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleVerifyStaff(s._id, !s.isVerified)}
                        className={`w-11 h-11 rounded-2xl border transition-all flex items-center justify-center ${
                          s.isVerified ? 'bg-stone-900 border-orange-600/30 text-orange-600' : 'bg-stone-900 border-emerald-600/30 text-emerald-500'
                        }`}
                        title={s.isVerified ? 'Revoke Verification' : 'Verify Access'}
                      >
                        {s.isVerified ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(s._id)}
                        className="w-11 h-11 rounded-2xl bg-stone-900 border border-red-900/30 text-red-500 hover:bg-stone-800 transition-all flex items-center justify-center"
                        title="Purge Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStaff.length === 0 && (
            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
               <ShieldCheck size={64} strokeWidth={1} />
               <div className="max-w-[200px]">
                  <p className="text-sm font-black uppercase tracking-widest">No Personnel Found</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-2 leading-relaxed">System scan complete. No matching employee signatures found in the database.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#1C1917] p-10 rounded-[3.5rem] border border-stone-800/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-[0.02] blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-orange-600/10 rounded-[1.5rem] border border-orange-600/20 flex items-center justify-center text-orange-600">
                  <Activity size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Utilization</h2>
                  <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest">Global Efficiency Rating</p>
               </div>
            </div>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">
                     <span>Resource Capacity</span>
                     <span className="text-white">84%</span>
                  </div>
                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800 shadow-inner">
                     <div className="w-[84%] h-full bg-orange-600" />
                  </div>
               </div>
               <p className="text-[10px] text-stone-500 font-medium leading-relaxed uppercase tracking-widest italic opacity-60">
                 All active terminals are currently operating within nominal parameters. Personnel allocation is optimized for current student traffic.
               </p>
            </div>
         </div>
         
         <div className="bg-stone-900/30 p-10 rounded-[3.5rem] border border-stone-800/40 border-dashed flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-700">
               <ShieldCheck size={32} strokeWidth={1} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-600 mb-2">System Security</p>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter">Verified Protocol Enforced</h3>
               <p className="text-[9px] text-stone-700 font-medium uppercase tracking-[0.2em] mt-3 max-w-[240px] mx-auto leading-relaxed">
                  Only verified staff accounts hold authorization to operate queue terminals and access student metadata.
               </p>
            </div>
         </div>
      </div>

      {/* Staff Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1C1917] w-full max-w-xl rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.05] blur-3xl" />
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Registry</h2>
                <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-2 italic">New employee identification logs</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-14 h-14 rounded-[1.5rem] bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white hover:bg-stone-800 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4">Legal Name</label>
                  <input 
                    type="text"
                    placeholder="E.G. ALBERT E."
                    value={newStaff.name}
                    onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4">Academic Email</label>
                  <input 
                    type="email"
                    placeholder="RELATIVITY@UNI.EDU"
                    value={newStaff.email}
                    onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4">Departmental Branch</label>
                <input 
                  type="text"
                  placeholder="E.G. PHYSICS & RESEARCH"
                  value={newStaff.department}
                  onChange={e => setNewStaff({...newStaff, department: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                  required
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-950/40 transition flex items-center justify-center gap-4 active:scale-95">
                  <UserPlus size={20} strokeWidth={3} />
                  Authorize Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Assignment Modal (Tool) */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in zoom-in-95 duration-300">
           <div className="bg-[#1C1917] w-full max-w-md rounded-[3.5rem] p-10 border border-stone-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.05)] bg-orange-600" />
              
              <div className="flex justify-between items-center mb-8 mt-4">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Terminal</h2>
                 <button onClick={() => setIsCounterModalOpen(false)} className="text-stone-700 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-8 px-2">Assign <span className="text-white italic">{selectedStaff?.name}</span> to a terminal:</p>
              
              <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 mb-10">
                 {counters.map(c => (
                    <button 
                      key={c._id}
                      onClick={() => handleAssignCounter(c._id)}
                      className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 active:scale-95 ${
                        selectedStaff?.assignedCounter?._id === c._id ? 'bg-orange-600 border-orange-600 text-white' : 'bg-stone-900 border-stone-800 text-stone-600 hover:border-stone-600 hover:text-white'
                      }`}
                    >
                       <Monitor size={24} strokeWidth={selectedStaff?.assignedCounter?._id === c._id ? 3 : 2} />
                       <span className="text-xs font-black uppercase tracking-tighter">TERM #{c.number}</span>
                    </button>
                 ))}
                 {counters.length === 0 && (
                   <div className="col-span-2 py-10 text-center opacity-20 italic">
                      <p className="text-[10px] font-black uppercase tracking-widest">No terminals detected...</p>
                   </div>
                 )}
              </div>
              
              <button onClick={() => handleAssignCounter(null)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] text-stone-700 hover:text-red-500 transition-colors border-t border-stone-800/50 pt-8">
                 Sever Assignment
              </button>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #292524; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9A3412; }
      `}} />
    </div>
  );
};

export default StaffManagement;
