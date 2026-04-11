import React, { useState, useEffect, useRef } from 'react';
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
  Settings2,
  Briefcase,
  Tag,
  ChevronRight,
  Phone,
  IdCard,
  Clock
} from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', department: '', role: 'staff' });
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Hover tooltip state
  const [hoveredStaff, setHoveredStaff] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null);

  const fetchData = async () => {
    try {
      const [staffRes, counterRes, serviceRes] = await Promise.all([
        api.get('/auth/staff'),
        api.get('/counters'),
        api.get('/services')
      ]);
      setStaff(staffRes.data);
      setCounters(counterRes.data);
      setServices(serviceRes.data);
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
      setModalSearchQuery('');
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

  const openServiceModal = (staffMember) => {
    setSelectedStaff(staffMember);
    const currentIds = (staffMember.assignedServices || []).map(s => 
      typeof s === 'object' ? s._id : s
    );
    setSelectedServiceIds(currentIds);
    setIsServiceModalOpen(true);
  };

  const toggleServiceSelection = (serviceId) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleAssignServices = async () => {
    if (!selectedStaff) return;
    try {
      await api.post('/auth/assign-services', {
        staffId: selectedStaff._id,
        serviceIds: selectedServiceIds
      });
      setIsServiceModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Service assignment failed');
    }
  };

  // Hover handlers for staff detail tooltip
  const handleMouseEnter = (staffMember, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredStaff(staffMember);
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredStaff(null);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter for the "existing staff" search inside modal
  const modalFilteredStaff = staff.filter(s => 
    modalSearchQuery && (
      s.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(modalSearchQuery.toLowerCase())
    )
  );

  // Color palette for service badges
  const serviceColors = [
    { bg: 'bg-orange-600/15', border: 'border-orange-600/30', text: 'text-orange-500' },
    { bg: 'bg-emerald-600/15', border: 'border-emerald-600/30', text: 'text-emerald-500' },
    { bg: 'bg-blue-600/15', border: 'border-blue-600/30', text: 'text-blue-400' },
    { bg: 'bg-purple-600/15', border: 'border-purple-600/30', text: 'text-purple-400' },
    { bg: 'bg-amber-600/15', border: 'border-amber-600/30', text: 'text-amber-500' },
    { bg: 'bg-cyan-600/15', border: 'border-cyan-600/30', text: 'text-cyan-400' },
    { bg: 'bg-rose-600/15', border: 'border-rose-600/30', text: 'text-rose-400' },
    { bg: 'bg-lime-600/15', border: 'border-lime-600/30', text: 'text-lime-400' },
  ];

  const getServiceColor = (index) => serviceColors[index % serviceColors.length];

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
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mt-4">Administrative access, counter & service management</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH STAFF..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1917] border border-stone-800 p-5 pl-14 rounded-3xl focus:border-orange-600 outline-none transition text-xs font-medium text-white placeholder-stone-700 shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setModalSearchQuery(''); }}
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
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Assigned Services</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Terminal</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Status</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/20">
              {filteredStaff.map(s => (
                <tr 
                  key={s._id} 
                  className="hover:bg-stone-900/40 transition-all group relative"
                  onMouseEnter={(e) => handleMouseEnter(s, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xl text-stone-600 group-hover:text-orange-600 group-hover:border-orange-600/30 transition-all">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tighter text-lg">{s.name}</p>
                        <p className="text-[10px] text-stone-600 font-bold lowercase tracking-wider mt-1 flex items-center gap-2">
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
                  {/* Assigned Services Column */}
                  <td className="p-8">
                    <div className="flex flex-col gap-2">
                      {s.assignedServices && s.assignedServices.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-[280px]">
                          {s.assignedServices.map((svc, idx) => {
                            const color = getServiceColor(
                              services.findIndex(sv => sv._id === (typeof svc === 'object' ? svc._id : svc))
                            );
                            return (
                              <span
                                key={typeof svc === 'object' ? svc._id : svc}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.border} ${color.text}`}
                              >
                                <Tag size={9} />
                                {typeof svc === 'object' ? svc.name : 'Service'}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-700 font-bold uppercase tracking-widest italic">No services assigned</span>
                      )}
                      <button
                        onClick={() => openServiceModal(s)}
                        className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-600 hover:text-orange-500 transition-colors mt-1 group/svc"
                      >
                        <Briefcase size={11} className="group-hover/svc:text-orange-500" />
                        Manage Services
                        <ChevronRight size={10} className="group-hover/svc:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </td>
                  <td className="p-8">
                     <button 
                       onClick={() => { setSelectedStaff(s); setIsCounterModalOpen(true); }}
                       className="group/btn flex items-center gap-3 px-5 py-3 bg-stone-900/50 hover:bg-stone-900 border border-stone-800 rounded-2xl transition-all"
                     >
                        <Monitor size={14} className="text-orange-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                           {s.assignedCounter ? `TERM #${typeof s.assignedCounter === 'object' ? s.assignedCounter.number : s.assignedCounter}` : 'UNASSIGNED'}
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

      {/* Hover Tooltip - Staff Detail Card */}
      {hoveredStaff && (
        <div 
          className="fixed z-[200] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: Math.min(tooltipPos.x - 180, window.innerWidth - 380), 
            top: tooltipPos.y - 260,
            maxWidth: '360px'
          }}
        >
          <div className="bg-[#1C1917] border border-stone-700 rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-600 font-black text-2xl">
                {hoveredStaff.name.charAt(0)}
              </div>
              <div>
                <p className="font-black text-white text-lg uppercase tracking-tighter">{hoveredStaff.name}</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border mt-1 text-[8px] font-black uppercase tracking-widest ${hoveredStaff.isVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  <div className={`w-1 h-1 rounded-full ${hoveredStaff.isVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {hoveredStaff.isVerified ? 'VERIFIED' : 'PENDING'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/40">
                <Mail size={12} className="text-orange-600 flex-shrink-0" />
                <span className="text-[10px] font-bold text-stone-300 lowercase tracking-wider truncate">{hoveredStaff.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/40">
                <Building size={12} className="text-orange-600 flex-shrink-0" />
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">{hoveredStaff.department || 'Central Admin'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/40">
                <Monitor size={12} className="text-orange-600 flex-shrink-0" />
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                  {hoveredStaff.assignedCounter 
                    ? `Terminal #${typeof hoveredStaff.assignedCounter === 'object' ? hoveredStaff.assignedCounter.number : hoveredStaff.assignedCounter}` 
                    : 'No Terminal Assigned'}
                </span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/40">
                <Briefcase size={12} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {hoveredStaff.assignedServices && hoveredStaff.assignedServices.length > 0 ? (
                    hoveredStaff.assignedServices.map((svc) => (
                      <span key={typeof svc === 'object' ? svc._id : svc} className="px-2 py-0.5 bg-orange-600/10 border border-orange-600/20 rounded-md text-[8px] font-black text-orange-500 uppercase tracking-widest">
                        {typeof svc === 'object' ? svc.name : 'Service'}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider italic">No Services</span>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1C1917] border-b border-r border-stone-700 rotate-45" />
          </div>
        </div>
      )}

      {/* Stats Quick View */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
                     <span className="text-white">{staff.length > 0 ? Math.round((staff.filter(s => s.assignedServices?.length > 0).length / staff.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800 shadow-inner">
                     <div className="h-full bg-orange-600 transition-all duration-700" style={{ width: `${staff.length > 0 ? Math.round((staff.filter(s => s.assignedServices?.length > 0).length / staff.length) * 100) : 0}%` }} />
                  </div>
               </div>
               <p className="text-[10px] text-stone-500 font-medium leading-relaxed uppercase tracking-widest italic opacity-60">
                 Personnel with active service assignments are currently operating within parameters.
               </p>
            </div>
         </div>

         {/* Service Coverage Summary */}
         <div className="bg-[#1C1917] p-10 rounded-[3.5rem] border border-stone-800/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 opacity-[0.02] blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-emerald-600/10 rounded-[1.5rem] border border-emerald-600/20 flex items-center justify-center text-emerald-500">
                  <Briefcase size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Services</h2>
                  <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest">Staff Coverage Map</p>
               </div>
            </div>
            <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
               {services.map((svc, idx) => {
                 const assignedCount = staff.filter(s => 
                   s.assignedServices?.some(as => (typeof as === 'object' ? as._id : as) === svc._id)
                 ).length;
                 const color = getServiceColor(idx);
                 return (
                   <div key={svc._id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.border} ${color.text}`}>
                         <Tag size={8} />
                         {svc.prefix || '—'}
                       </span>
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">{svc.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">
                       {assignedCount} <span className="text-stone-600">staff</span>
                     </span>
                   </div>
                 );
               })}
               {services.length === 0 && (
                 <p className="text-[10px] text-stone-700 font-bold uppercase tracking-widest italic text-center py-4">No services registered yet</p>
               )}
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

      {/* Staff Registration Modal (with Search) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1C1917] w-full max-w-xl rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.05] blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8">
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

            {/* Search inside Add Staff modal */}
            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH EXISTING STAFF..." 
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 p-5 pl-14 rounded-[1.5rem] focus:border-orange-600 outline-none transition text-xs font-medium text-white placeholder-stone-800 shadow-inner"
              />
            </div>

            {/* Search Results - Show existing staff matches */}
            {modalSearchQuery && (
              <div className="mb-8">
                <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-3 ml-2">
                  {modalFilteredStaff.length > 0 ? `${modalFilteredStaff.length} existing staff found` : 'No existing staff matched'}
                </p>
                {modalFilteredStaff.length > 0 && (
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {modalFilteredStaff.map(s => (
                      <div key={s._id} className="flex items-center gap-4 p-4 bg-stone-900/50 border border-stone-800/50 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 font-black text-sm">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate">{s.name}</p>
                          <p className="text-[9px] text-stone-600 font-bold lowercase tracking-wider truncate">{s.email}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${s.isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                          {s.isVerified ? 'VERIFIED' : 'PENDING'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="h-px bg-stone-800 my-6" />
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest ml-2 mb-4">Or register new staff below</p>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4">Legal Name</label>
                  <input 
                    type="text"
                    placeholder="E.G. ALBERT E."
                    value={newStaff.name}
                    onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-medium text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4">Academic Email</label>
                  <input 
                    type="email"
                    placeholder="relativity@uni.edu"
                    value={newStaff.email}
                    onChange={e => setNewStaff({...newStaff, email: e.target.value.toLowerCase()})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-medium text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
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
                  className="w-full bg-stone-900 border border-stone-800 rounded-[1.5rem] p-5 text-xs font-medium text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
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

      {/* Counter Assignment Modal */}
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

      {/* Service Assignment Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in zoom-in-95 duration-300">
          <div className="bg-[#1C1917] w-full max-w-lg rounded-[3.5rem] p-10 border border-stone-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 via-emerald-500 to-blue-500" />
            
            <div className="flex justify-between items-center mb-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-600/10 rounded-[1.5rem] border border-orange-600/20 flex items-center justify-center text-orange-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Services</h2>
                  <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest">Assignment Panel</p>
                </div>
              </div>
              <button onClick={() => setIsServiceModalOpen(false)} className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-6 mb-8 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                Assign services to <span className="text-white italic">{selectedStaff?.name}</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-stone-700 mt-1">
                Select the services this staff member will handle
              </p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-2 mb-8">
              {services.map((svc, idx) => {
                const isSelected = selectedServiceIds.includes(svc._id);
                const color = getServiceColor(idx);
                return (
                  <button
                    key={svc._id}
                    onClick={() => toggleServiceSelection(svc._id)}
                    className={`w-full p-5 rounded-[1.8rem] border transition-all flex items-center gap-5 group/item active:scale-[0.98] ${
                      isSelected
                        ? 'bg-orange-600/10 border-orange-600/40'
                        : 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-600'
                    }`}>
                      {isSelected ? <CheckCircle2 size={20} /> : <Tag size={18} />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <p className={`font-black uppercase tracking-tighter text-base transition-colors ${
                          isSelected ? 'text-orange-500' : 'text-white'
                        }`}>
                          {svc.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${color.bg} ${color.border} ${color.text}`}>
                          {svc.prefix || '—'}
                        </span>
                      </div>
                      <p className="text-[9px] text-stone-600 font-bold uppercase tracking-widest mt-1 line-clamp-1">
                        {svc.description || 'No description available'}
                      </p>
                    </div>
                  </button>
                );
              })}

              {services.length === 0 && (
                <div className="py-16 text-center opacity-30 flex flex-col items-center gap-4">
                  <Briefcase size={40} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No services registered</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Create services in the Service Management panel first.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                <span className="text-orange-500">{selectedServiceIds.length}</span> of {services.length} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedServiceIds(services.map(s => s._id))}
                  className="text-[9px] font-black uppercase tracking-widest text-stone-600 hover:text-white transition-colors px-3 py-1"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedServiceIds([])}
                  className="text-[9px] font-black uppercase tracking-widest text-stone-600 hover:text-red-500 transition-colors px-3 py-1"
                >
                  Clear
                </button>
              </div>
            </div>

            <button 
              onClick={handleAssignServices}
              className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-950/40 transition flex items-center justify-center gap-4 active:scale-95"
            >
              <CheckCircle2 size={20} />
              Confirm Assignment
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
