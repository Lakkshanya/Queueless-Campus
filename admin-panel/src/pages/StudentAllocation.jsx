import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  UserCheck, 
  Users, 
  GraduationCap, 
  X, 
  ChevronRight, 
  Activity,
  UserPlus,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

const StudentAllocation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sectionId = queryParams.get('sectionId');

  const [section, setSection] = useState(null);
  const [unallocatedStudents, setUnallocatedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      // 1. Fetch section details
      const sectionRes = await api.get('/sections');
      const targetSection = sectionRes.data.find(s => s._id === sectionId);
      if (!targetSection) {
        navigate('/admin/sections');
        return;
      }
      setSection(targetSection);

      // 2. Fetch unallocated students (students without a section or already in this section)
      const studentsRes = await api.get('/auth/students');
      const allStudents = studentsRes.data;
      setUnallocatedStudents(allStudents.filter(s => !s.section || s.section === sectionId));
      
      // Pre-select students already in this section
      const existingStudentIds = allStudents
        .filter(s => s.section === sectionId)
        .map(s => s._id);
      setSelectedStudents(existingStudentIds);
    } catch (error) {
      console.error('Error fetching allocation data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sectionId) fetchData();
    else navigate('/admin/sections');
  }, [sectionId]);

  const toggleStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAllocate = async () => {
    if (selectedStudents.length === 0 && section?.students?.length === 0) return;
    try {
      await api.post('/sections/allocate-students', {
        sectionId,
        studentIds: selectedStudents
      });
      alert('Student allocation process complete. Academic records updated.');
      fetchData();
    } catch (error) {
      alert('Allocation update failure. Please try again.');
    }
  };

  const filteredStudents = unallocatedStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Student Records...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <Layers size={14} />
                Academic Records
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Student Allocation</h1>
              <div className="flex items-baseline gap-4 mt-4">
                 <h2 className="text-2xl font-black uppercase tracking-tighter leading-none text-stone-400">{section?.name}</h2>
                 <p className="text-stone-500 text-lg font-black uppercase tracking-widest opacity-50">{section?.year}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleAllocate}
            disabled={selectedStudents.length === 0}
            className={`group p-5 px-10 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition shadow-2xl flex items-center gap-4 active:scale-[0.98] ${
                selectedStudents.length > 0 
                ? 'bg-[#9A3412] hover:bg-[#C2410C] text-white shadow-orange-950/40' 
                : 'bg-stone-900 text-stone-700 border border-stone-800 cursor-not-allowed opacity-50'
            }`}
          >
            <ShieldCheck size={20} />
            Save Allocation ({selectedStudents.length})
          </button>
        </header>

        <div className="bg-[#1C1917] rounded-[4rem] border border-stone-800/50 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[750px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-3xl pointer-events-none" />
          
          {/* Enhanced Search Hub */}
          <div className="p-10 border-b border-stone-800/50 flex flex-col md:flex-row gap-6 items-center shrink-0">
             <div className="relative flex-1 group w-full">
                <div className="absolute inset-y-0 left-6 flex items-center text-stone-600 group-focus-within:text-[#9A3412] transition-colors">
                   <Search size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="Search by name or college ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                />
             </div>
             <div className="flex gap-4 shrink-0">
                <div className="bg-[#1F1D1B] px-6 py-4 rounded-2xl border border-stone-800 flex items-center gap-4">
                   <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   <span className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-500">Records Online</span>
                </div>
             </div>
          </div>

          {/* Student List */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {filteredStudents.map(student => (
              <div 
                key={student._id}
                onClick={() => toggleStudent(student._id)}
                className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer flex justify-between items-center relative overflow-hidden active:scale-[0.98] ${
                    selectedStudents.includes(student._id) 
                    ? 'bg-[#9A3412]/5 border-[#9A3412]/40 shadow-xl' 
                    : 'bg-[#1F1D1B]/40 border-stone-800/50 hover:border-stone-700/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-full bg-[#9A3412] opacity-0 group-hover:opacity-[0.02] transition-opacity blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-6 relative z-10">
                   <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black transition-all shadow-inner ${
                       selectedStudents.includes(student._id) 
                       ? 'bg-[#9A3412] border-[#9A3412] text-white rotate-6 scale-110' 
                       : 'bg-stone-900 border-stone-800 text-stone-600 group-hover:text-stone-400 group-hover:scale-105'
                   }`}>
                      {student.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <p className={`font-black uppercase tracking-widest transition-colors text-sm ${
                        selectedStudents.includes(student._id) ? 'text-[#FAFAF9]' : 'text-[#FAFAF9] opacity-60 group-hover:opacity-100'
                      }`}>{student.name}</p>
                      <p className="text-[9px] text-stone-700 uppercase font-black tracking-[0.3em] mt-1 group-hover:text-[#9A3412] transition-colors">
                        {student.collegeId || 'PENDING_REGISTRATION'}
                      </p>
                   </div>
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                   <div className={`w-10 h-10 rounded-2xl border transition-all flex items-center justify-center ${
                      selectedStudents.includes(student._id) 
                      ? 'bg-[#9A3412] border-[#9A3412] text-white shadow-[0_0_15px_rgba(154,52,18,0.3)]' 
                      : 'bg-stone-900 border-stone-800 text-transparent group-hover:text-stone-800'
                   }`}>
                      <CheckCircle size={20} />
                   </div>
                   <div className="text-stone-800 group-hover:text-stone-700 transition-colors">
                      <ChevronRight size={20} />
                   </div>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
                <div className="py-32 text-center">
                   <div className="w-20 h-20 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-stone-800">
                      <Users size={40} strokeWidth={1} />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-[0.3em] text-stone-900">No Student Records Found</h3>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-900 mt-4 leading-relaxed max-w-xs mx-auto">No available students found within the matching search parameters.</p>
                </div>
            )}
          </div>

          {/* Records Footer */}
          <div className="bg-[#1F1D1B] p-10 border-t border-stone-800/50 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#9A3412]">
                   <Activity size={24} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Allocation Status</p>
                   <p className="text-lg font-black text-[#FAFAF9] mt-1 uppercase tracking-tighter">Student Distribution</p>
                </div>
             </div>
             <div className="px-8 py-4 bg-stone-900/50 border border-stone-800 rounded-2xl flex items-center gap-4">
                <Info size={16} className="text-stone-600" />
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 max-w-xs leading-relaxed">
                   Students selected will be formally assigned to <span className="text-[#9A3412]">{section?.name}</span> academic section upon confirmation.
                </p>
             </div>
          </div>
        </div>
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

export default StudentAllocation;
