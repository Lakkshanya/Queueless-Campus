import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  UserPlus, 
  Users, 
  ArrowLeft, 
  X, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap,
  ChevronRight,
  Search,
  CheckCircle,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

const SectionManagement = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSection, setNewSection] = useState({ year: '1st Year', name: '' });
  const [assigningSection, setAssigningSection] = useState(null);

  const fetchSections = async () => {
    try {
      const response = await api.get('/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/auth/staff');
      setStaffList(response.data.filter(s => s.isVerified));
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchStaff();
  }, []);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sections/create', newSection);
      setIsModalOpen(false);
      setNewSection({ year: '1st Year', name: '' });
      fetchSections();
    } catch (error) {
      alert('Section update failed. Request rejected by the system.');
    }
  };

  const handleAssignFA = async (staffId) => {
    try {
      await api.post('/sections/assign-fa', {
        sectionId: assigningSection._id,
        staffId
      });
      setAssigningSection(null);
      fetchSections();
    } catch (error) {
      alert(error.response?.data?.message || 'Faculty assignment sequence interrupted.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Section Directory...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <ClipboardList size={14} />
                Department Structure
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Section Management</h1>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group bg-[#9A3412] hover:bg-[#C2410C] text-white p-5 px-10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition shadow-2xl shadow-orange-950/40 flex items-center gap-4 active:scale-[0.98]"
          >
            <Plus size={20} />
            Create New Section
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sections.map(section => (
            <div key={section._id} className="group bg-[#1C1917] rounded-[3.5rem] p-10 border border-stone-800/50 hover:border-[#9A3412]/30 transition-all shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl" />
              
              <div className="mb-10 relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-[9px] uppercase font-black tracking-widest text-stone-400 group-hover:text-stone-300 transition-colors">
                      {section.year}
                   </div>
                   <div className="text-stone-800 group-hover:text-[#9A3412]/40 transition-colors">
                      <GraduationCap size={24} />
                   </div>
                </div>
                <h3 className="text-3xl font-black text-[#FAFAF9] tracking-tighter uppercase group-hover:text-[#9A3412] transition-colors">{section.name}</h3>
              </div>

              <div className="space-y-6 mb-10 relative z-10 flex-1">
                <div className="bg-[#1F1D1B] p-6 rounded-[2.5rem] border border-stone-800/50 group-hover:border-[#9A3412]/20 transition-all">
                  <p className="text-[9px] uppercase font-black text-stone-700 tracking-[0.3em] mb-3">Faculty Advisor</p>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 group-hover:text-[#9A3412] transition-colors">
                        <ShieldCheck size={18} />
                     </div>
                     <p className="text-sm font-black text-[#FAFAF9] uppercase tracking-widest leading-tight">
                        {section.facultyAdvisor?.name || 'No Advisor Assigned'}
                     </p>
                  </div>
                </div>

                <div className="flex justify-between items-center px-4">
                   <div className="flex items-center gap-3">
                      <Users size={18} className="text-stone-700" />
                      <div>
                         <p className="text-[9px] uppercase font-black text-stone-700 tracking-widest">Students</p>
                         <p className="text-lg font-black text-[#FAFAF9]">{section.students?.length || 0}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] uppercase font-black text-stone-700 tracking-widest">Status</p>
                      <p className="text-lg font-black text-green-500 uppercase">Active</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                 <button 
                   onClick={() => setAssigningSection(section)}
                   className="flex-1 bg-[#1F1D1B] hover:bg-stone-900 border border-stone-800 p-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 hover:border-stone-700"
                 >
                   <UserPlus size={14} />
                   Assign Advisor
                 </button>
                 <Link 
                   to={`/admin/allocation?sectionId=${section._id}`}
                   className="flex-1 bg-stone-900 hover:bg-[#9A3412] border border-stone-800 p-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition text-center flex items-center justify-center gap-2 hover:text-white"
                 >
                   <BookOpen size={14} />
                   Allocate
                 </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-[#1C1917] w-full max-w-lg rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#9A3412] opacity-[0.05] blur-3xl" />
              
              <div className="flex justify-between items-center mb-12">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Administrative Setup</p>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Create Section</h2>
                  <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Enter section details</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] transition-all hover:bg-stone-800"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateSection} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <Layers size={10} className="text-[#9A3412]" /> Academic Year
                  </label>
                  <select 
                    value={newSection.year}
                    onChange={e => setNewSection({...newSection, year: e.target.value})}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition appearance-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] ml-2 mb-2 flex items-center gap-2">
                     <GraduationCap size={10} className="text-[#9A3412]" /> Section Name
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Section A"
                    value={newSection.name}
                    onChange={e => setNewSection({...newSection, name: e.target.value})}
                    className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl p-5 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                    required
                  />
                </div>
                <div className="flex gap-6 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-stone-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-stone-400 transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#9A3412] hover:bg-[#C2410C] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-orange-950/40 active:scale-[0.98]"
                  >
                    Create Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign FA Modal */}
        {assigningSection && (
          <div className="fixed inset-0 bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
             <div className="bg-[#1C1917] w-full max-w-lg rounded-[4rem] p-12 border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 opacity-[0.05] blur-3xl" />
                
                <div className="flex justify-between items-center mb-10 shrink-0">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Assign Faculty Advisor</h2>
                    <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Select staff for {assigningSection.name}</p>
                  </div>
                  <button onClick={() => setAssigningSection(null)} className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar flex-1 pb-4">
                   {staffList.map(staff => (
                      <button 
                        key={staff._id}
                        onClick={() => handleAssignFA(staff._id)}
                        className="w-full bg-[#1F1D1B] hover:bg-stone-900 border border-stone-800 p-6 rounded-[2rem] flex justify-between items-center group transition-all text-left relative overflow-hidden active:scale-[0.98]"
                      >
                         <div className="absolute top-0 left-0 w-1 h-full bg-[#9A3412] opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div>
                            <p className="font-black text-[#FAFAF9] uppercase tracking-widest text-sm group-hover:text-[#9A3412] transition-colors">{staff.name}</p>
                            <p className="text-[9px] text-stone-600 uppercase font-black tracking-[0.2em] mt-1">{staff.department || 'ACADEMIC AFFAIRS'}</p>
                         </div>
                         <div className="w-10 h-10 rounded-2xl border border-stone-800 flex items-center justify-center text-stone-700 group-hover:border-[#9A3412]/50 group-hover:text-[#9A3412] transition-all">
                            <ChevronRight size={18} />
                         </div>
                      </button>
                   ))}
                   {staffList.length === 0 && (
                      <div className="text-center py-20 opacity-20">
                         <AlertCircle size={48} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No verified staff detected.</p>
                      </div>
                   )}
                </div>
                
                <button onClick={() => setAssigningSection(null)} className="w-full mt-8 py-5 border border-stone-800 rounded-3xl text-stone-600 font-black text-[11px] uppercase tracking-[0.3em] hover:text-stone-400 transition-colors shrink-0">Close</button>
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

export default SectionManagement;
