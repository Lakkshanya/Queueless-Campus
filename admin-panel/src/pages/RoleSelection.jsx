import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  ShieldCheck, 
  Monitor, 
  ChevronLeft, 
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signupData } = location.state || {};
  const [isLoading, setIsLoading] = useState(null); // stores the ID of the role being selected

  const handleRoleSelect = async (role) => {
    if (!signupData) {
      alert('Registration data is missing. Please restart the process.');
      navigate('/signup');
      return;
    }

    if (isLoading) return; // Prevent duplicate clicks

    setIsLoading(role);
    try {
      const response = await api.post('/auth/signup', {
        ...signupData,
        role
      });
      
      if (response.status === 201 || response.status === 200) {
        // Navigate to OTP directly
        navigate('/verify-otp', { 
          state: { 
            email: signupData.email,
            message: response.data?.message 
          } 
        });
      } else {
        throw new Error(response.data?.message || 'Unexpected response status');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (!error.response) {
        // Network or Connection Error
        errorMessage = 'Backend server unreachable. Please Sync your server URL or check your connection.';
      } else {
        errorMessage = error.response.data?.message || 'Registration failed';
      }

      if (errorMessage === 'Email already registered') {
        alert('This email is already associated with an active account. Please sign in instead.');
      } else {
        alert(errorMessage);
      }
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 font-sans selection:bg-orange-600/30">
      <div className="max-w-2xl w-full bg-[#1C1917] rounded-2xl p-6 border border-stone-800/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 opacity-10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/5 opacity-10 blur-[80px] pointer-events-none"></div>
        
        <button 
          onClick={() => navigate('/signup')}
          className="absolute top-4 left-6 text-stone-600 hover:text-white flex items-center gap-2 transition-all group/back z-20"
        >
          <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center group-hover/back:border-orange-600/50 transition-all shadow-inner">
            <ChevronLeft size={14} className="group-hover/back:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] ml-2">Back</span>
        </button>

        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-orange-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4 bg-orange-600/5 px-4 py-1.5 rounded-full border border-orange-600/10 shadow-sm">
             <Lock size={12} strokeWidth={3} /> Account Authorization
          </div>
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tighter leading-none">Select Access Level</h2>
          <p className="text-stone-500 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80">Choose your system permissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          {[
            { 
              id: 'admin', 
              label: 'Administrator', 
              subtitle: 'Lead Manager',
              icon: <ShieldCheck size={28} />, 
              desc: 'Full control over services, counters, staff allocation, and analytics.' 
            },
            { 
              id: 'staff', 
              label: 'Counter Staff', 
              subtitle: 'Service Operator',
              icon: <Monitor size={28} />, 
              desc: 'Interface for managing queues, calling students, and service delivery.' 
            }
          ].map((role) => (
            <button 
              key={role.id}
              disabled={isLoading !== null}
              onClick={() => handleRoleSelect(role.id)}
              className={`group bg-stone-900/30 border border-stone-800/80 p-6 rounded-2xl transition-all duration-500 text-left flex flex-col gap-4 relative overflow-hidden h-full active:scale-[0.98] ${isLoading === role.id ? 'border-orange-600 bg-orange-600/5' : 'hover:border-orange-600/40 hover:bg-stone-900/50 shadow-xl'}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[40px]"></div>
              
              <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center group-hover:border-orange-600/50 group-hover:scale-105 transition-all duration-500 shadow-inner overflow-hidden relative">
                {isLoading === role.id ? (
                  <div className="w-6 h-6 border-2 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
                ) : (
                  <div className="text-stone-600 group-hover:text-orange-600 transition-colors duration-500">
                    {role.icon}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-orange-600 font-black text-[8px] uppercase tracking-[0.3em]">{role.subtitle}</span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-orange-500 transition-colors duration-500">{role.label}</h3>
                <p className="text-stone-500 text-[11px] font-medium leading-relaxed mt-2 group-hover:text-stone-400 transition-colors duration-500">{role.desc}</p>
              </div>

              <div className={`flex items-center gap-3 transition-all duration-500 pt-3 border-t border-stone-800/50 ${isLoading === role.id ? 'opacity-100 text-orange-600' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 text-stone-500 group-hover:text-orange-600'}`}>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isLoading === role.id ? 'Proceeding...' : 'Confirm Selection'}</span>
                <ArrowRight size={12} className={isLoading === role.id ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'} strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-stone-800/40 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-stone-600">
               <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></div>
               <p className="text-[9px] font-black uppercase tracking-widest leading-none">
                 Administrative System <span className="text-stone-800 mx-2">|</span> v4.2.0
               </p>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                const name = prompt('Server Sync: Enter identifier:');
                if (name) {
                   const clean = name.trim().toLowerCase();
                   localStorage.setItem('serverUrl', `https://${clean}.trycloudflare.com/api`);
                   localStorage.setItem('portalUrl', `https://${clean}.trycloudflare.com`);
                   window.location.reload();
                }
              }}
              className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-[8px] text-stone-500 hover:text-orange-600 hover:border-orange-600/30 font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
            >
              ⚙ SYNC SERVER
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
