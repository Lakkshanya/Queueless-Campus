import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ChevronRight,
  Info 
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Pass form data to Role Selection
    navigate('/roles', { state: { signupData: formData } });
  };

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#292524] rounded-[40px] p-12 border border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9A3412] opacity-10 blur-[80px]"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9A3412]/10 rounded-2xl mb-6 border border-[#9A3412]/20 shadow-inner">
            <User className="text-[#9A3412]" size={32} />
          </div>
          <h1 className="text-4xl font-black text-[#FAFAF9] mb-3 uppercase tracking-tighter">Create Account</h1>
          <p className="text-[#D6D3D1] font-bold text-[10px] uppercase tracking-[4px] opacity-60">Admin & Staff Registration</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 relative z-10">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors" size={18} />
              </div>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="Identity Name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors" size={18} />
              </div>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="name@campus.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors" size={18} />
              </div>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors" size={18} />
              </div>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Rules Section (Same as Mobile) */}
          <div className="bg-[#1C1917]/50 rounded-2xl p-4 border border-stone-800/50 mt-6 group select-none hover:border-[#9A3412]/30 transition-colors">
            <div className="flex items-center mb-2">
              <Info className="text-[#9A3412]" size={14} />
              <span className="text-[#9A3412] text-[10px] font-black ml-2 uppercase tracking-widest">Portal Rules</span>
            </div>
            <p className="text-[#D6D3D1] text-[9px] leading-relaxed opacity-60">
              • Official campus credentials only.<br/>
              • Authorized staff and administrators only.<br/>
              • All activities are recorded for security.<br/>
              • Multi-factor authentication is required.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-950/20 uppercase tracking-widest text-[11px] mt-6 flex items-center justify-center gap-2 group transform active:scale-95"
          >
            Select Account Role
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center relative z-10 flex flex-col gap-4">
          <p className="text-[#D6D3D1] text-[10px] font-bold uppercase tracking-widest opacity-60">
            Already have an account? 
            <Link to="/login" className="text-[#9A3412] font-black ml-2 hover:opacity-80 transition-opacity">Sign In</Link>
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
                 alert('Server Synced! Refreshing...');
                 window.location.reload();
              }
            }}
            className="text-[10px] text-stone-500 hover:text-[#9A3412] font-black uppercase tracking-tighter transition-colors"
          >
            ⚙️ Sync Server with Tunnel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
