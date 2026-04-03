import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Edit3, 
  X, 
  Zap,
  Save,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Mail,
  UserCircle
} from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // v14 Alignment: Academic Records Form
  const [formData, setFormData] = useState({
    department: '',
    yearOfStudy: '',
    collegeId: '',
    batch: '',
    cgpa: '',
    enrollmentStatus: 'Pending'
  });

  const fetchStudents = async () => {
    try {
      const response = await api.get('/auth/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      department: student.department || '',
      yearOfStudy: student.yearOfStudy || '',
      collegeId: student.collegeId || '',
      batch: student.academicRecords?.batch || '',
      cgpa: student.academicRecords?.cgpa || '',
      enrollmentStatus: student.academicRecords?.enrollmentStatus || 'Pending'
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // 1. Update Core Profile
      await api.post('/complete-profile', { 
        ...formData,
        userId: selectedStudent._id // The backend expects the user context or explicit ID if admin
      });

      // 2. Update Academic Records (Step 4.3 Alignment)
      await api.put(`/auth/student/${selectedStudent._id}/records`, {
        academicRecords: {
          batch: formData.batch,
          cgpa: parseFloat(formData.cgpa) || 0,
          enrollmentStatus: formData.enrollmentStatus,
          academicProgress: formData.cgpa > 0 ? 'Active' : 'Awaiting Data'
        }
      });

      alert('Student records successfully synchronized!');
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (error) {
      alert('Sync failed. Please check administrative permissions.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.collegeId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-stone-500 font-black uppercase tracking-widest animate-pulse">Accessing Registry...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Student Management</h2>
          <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Administrative Profile Override</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-4 text-stone-600" size={18} />
          <input 
            type="text" 
            placeholder="Search Registry..." 
            className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 pl-12 text-xs font-bold text-white outline-none focus:border-[#9A3412]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-[#1C1917] rounded-[3rem] border border-stone-800/50 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-stone-800/50 text-stone-600 text-[9px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-10 py-8">Student Identity</th>
              <th className="px-8 py-8">ID / Batch</th>
              <th className="px-8 py-8">Academic Status</th>
              <th className="px-10 py-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/20">
            {filteredStudents.map(student => (
              <tr key={student._id} className="group hover:bg-stone-900/40 transition-all">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#9A3412] rounded-xl flex items-center justify-center font-black text-white">{student.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-white uppercase">{student.name}</p>
                      <p className="text-[10px] text-stone-500 font-bold">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-xs font-bold text-stone-300">
                  {student.collegeId || 'NO_ID'} <span className="text-stone-600 mx-2">|</span> {student.academicRecords?.batch || 'N/A'}
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${student.academicRecords?.enrollmentStatus === 'Verified' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{student.academicRecords?.enrollmentStatus || 'Pending'}</span>
                   </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => handleEditClick(student)}
                    className="p-3 bg-stone-900 border border-stone-800 rounded-xl hover:border-[#9A3412] text-white transition-all group-hover:scale-105 active:scale-95"
                  >
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C1917] w-full max-w-3xl rounded-[3rem] border border-stone-800 shadow-2xl p-12">
            <header className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-[#9A3412] rounded-2xl flex items-center justify-center text-white"><ShieldCheck size={28} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Academic Override</h3>
                    <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-1">Editing: {selectedStudent?.name}</p>
                 </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-stone-900 rounded-full text-stone-500 hover:text-white"><X size={24} /></button>
            </header>

            <div className="grid grid-cols-2 gap-8 mb-10">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2">College ID</label>
                  <input type="text" name="collegeId" value={formData.collegeId} onChange={handleInputChange} className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#9A3412]" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2">Admission Batch</label>
                  <input type="text" name="batch" value={formData.batch} onChange={handleInputChange} className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#9A3412]" placeholder="e.g. 2021" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2">Current CGPA</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-4 text-stone-700" size={16} />
                    <input type="number" name="cgpa" step="0.01" value={formData.cgpa} onChange={handleInputChange} className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 pl-12 text-xs font-bold text-white outline-none focus:border-[#9A3412]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest ml-2">Enrollment Status</label>
                  <select name="enrollmentStatus" value={formData.enrollmentStatus} onChange={handleInputChange} className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 text-xs font-black text-[#9A3412] outline-none">
                     <option value="Pending">Pending Review</option>
                     <option value="Verified">Fully Verified</option>
                     <option value="On Hold">Admin Hold</option>
                  </select>
               </div>
            </div>

            <button 
              onClick={handleSave} 
              className="w-full bg-[#9A3412] text-white p-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-[#C2410C] transition-all flex items-center justify-center gap-3"
            >
              <Save size={18} />
              Synchronize Data Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
