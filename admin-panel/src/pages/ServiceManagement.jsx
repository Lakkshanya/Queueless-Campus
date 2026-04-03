import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Database, 
  Clock, 
  Zap, 
  ArrowLeft, 
  Activity,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Hash,
  RefreshCw
} from 'lucide-react';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', estimatedTimePerToken: 10, prefix: '' });

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
      alert(error.response?.data?.message || 'Service update failed. Request rejected by the system.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this service will terminate all associated token chains. Proceed with deletion?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Deletion sequence terminated by system security.');
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

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Services...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <Database size={14} />
                Campus Services
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Service Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={fetchServices}
              className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
              title="Manual Re-sync"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ name: '', description: '', estimatedTimePerToken: 10, prefix: '' }); }}
              className="bg-[#9A3412] hover:bg-[#C2410C] text-white p-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-3 whitespace-nowrap active:scale-[0.98]"
            >
              <Plus size={18} />
              Add New Service
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service._id} className="group bg-[#1C1917] rounded-[3rem] p-10 border border-stone-800/50 hover:border-[#9A3412]/30 transition-all shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl tracking-tighter transition-all ${
                    service.status === 'active' ? 'bg-[#9A3412]/10 text-[#9A3412] border border-[#9A3412]/20' : 'bg-stone-900 text-stone-600 border border-stone-800'
                }`}>
                  {service.prefix || service.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                   <button onClick={() => openEdit(service)} className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-stone-600 hover:text-[#FAFAF9] hover:border-stone-700 transition-all"><Edit size={16} /></button>
                   <button onClick={() => handleDelete(service._id)} className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-stone-600 hover:text-red-500 hover:border-red-900/30 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-2xl font-black text-[#FAFAF9] mb-4 uppercase tracking-tighter group-hover:text-[#9A3412] transition-colors">{service.name}</h3>
                <p className="text-[#D6D3D1] text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60 mb-10 line-clamp-2">{service.description}</p>
              </div>

              <div className="bg-[#1F1D1B] p-6 rounded-[2rem] border border-stone-800/30 flex justify-between items-center relative z-10 group-hover:border-[#9A3412]/20 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center text-stone-500">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-stone-700 tracking-[0.3em] mb-3">Estimated Time</p>
                      <p className="text-xs font-black text-[#FAFAF9] uppercase">{service.estimatedTimePerToken}m</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-stone-600 mb-1">
                      <Activity size={12} />
                      <p className="text-[9px] uppercase font-black tracking-widest">Status</p>
                    </div>
                    <p className="text-xs font-black text-[#9A3412]">Active</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Status Banner */}
        <div className="mt-16 bg-[#1C1917] p-12 rounded-[3.5rem] border border-stone-800/50 flex items-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-3xl" />
           <div className="w-20 h-20 bg-[#9A3412]/10 rounded-[2rem] border border-[#9A3412]/20 flex items-center justify-center text-[#9A3412]">
              <ShieldCheck size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">System Status: Online</h2>
              <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 leading-relaxed">
                Services are synchronized with the campus database. Queue management is active for all departments.
              </p>
           </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-[#1C1917] w-full max-w-lg rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#9A3412] opacity-[0.05] blur-3xl" />
              
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {editingId ? 'Edit Service' : 'New Service'}
                  </h2>
                  <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Enter service details</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] transition-all hover:bg-stone-800"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                       <Zap size={10} /> Service Name
                    </label>
                    <input 
                      type="text"
                      value={formData.name}
                      placeholder="e.g. Finance Office"
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                       <Hash size={10} /> Token Prefix
                    </label>
                    <input 
                      type="text"
                      value={formData.prefix}
                      placeholder="e.g. FIN"
                      onChange={e => setFormData({...formData, prefix: e.target.value})}
                      className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <Clock size={10} /> Est. Time (minutes)
                  </label>
                  <input 
                    type="number"
                    value={formData.estimatedTimePerToken}
                    onChange={e => setFormData({...formData, estimatedTimePerToken: e.target.value})}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <Edit size={10} /> Service Description
                  </label>
                  <textarea 
                    value={formData.description}
                    placeholder="Enter a brief description of the service..."
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition h-32 placeholder-stone-800 resize-none"
                  />
                </div>

                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-stone-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-stone-400 transition-colors">Discard</button>
                  <button type="submit" className="flex-1 bg-[#9A3412] hover:bg-[#C2410C] rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-orange-950/40 transition flex items-center justify-center gap-3 active:scale-[0.98]">
                    <ShieldCheck size={18} />
                    {editingId ? 'Save Changes' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

export default ServiceManagement;
