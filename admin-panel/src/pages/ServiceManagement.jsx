import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Database, 
  Clock, 
  Zap, 
  Activity,
  ShieldCheck,
  Hash,
  RefreshCw,
  Search,
  X,
  FileText,
  Layers,
  ChevronRight,
  User,
  Settings
} from 'lucide-react';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    estimatedTimePerToken: 10, 
    estimatedTimePerStudent: 5,
    maxTokens: 50,
    prefix: '',
    assignedCounter: ''
  });

  const fetchData = async () => {
    try {
      const [serviceRes, counterRes] = await Promise.all([
        api.get('/services'),
        api.get('/counters')
      ]);
      setServices(serviceRes.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData);
      } else {
        await api.post('/services/create', formData);
        // Requirement: redirect to notifications only if counter is assigned
        if (formData.assignedCounter) {
          navigate('/admin/notifications');
          return;
        }
      }
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', description: '', estimatedTimePerToken: 10, 
      estimatedTimePerStudent: 5, maxTokens: 50, prefix: '', assignedCounter: '' 
    });
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setFormData({
      name: service.name,
      description: service.description || '',
      estimatedTimePerToken: service.estimatedTimePerToken || 10,
      estimatedTimePerStudent: service.estimatedTimePerStudent || 5,
      maxTokens: service.maxTokens || 50,
      prefix: service.prefix || '',
      assignedCounter: service.assignedCounter?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirm permanent deletion of this service?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete service');
      }
    }
  };

  const availableCounters = counters.filter(c => {
    const isAssignedToOther = services.some(s => 
      s.assignedCounter?._id === c._id && s._id !== editingId
    );
    return !isAssignedToOther;
  });

  const filteredServices = services.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.prefix || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Services...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-orange-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10">
            <Settings size={12} strokeWidth={3} />
            Service Management Engine
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">Global Services</h1>
          <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-6 max-w-xl leading-relaxed">
            Configure departmental service parameters, token prefixes, and operational throughput for the campus network.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none transform transition-all focus-within:scale-105">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-700" size={16} />
            <input 
              type="text" 
              placeholder="FILTER SERVICES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-72 bg-[#171412] border border-stone-800/60 p-5 pl-14 rounded-2xl outline-none text-[10px] font-black tracking-[0.2em] text-white placeholder-stone-800 focus:border-orange-600/40 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setEditingId(null); resetForm(); }}
            className="bg-orange-600 hover:bg-orange-500 text-white p-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] flex items-center gap-4 active:scale-95 group"
          >
            <Plus size={18} strokeWidth={3} />
            Deploy Service
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredServices.map(service => (
          <div key={service._id} className="group relative bg-[#171412] border border-stone-800/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-orange-600/30 hover:translate-y-[-8px] shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/[0.03] blur-[50px] group-hover:bg-orange-600/[0.08] transition-all duration-700" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600 shadow-inner overflow-hidden">
                <Database size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEdit(service)}
                  className="p-3 rounded-xl bg-stone-900/50 text-stone-600 hover:text-white hover:bg-orange-600 transition-all active:scale-90"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(service._id)}
                  className="p-3 rounded-xl bg-stone-900/50 text-stone-600 hover:text-white hover:bg-red-600 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-orange-500 transition-colors duration-500">{service.name}</h3>
                <span className="px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-lg text-[10px] font-black text-orange-600 uppercase tracking-widest">{service.prefix}</span>
              </div>
              <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest line-clamp-2 leading-relaxed h-10 italic">
                {service.description || 'No operational description provided for this campus service node.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-stone-900/40 border border-stone-800/40 p-5 rounded-3xl group-hover:border-orange-600/20 transition-colors">
                <p className="text-[8px] font-black text-stone-700 uppercase tracking-widest mb-2">Network Node</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${service.assignedCounter ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest truncate">
                    {service.counterAssigned || 'UNASSIGNED'}
                  </span>
                </div>
              </div>
              <div className="bg-stone-900/40 border border-stone-800/40 p-5 rounded-3xl group-hover:border-orange-600/20 transition-colors">
                <p className="text-[8px] font-black text-stone-700 uppercase tracking-widest mb-2">Staff Assigned</p>
                <div className="flex items-center gap-2 max-w-full">
                  <User size={10} className="text-orange-600" />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest truncate">
                     {service.staffAssigned || 'NONE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-800/40 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                     <span className="text-[14px] font-black text-white leading-none">{service.maxTokens || 0}</span>
                     <span className="text-[8px] font-bold text-stone-700 uppercase tracking-[0.2em] mt-1">Token Limit</span>
                  </div>
                  <div className="w-[1px] h-6 bg-stone-800" />
                  <div className="flex flex-col">
                     <span className="text-[14px] font-black text-orange-600 leading-none">{service.estimatedTimePerStudent || 5}M</span>
                     <span className="text-[8px] font-bold text-stone-700 uppercase tracking-[0.2em] mt-1">Processing</span>
                  </div>
               </div>
               <div className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl">
                  <Activity size={12} className="text-orange-600" />
                  <span className="text-[10px] font-black text-white uppercase">{service.queueCount || 0} ACTIVE</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in">
          <div className="bg-[#171412] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative p-12 custom-scrollbar">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white hover:bg-red-600 transition-all duration-300"
            >
              <X size={20} />
            </button>

            <div className="mb-12">
              <div className="text-orange-600 text-[9px] font-black uppercase tracking-[0.5em] mb-4">Service Configuration Modal</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                {editingId ? 'Modify Service Node' : 'Initialize Service'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2">Service Identity</label>
                  <input 
                    type="text" value={formData.name} placeholder="e.g. Finance Cell"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black text-white focus:border-orange-600 transition shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2">Filing Prefix</label>
                  <input 
                    type="text" value={formData.prefix} placeholder="e.g. FIN"
                    onChange={e => setFormData({...formData, prefix: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black text-white focus:border-orange-600 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2">Network Counter Allocation</label>
                  <select 
                    value={formData.assignedCounter}
                    onChange={e => setFormData({...formData, assignedCounter: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black text-white focus:border-orange-600 transition appearance-none shadow-inner"
                  >
                    <option value="">STANDALONE (NO COUNTER)</option>
                    {availableCounters.sort((a,b) => a.number - b.number).map(c => (
                      <option key={c._id} value={c._id}>
                        UNIT-{c.number.toString().padStart(2, '0')} ({c.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2">Max Daily Capacity</label>
                  <input 
                    type="number" value={formData.maxTokens}
                    onChange={e => setFormData({...formData, maxTokens: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black text-white focus:border-orange-600 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 text-center">Throughput: {formData.estimatedTimePerStudent} MIN/STUDENT</label>
                  <input 
                    type="range" min="1" max="30" value={formData.estimatedTimePerStudent}
                    onChange={e => setFormData({...formData, estimatedTimePerStudent: e.target.value})}
                    className="w-full h-1.5 bg-stone-800 rounded-full appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
                <div className="space-y-6">
                  <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 text-center">Batch Avg: {formData.estimatedTimePerToken} MIN/BATCH</label>
                  <input 
                    type="range" min="1" max="60" value={formData.estimatedTimePerToken}
                    onChange={e => setFormData({...formData, estimatedTimePerToken: e.target.value})}
                    className="w-full h-1.5 bg-stone-800 rounded-full appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[9px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2">Operational Context</label>
                <textarea 
                  value={formData.description} placeholder="Define service parameters and operational scope..."
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-[11px] font-black text-white focus:border-orange-600 transition h-32 resize-none shadow-inner leading-relaxed"
                />
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] text-white shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95">
                <ShieldCheck size={20} strokeWidth={2.5} />
                {editingId ? 'COMMIT SYSTEM UPDATE' : 'DEPLOY SERVICE BROADCAST'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
