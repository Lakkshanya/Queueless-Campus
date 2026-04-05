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
  MoreVertical,
  X,
  FileText
} from 'lucide-react';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    estimatedTimePerToken: 10, 
    prefix: '' 
  });

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', description: '', estimatedTimePerToken: 10, prefix: '' });
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setFormData({ 
      name: service.name, 
      description: service.description, 
      estimatedTimePerToken: service.estimatedTimePerToken,
      prefix: service.prefix || '' 
    });
    setIsModalOpen(true);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.prefix || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center font-sans">
      <div className="w-16 h-16 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-6" />
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.4em]">Initializing Core Services...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-6 py-10">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            <Database size={14} />
            Service Infrastructure
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none text-white">Registry</h1>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mt-4">Manage and allocate campus office services</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
            <input 
              type="text" 
              placeholder="FILTER SERVICES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1917] border border-stone-800 p-5 pl-14 rounded-3xl focus:border-orange-600 outline-none transition text-[10px] font-black uppercase tracking-widest text-white placeholder-stone-700 shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ name: '', description: '', estimatedTimePerToken: 10, prefix: '' }); }}
            className="bg-orange-600 hover:bg-orange-500 text-white p-5 px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-3 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Create Service
          </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Services', val: services.length, icon: <Activity size={16} />, color: 'text-emerald-500' },
          { label: 'Total Terminals', val: '12', icon: <Hash size={16} />, color: 'text-blue-500' },
          { label: 'Avg Wait Time', val: '15m', icon: <Clock size={16} />, color: 'text-orange-500' },
          { label: 'Cloud Status', val: 'Online', icon: <Zap size={16} />, color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1C1917] border border-stone-800/80 p-6 rounded-[2.5rem] flex items-center gap-5 shadow-sm group hover:border-stone-700 transition-colors">
            <div className={`w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-600 mb-1">{stat.label}</p>
              <p className="text-xl font-black text-white tracking-tighter uppercase">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1C1917] rounded-[3.5rem] border border-stone-800/60 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 opacity-[0.02] blur-3xl pointer-events-none" />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-800/50 bg-stone-900/30">
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Service Identifier</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Prefix</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600">Description</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600 text-center">Avg Time</th>
                <th className="p-8 text-[10px] uppercase font-black tracking-[0.4em] text-stone-600 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/20">
              {filteredServices.map(service => (
                <tr key={service._id} className="hover:bg-stone-900/40 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xl text-stone-600 group-hover:text-orange-600 group-hover:border-orange-600/30 transition-all">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-tighter text-lg">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[9px] text-stone-600 font-bold uppercase tracking-widest">Active State</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] shadow-inner">
                      {service.prefix || 'N/A'}
                    </span>
                  </td>
                  <td className="p-8">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-relaxed max-w-xs line-clamp-2 italic">
                      {service.description || 'No descriptive technical logs available...'}
                    </p>
                  </td>
                  <td className="p-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full border border-stone-800">
                      <Clock size={12} className="text-orange-600" />
                      <span className="text-xs font-black text-white">{service.estimatedTimePerToken}m</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(service)}
                        className="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 hover:text-white hover:border-stone-600 transition-all active:scale-90"
                        title="Modify Config"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(service._id)}
                        className="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600 hover:text-red-500 hover:border-red-900/30 transition-all active:scale-90"
                        title="Purge Service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredServices.length === 0 && (
            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
               <Database size={64} strokeWidth={1} />
               <div>
                  <p className="text-xl font-black uppercase tracking-[0.5em]">No Matching Records</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2">The system registry returned 0 results for your query.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Create/Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1C1917] w-full max-w-xl rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.05] blur-3xl" />
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
                  {editingId ? 'Modify Record' : 'Registry Entry'}
                </h2>
                <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-2 italic">Fill in technical specifications</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-14 h-14 rounded-[1.5rem] bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white transition-all hover:bg-stone-800"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                     <Zap size={10} className="text-orange-600" /> Service Name
                  </label>
                  <input 
                    type="text"
                    value={formData.name}
                    placeholder="e.g. FINANCE HUB"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.8rem] p-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-4 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                     <Hash size={10} className="text-orange-600" /> Token Prefix
                  </label>
                  <input 
                    type="text"
                    value={formData.prefix}
                    placeholder="e.g. FIN"
                    onChange={e => setFormData({...formData, prefix: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 rounded-[1.8rem] p-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition placeholder-stone-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                   <Clock size={10} className="text-orange-600" /> Latency Estimate (Minutes)
                </label>
                <div className="flex items-center gap-6">
                   <input 
                    type="range"
                    min="1"
                    max="60"
                    value={formData.estimatedTimePerToken}
                    onChange={e => setFormData({...formData, estimatedTimePerToken: e.target.value})}
                    className="flex-1 accent-orange-600 h-1 bg-stone-800 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="w-16 h-12 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-center font-black text-xs text-orange-600">
                    {formData.estimatedTimePerToken}m
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
                   <Edit size={10} className="text-orange-600" /> Description & Scope
                </label>
                <textarea 
                  value={formData.description}
                  placeholder="Describe the operational scope of this service branch..."
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-stone-900 border border-stone-800 rounded-[2.5rem] p-8 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-600 transition h-40 placeholder-stone-800 resize-none shadow-inner leading-relaxed"
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-950/40 transition flex items-center justify-center gap-4 active:scale-95">
                  <ShieldCheck size={20} />
                  {editingId ? 'Update Registry' : 'Finalize Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
