import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Camera, 
  Save, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    profilePhoto: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          department: res.data.department || '',
          designation: res.data.designation || '',
          profilePhoto: res.data.profilePhoto || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const response = await api.post('/auth/complete-profile', formData);
      setSuccess(true);
      const updatedUser = { ...user, ...response.data.user, token: user?.token || localStorage.getItem('token') };
      login(updatedUser);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Update failed. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#1F1D1B]">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Profile Data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto py-12 px-6">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-500 hover:text-white hover:border-[#9A3412]/40 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-2">
              <Shield size={12} />
              Profile Settings
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-[#FAFAF9]">Edit Profile</h1>
          </div>
        </div>
        {success && (
          <div className="flex items-center gap-3 bg-green-950/20 border border-green-900/40 px-6 py-3 rounded-2xl animate-in zoom-in duration-300">
            <CheckCircle className="text-green-500" size={18} />
            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Profile Updated</span>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 shadow-2xl flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 bg-stone-900 rounded-[2.5rem] border-2 border-stone-800 flex items-center justify-center text-[#FAFAF9] text-3xl font-black transition-all group-hover:border-[#9A3412] shadow-inner overflow-hidden">
               {formData.profilePhoto ? (
                 <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 formData.name.charAt(0)
               )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#9A3412] border-4 border-[#1C1917] rounded-xl flex items-center justify-center text-white shadow-xl">
               <Camera size={16} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Name</p>
            <p className="text-sm font-black text-white uppercase tracking-widest leading-none">{formData.name || 'Anonymous User'}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { label: 'Full Name', icon: <User />, name: 'name', type: 'text' },
             { label: 'Email Address', icon: <Mail />, name: 'email', type: 'email', disabled: true },
             { label: 'Contact Phone', icon: <Phone />, name: 'phone', type: 'tel' },
             { label: 'Academic Department', icon: <Building />, name: 'department', type: 'text' },
             { label: 'Designation', icon: <Briefcase />, name: 'designation', type: 'text' },
           ].map((field, idx) => (
             <div key={idx} className="space-y-3">
                <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                   {React.cloneElement(field.icon, { size: 12, className: 'text-[#9A3412]' })}
                   {field.label}
                </label>
                <div className="relative group">
                   <input 
                    type={field.type}
                    value={formData[field.name]}
                    disabled={field.disabled}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className={`w-full bg-[#1C1917] border border-stone-800 rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none transition-all placeholder-stone-800 ${field.disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#9A3412] group-hover:border-stone-700'}`}
                   />
                </div>
             </div>
           ))}
        </div>

        {/* Submit */}
        <div className="pt-8 border-t border-stone-800/50 flex justify-end">
           <button 
            type="submit"
            disabled={saving}
            className="group flex items-center gap-4 bg-[#9A3412] hover:bg-[#C2410C] px-10 py-5 rounded-[2rem] transition-all shadow-2xl shadow-orange-950/40 disabled:opacity-50 disabled:grayscale"
           >
              {saving ? <Loader2 size={20} className="animate-spin text-white" /> : <Save size={20} className="text-white" />}
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Save Changes</span>
           </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
