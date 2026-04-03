import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Building, 
  ArrowLeft, 
  MoreHorizontal, 
  UserX, 
  UserCheck,
  X,
  Plus,
  Search,
  Activity,
  AlertCircle
} from 'lucide-react';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', department: '', role: 'staff' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await api.get('/auth/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/create-staff', newStaff);
      setIsModalOpen(false);
      setNewStaff({ name: '', email: '', department: '', role: 'staff' });
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.message || 'Staff registration failed. Please check the information and try again.');
    }
  };

  const handleVerifyStaff = async (staffId, status) => {
    try {
      await api.post('/auth/verify-staff', { staffId, isVerified: status });
      fetchStaff();
    } catch (error) {
      alert('Verification status update failed. Please try again later.');
    }
  };

  const handleDeleteStaff = async (id) => {
     if (!window.confirm('Warning: This will remove the staff member and revoke all access. Proceed with removal?')) return;
     try {
       await api.delete(`/auth/staff/${id}`);
       fetchStaff();
     } catch (error) {
        alert('Service update failed. Request rejected by the system.');
     }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-4" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Loading Staff Directory...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <Users size={14} />
                Human Resources
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Staff Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
              <input 
                type="text" 
                placeholder="Search Staff..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-72 bg-[#1C1917] border border-stone-800 p-4 pl-14 rounded-2xl focus:border-[#9A3412] outline-none transition text-[11px] font-black uppercase tracking-widest text-[#FAFAF9] placeholder-stone-700"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#9A3412] hover:bg-[#C2410C] text-white p-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-3 whitespace-nowrap active:scale-[0.98]"
            >
              <UserPlus size={18} />
              Add Staff Member
            </button>
          </div>
        </header>

        <div className="bg-[#1C1917] rounded-[3.5rem] border border-stone-800/50 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.01] blur-3xl pointer-events-none" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800/50 bg-[#1F1D1B]/50">
                  <th className="p-8 text-[10px] uppercase font-black tracking-[0.3em] text-stone-600">Staff Details</th>
                  <th className="p-8 text-[10px] uppercase font-black tracking-[0.3em] text-stone-600">Department</th>
                  <th className="p-8 text-[10px] uppercase font-black tracking-[0.3em] text-stone-600">Verification Status</th>
                  <th className="p-8 text-[10px] uppercase font-black tracking-[0.3em] text-stone-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/30">
                {filteredStaff.map(s => (
                  <tr key={s._id} className="hover:bg-stone-900/40 transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xl text-stone-600 group-hover:text-[#9A3412] group-hover:border-[#9A3412]/30 transition-all">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-[#FAFAF9] uppercase tracking-tighter text-lg">{s.name}</p>
                          <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                             <Mail size={10} className="text-[#9A3412]" /> {s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-stone-900/50 border border-stone-800/30 flex items-center justify-center text-stone-600">
                           <Building size={14} />
                         </div>
                         <span className="text-[11px] font-black text-[#D6D3D1] uppercase tracking-widest">{s.department || 'Central Administration'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-900/50 rounded-full border border-stone-800/30">
                         <div className={`w-1.5 h-1.5 rounded-full ${s.isVerified ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                         <span className={`text-[9px] font-black uppercase tracking-widest ${s.isVerified ? 'text-green-500' : 'text-red-500'}`}>
                           {s.isVerified ? 'Approved' : 'Action Required'}
                         </span>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleVerifyStaff(s._id, !s.isVerified)}
                          className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${
                            s.isVerified ? 'border-orange-900/20 text-orange-500 hover:bg-orange-950/20' : 'border-green-900/20 text-green-500 hover:bg-green-950/20'
                          }`}
                          title={s.isVerified ? 'Revoke Approval' : 'Approve Staff'}
                        >
                          {s.isVerified ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(s._id)}
                          className="w-10 h-10 rounded-xl border border-red-900/20 text-red-500 hover:bg-red-950/20 transition-all flex items-center justify-center"
                          title="Remove Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStaff.length === 0 && (
              <div className="py-32 text-center opacity-20 flex flex-col items-center gap-6">
                 <ShieldCheck size={64} strokeWidth={1} />
                 <div>
                    <p className="text-xl font-black uppercase tracking-[0.5em]">No Records Found</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Adjust search criteria or add new staff</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status Info */}
        <div className="mt-16 flex flex-col md:flex-row gap-8">
           <div className="flex-1 bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-[#9A3412]/10 rounded-[1.2rem] border border-[#9A3412]/20 flex items-center justify-center text-[#9A3412]">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">System Status: Active</h2>
                    <p className="text-stone-600 text-[9px] font-bold uppercase tracking-widest">Activity Log: Active</p>
                 </div>
              </div>
              <p className="text-[#D6D3D1] text-[10px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                All staff changes are recorded in the official database. Verification ensures secure access for student service management.
              </p>
           </div>
           
           <div className="flex-1 bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-blue-900/10 rounded-[1.2rem] border border-blue-900/20 flex items-center justify-center text-blue-500">
                    <Activity size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Staff Workload</h3>
                    <p className="text-stone-600 text-[9px] font-bold uppercase tracking-widest">Resource Allocation: Balanced</p>
                 </div>
              </div>
              <div className="flex gap-4 mt-2">
                 <div className="flex-1">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-stone-500 mb-2">
                       <span>Utilization</span>
                       <span className="text-[#FAFAF9]">78%</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800/50">
                       <div className="w-[78%] h-full bg-blue-500" />
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Staff Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1C1917] w-full max-w-lg rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9A3412] opacity-[0.05] blur-3xl" />
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Add Staff Member</h2>
                <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Add new staff details to database</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] transition-all hover:bg-stone-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                   <UserPlus size={10} /> Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Prof. Alan Turing"
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                   <Mail size={10} /> Official Email
                </label>
                <input 
                  type="email"
                  placeholder="turing.a@university.edu"
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                   <Building size={10} /> Academic Department
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newStaff.department}
                  onChange={e => setNewStaff({...newStaff, department: e.target.value})}
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                  required
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-stone-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-stone-400 transition-colors">Discard</button>
                <button type="submit" className="flex-1 bg-[#9A3412] hover:bg-[#C2410C] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-orange-950/40 transition flex items-center justify-center gap-3 active:scale-[0.98]">
                  <Plus size={18} />
                  Add Staff
                </button>
              </div>
            </form>
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
