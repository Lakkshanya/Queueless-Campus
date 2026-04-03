import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  ShieldCheck, 
  Monitor, 
  ChevronLeft, 
  CheckCircle2 
} from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupData } = location.state || {};

  const handleRoleSelect = async (role) => {
    if (!signupData) {
      alert('Signup data missing. Please start again.');
      navigate('/signup');
      return;
    }

    try {
      await api.post('/auth/signup', {
        ...signupData,
        role
      });
      navigate('/verify-otp', { state: { email: signupData.email } });
    } catch (error) {
      alert(error.response?.data?.message || 'Acccount registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-[#292524] rounded-[40px] p-12 border border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9A3412] opacity-10 blur-[80px]"></div>
        
        <button 
          onClick={() => navigate('/signup')}
          className="absolute top-8 left-8 text-stone-500 hover:text-white flex items-center gap-2 transition-colors group z-20"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl font-black text-[#FAFAF9] mb-3 uppercase tracking-tighter">Select Your Role</h2>
          <p className="text-[#D6D3D1] font-bold text-[10px] uppercase tracking-[4px] opacity-60">Choose your staff or admin account type</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {[
            { id: 'admin', label: 'Administrator', icon: <ShieldCheck size={32} />, desc: 'System management, analytics & staff allocation.' },
            { id: 'staff', label: 'Office Staff', icon: <Monitor size={32} />, desc: 'Real-time queue monitoring & student service support.' }
          ].map((role) => (
            <button 
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="flex-1 group bg-[#1C1917] border border-stone-800 hover:border-[#9A3412] p-10 rounded-[2.5rem] transition-all text-center flex flex-col items-center gap-6 relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-0 group-hover:opacity-[0.05] transition-opacity blur-[50px]"></div>
              <div className="w-20 h-20 bg-stone-900 border border-stone-800 rounded-3xl flex items-center justify-center group-hover:border-[#9A3412] group-hover:scale-110 transition-all duration-500 shadow-inner">
                <div className="text-stone-500 group-hover:text-[#9A3412] transition-colors scale-125">
                   {role.icon}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#FAFAF9] mb-3 uppercase tracking-tighter group-hover:text-[#9A3412] transition-colors">{role.label}</h3>
                <p className="text-[#D6D3D1] text-[11px] leading-relaxed opacity-60 max-w-[200px] mx-auto">{role.desc}</p>
              </div>
              <div className="mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 text-[10px] font-black text-[#9A3412] uppercase tracking-[0.3em]">
                Select Role <CheckCircle2 size={14} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 p-8 bg-stone-900/50 rounded-3xl border border-stone-800/50 relative z-10 select-none hover:border-[#9A3412]/20 transition-colors flex flex-col gap-4">
          <p className="text-[#D6D3D1] text-[10px] leading-relaxed opacity-60 text-center">
            <span className="text-[#9A3412] font-black uppercase mr-1 tracking-widest">Notice:</span> 
            Students must utilize the official <b className="text-white underline decoration-[#9A3412]/50 underline-offset-4">QueueLess Mobile Interface</b> for booking tokens and real-time monitoring.
          </p>

          <div className="h-[1px] w-12 bg-stone-800 mx-auto"></div>

          {/* SYNC SERVER BUTTON: The "Actual Rectification" for the Web */}
          <button 
            type="button"
            onClick={() => {
              const name = prompt('Type the 4-word tunnel name from your terminal (e.g. mold-farms-sandwich):');
              if (name) {
                 const clean = name.trim().toLowerCase();
                 localStorage.setItem('serverUrl', `https://${clean}.trycloudflare.com/api`);
                 localStorage.setItem('portalUrl', `https://${clean}.trycloudflare.com`);
                 alert('Server Synced! Re-trying... (The page will reload to apply)');
                 window.location.reload();
              }
            }}
            className="text-[10px] text-stone-500 hover:text-[#9A3412] font-black uppercase tracking-tighter transition-colors text-center"
          >
            ⚙️ Sync Server with Tunnel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
