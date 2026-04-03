import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { 
  Layers, 
  UserPlus, 
  Power, 
  Pause, 
  ArrowLeft, 
  Search, 
  PlusCircle, 
  Activity, 
  ShieldCheck,
  X,
  User,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Save,
  Check,
  RefreshCw
} from 'lucide-react';

const CounterManagement = () => {
  const { user } = useAuth();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  
  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedCounterId, setSelectedCounterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Counter Form
  const [newCounter, setNewCounter] = useState({
    number: '',
    selectedServices: []
  });

  const fetchCounters = async () => {
    try {
      const response = await api.get('/counters');
      setCounters(response.data);
    } catch (error) {
      console.error('Error fetching counters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [staffRes, serviceRes] = await Promise.all([
        api.get('/auth/staff'),
        api.get('/services')
      ]);
      setStaffList(staffRes.data);
      setServices(serviceRes.data);
    } catch (error) {
      console.error('Error fetching management data:', error);
    }
  };

  useEffect(() => {
    fetchCounters();
    fetchData();
  }, []);

  const handleCreateCounter = async () => {
    if (!newCounter.number) return alert('Counter Number is required.');
    try {
      await api.post('/counters', {
        number: parseInt(newCounter.number),
        services: newCounter.selectedServices
      });
      setIsCreateModalOpen(false);
      setNewCounter({ number: '', selectedServices: [] });
      fetchCounters();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to initialize terminal.');
    }
  };

  const handleAssignStaff = async (staffId) => {
    try {
      await api.post('/counters/assign-staff', {
        counterId: selectedCounterId,
        staffId
      });
      setIsAssignModalOpen(false);
      fetchCounters();
    } catch (error) {
      alert(error.response?.data?.message || 'Assignment rejected.');
    }
  };

  const handleToggle = async (counterId, currentStatus) => {
    try {
      let newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await api.post('/counters/toggle-status', { counterId, status: newStatus });
      fetchCounters();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const toggleService = (id) => {
    setNewCounter(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter(s => s !== id)
        : [...prev.selectedServices, id]
    }));
  };

  const filteredCounters = counters.filter(c => 
    c.number?.toString().includes(searchQuery) || 
    (c.staff?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-stone-600 font-black tracking-widest animate-pulse uppercase">Polling Registry...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <header className="flex justify-between items-end mb-16">
        <div>
           <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
              <Layers size={14} /> Network Infrastructure
           </div>
           <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Counter Management</h1>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={fetchCounters}
              className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
              title="Manual Re-sync"
            >
              <RefreshCw size={18} />
            </button>
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
              <input 
                type="text" 
                placeholder="Search Nodes..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 pl-12 text-xs font-bold text-white outline-none focus:border-[#9A3412] w-64"
              />
           </div>
           <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-4 px-8 bg-[#9A3412] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#C2410C] transition-all flex items-center gap-3"
           >
              <PlusCircle size={18} /> New Terminal
           </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {filteredCounters.map(counter => (
          <div key={counter._id} className="bg-[#1C1917] rounded-[2.5rem] p-10 border border-stone-800/50 hover:border-[#9A3412]/40 transition-all flex flex-col relative group">
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-3xl flex items-center justify-center text-[#FAFAF9] text-3xl font-black">{counter.number}</div>
                <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${counter.status === 'active' ? 'bg-green-950/20 text-green-500 border-green-900/30' : 'bg-red-950/20 text-red-500 border-red-900/30'}`}>
                   {counter.status}
                </div>
             </div>

             <div className="space-y-6 mb-12 flex-1">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-stone-600 mb-2">Human Operator</p>
                   <p className="text-sm font-black text-white uppercase">{counter.staff?.name || 'Inert Terminal'}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-stone-600 mb-2">Assigned Services</p>
                   <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
                      {counter.services?.map(s => s.name).join(', ') || 'General Ops'}
                   </p>
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-stone-600 mb-2">Current Workload</p>
                   <p className="text-xs font-black text-[#9A3412] uppercase">{counter.workload || 0} Entities Enqueued</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                  onClick={() => { setSelectedCounterId(counter._id); setIsAssignModalOpen(true); }}
                  className="flex-1 bg-stone-900 py-4 rounded-2xl text-[10px] font-black uppercase text-white border border-stone-800 hover:border-[#9A3412] transition-all"
                >
                  Deploy
                </button>
                <button 
                  onClick={() => handleToggle(counter._id, counter.status)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${counter.status === 'active' ? 'bg-red-950/10 text-red-500 border-red-900/20' : 'bg-green-950/10 text-green-500 border-green-900/20'}`}
                >
                  {counter.status === 'active' ? 'Pause' : 'Online'}
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-[#1C1917] w-full max-w-lg rounded-[3rem] p-12 border border-stone-800 shadow-2xl relative overflow-hidden">
              <header className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize Terminal</h2>
                    <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Register new node in the network</p>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-3 bg-stone-900 rounded-full text-stone-500 hover:text-white"><X size={20} /></button>
              </header>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2">Terminal Number</label>
                    <input 
                      type="number" 
                      value={newCounter.number}
                      onChange={e => setNewCounter({...newCounter, number: e.target.value})}
                      className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#9A3412]" 
                      placeholder="e.g. 05"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2 block">Assigned Service Disciplines</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                       {services.map(s => (
                         <button 
                          key={s._id}
                          onClick={() => toggleService(s._id)}
                          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${newCounter.selectedServices.includes(s._id) ? 'bg-[#9A3412]/10 border-[#9A3412] text-[#9A3412]' : 'bg-stone-900 border-stone-800 text-stone-600'}`}
                         >
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                            {newCounter.selectedServices.includes(s._id) && <Check size={12} />}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button 
                  onClick={handleCreateCounter}
                  className="w-full bg-[#9A3412] text-white p-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-[#C2410C] transition-all flex items-center justify-center gap-3"
                 >
                    <Save size={18} /> Sync Registry
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ASSIGN MODAL (Existing logic maintained) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#1C1917] w-full max-w-lg rounded-[3rem] p-12 border border-stone-800">
              <header className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Personnel Sync</h2>
                    <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Deploy human operator to terminal</p>
                 </div>
                 <button onClick={() => setIsAssignModalOpen(false)} className="p-3 bg-stone-900 rounded-full text-stone-500 hover:text-white"><X size={20} /></button>
              </header>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {staffList.map(staff => (
                    <button key={staff._id} onClick={() => handleAssignStaff(staff._id)} className="w-full bg-stone-900/50 hover:bg-stone-900 border border-stone-800 p-6 rounded-3xl flex justify-between items-center transition-all">
                       <div className="text-left">
                          <p className="text-xs font-black text-white uppercase">{staff.name}</p>
                          <p className="text-[9px] text-stone-600 font-bold">{staff.email}</p>
                       </div>
                       <ChevronRight size={18} className="text-stone-800" />
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CounterManagement;
