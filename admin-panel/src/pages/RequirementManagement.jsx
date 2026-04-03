import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Loader2,
  X,
  ShieldCheck,
  Database,
  Zap,
  ArrowLeft,
  Info,
  Layers,
  Settings,
  Clock,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const RequirementManagement = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    isRequired: true,
    scope: 'global',
    targetDepartment: '',
    targetSection: '',
    targetYear: '',
    deadline: ''
  });

  const fetchRequirements = async () => {
    try {
      const res = await api.get('/requirements');
      setRequirements(res.data);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchSections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/requirements/${editingId}`, formData);
      } else {
        await api.post('/requirements', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ 
        title: '', 
        description: '', 
        type: '', 
        isRequired: true,
        scope: 'global',
        targetDepartment: '',
        targetSection: '',
        targetYear: '',
        deadline: ''
      });
      fetchRequirements();
    } catch (error) {
      alert('Failed to update requirement. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this requirement will invalidate existing student submissions. Proceed?')) return;
    try {
      await api.delete(`/requirements/${id}`);
      fetchRequirements();
    } catch (error) {
      alert('Deletion failed. Please try again later.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Loading Requirements...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <ShieldCheck size={14} />
                Student Requirements
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Requirement Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={fetchRequirements}
              className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
              title="Manual Re-sync"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-[#9A3412] hover:bg-[#C2410C] text-white p-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-3 whitespace-nowrap active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Requirement
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {requirements.map((req) => (
            <div 
              key={req._id}
              className="group bg-[#1C1917] rounded-[3rem] p-10 border border-stone-800/50 hover:border-[#9A3412]/30 transition-all shadow-xl relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-3xl flex items-center justify-center text-[#9A3412] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <FileText size={28} />
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => {
                        setEditingId(req._id);
                        setFormData({
                          title: req.title,
                          description: req.description,
                          type: req.type,
                          isRequired: req.isRequired,
                          scope: req.scope || 'global',
                          targetDepartment: req.targetDepartment || '',
                          targetSection: req.targetSection?._id || req.targetSection || '',
                          targetYear: req.targetYear || '',
                          deadline: req.deadline ? req.deadline.split('T')[0] : ''
                        });
                        setShowModal(true);
                      }}
                    className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-stone-600 hover:text-[#FAFAF9] hover:border-stone-700 transition-all"
                   >
                     <Edit3 size={16} />
                   </button>
                   <button 
                    onClick={() => handleDelete(req._id)}
                    className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-stone-600 hover:text-red-500 hover:border-red-900/30 transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-3xl font-black text-[#FAFAF9] mb-4 uppercase tracking-tighter group-hover:text-[#9A3412] transition-colors">{req.title}</h3>
                <p className="text-[#D6D3D1] text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60 mb-10 line-clamp-2">{req.description || 'No description provided.'}</p>
              </div>

              <div className="bg-[#1F1D1B] p-6 rounded-[2rem] border border-stone-800/30 flex justify-between items-center relative z-10 group-hover:border-[#9A3412]/20 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center text-stone-600">
                      <Layers size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-stone-600 tracking-widest mb-1">Requirement Type</p>
                      <p className="text-xs font-black text-[#FAFAF9] uppercase">{req.type}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    {req.isRequired ? (
                      <div className="flex items-center gap-2 justify-end text-orange-500">
                        <AlertCircle size={14} />
                        <p className="text-[9px] uppercase font-black tracking-widest">Mandatory</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end text-stone-600">
                        <Info size={14} />
                        <p className="text-[9px] uppercase font-black tracking-widest">Optional</p>
                      </div>
                    )}
                 </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-stone-800/20 flex flex-wrap gap-2 relative z-10">
                <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${req.scope === 'targeted' ? 'bg-[#9A3412]/10 border-[#9A3412]/30 text-[#9A3412]' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                   {req.scope === 'targeted' ? 'Targeted' : 'Global'}
                </div>
                {req.scope === 'targeted' && (
                  <>
                    {req.targetDepartment && <div className="px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-500 text-[8px] font-black uppercase tracking-widest">{req.targetDepartment}</div>}
                    {req.targetYear && <div className="px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-500 text-[8px] font-black uppercase tracking-widest">{req.targetYear}</div>}
                    {req.deadline && (
                      <div className="px-3 py-1 rounded-full bg-red-950/10 border border-red-900/20 text-red-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Clock size={8} />
                        Due {new Date(req.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && requirements.length === 0 && (
          <div className="text-center py-32 bg-[#1C1917] border border-dashed border-stone-800 rounded-[3rem] animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-stone-800">
               <Database size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-stone-300 mb-4">No Requirements Found</h3>
            <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest">Create your first requirement to begin.</p>
          </div>
        )}

        <div className="mt-16 bg-[#1F1D1B] p-12 rounded-[3.5rem] border border-stone-800/50 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
           <div className="w-24 h-24 bg-gradient-to-br from-[#1F1D1B] to-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-[#9A3412] shadow-2xl">
              <ShieldCheck size={40} strokeWidth={1.5} />
           </div>
           <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Department Guidelines</h2>
              <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] mt-3 leading-relaxed max-w-2xl">
                Departmental guidelines ensure student registration follows official standards. Changes to requirements are tracked for audit purposes.
              </p>
           </div>
           <div className="flex gap-4">
             <button 
              onClick={fetchRequirements}
              className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
              title="Manual Re-sync"
             >
               <RefreshCw size={18} />
             </button>
             <div className="bg-stone-900/50 border border-stone-800 p-4 px-8 rounded-2xl">
                <p className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1">Active</p>
                <p className="text-xl font-black text-[#FAFAF9] tabular-nums">{requirements.length}</p>
             </div>
             <div className="bg-stone-900/50 border border-stone-800 p-4 px-8 rounded-2xl">
                <p className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1">Mandatory</p>
                <p className="text-xl font-black text-[#9A3412] tabular-nums">{requirements.filter(r => r.isRequired).length}</p>
             </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1C1917] w-full max-w-lg rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#9A3412] opacity-[0.05] blur-3xl" />
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  {editingId ? 'Edit Requirement' : 'New Requirement'}
                </h2>
                <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Enter requirement details</p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({ 
                    title: '', 
                    description: '', 
                    type: '', 
                    isRequired: true,
                    scope: 'global',
                    targetDepartment: '',
                    targetSection: '',
                    targetYear: '',
                    deadline: ''
                  });
                }} 
                className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] transition-all hover:bg-stone-800"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <Zap size={10} className="text-[#9A3412]" /> Title
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Identity Card"
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <Settings size={10} className="text-[#9A3412]" /> Type
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. document"
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                   <Edit3 size={10} className="text-[#9A3412]" /> Description
                </label>
                <textarea 
                  rows="4"
                  placeholder="Describe the requirement for students..."
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800 resize-none leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="group flex items-center gap-4 py-4 px-6 bg-[#1F1D1B] border border-stone-800 rounded-3xl cursor-pointer select-none active:scale-[0.98] transition-all" onClick={() => setFormData({...formData, isRequired: !formData.isRequired})}>
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.isRequired ? 'bg-[#9A3412] border-[#9A3412]' : 'bg-[#1C1917] border-stone-800'}`}>
                   {formData.isRequired && <CheckCircle size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#FAFAF9] transition-colors">Mark as Mandatory</p>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Mandatory requirements are required for student registration approval</p>
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-stone-800/30">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Layers size={10} className="text-[#9A3412]" /> Assignment Scope
                   </label>
                   <div className="flex bg-[#1F1D1B] p-1 rounded-xl border border-stone-800">
                      {['global', 'targeted'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({...formData, scope: s})}
                          className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${formData.scope === s ? 'bg-[#9A3412] text-white' : 'text-stone-600 hover:text-stone-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>

                {formData.scope === 'targeted' && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone-600 uppercase tracking-widest ml-2">Department</label>
                      <select 
                        className="w-full bg-[#1F1D1B] border border-stone-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] [color-scheme:dark]"
                        value={formData.targetDepartment}
                        onChange={e => setFormData({...formData, targetDepartment: e.target.value})}
                      >
                        <option value="">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone-600 uppercase tracking-widest ml-2">Year of Study</label>
                      <select 
                        className="w-full bg-[#1F1D1B] border border-stone-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412]"
                        value={formData.targetYear}
                        onChange={e => setFormData({...formData, targetYear: e.target.value})}
                      >
                        <option value="">All Years</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone-600 uppercase tracking-widest ml-2">Assigned Section</label>
                      <select 
                        className="w-full bg-[#1F1D1B] border border-stone-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412]"
                        value={formData.targetSection}
                        onChange={e => setFormData({...formData, targetSection: e.target.value})}
                      >
                        <option value="">All Sections</option>
                        {sections.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.year})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-stone-600 uppercase tracking-widest ml-2">Submission Deadline</label>
                      <input 
                        type="date"
                        className="w-full bg-[#1F1D1B] border border-stone-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] [color-scheme:dark]"
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-stone-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-stone-400 transition-colors">Cancel</button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#9A3412] hover:bg-[#C2410C] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-orange-950/40 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={20} />
                  {editingId ? 'Save Changes' : 'Add Requirement'}
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

export default RequirementManagement;
