import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  ChevronRight,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please ensure both fields are identical.');
      return;
    }
    
    setIsLoading(true);
    // Pass form data to Role Selection (exclude confirmPassword - backend doesn't need it)
    setTimeout(() => {
      const { confirmPassword: _, ...dataForSignup } = formData;
      navigate('/roles', { state: { signupData: dataForSignup } });
      setIsLoading(false);
    }, 600); 
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 font-sans selection:bg-orange-600/30">
      <div className="max-w-sm w-full bg-[#1C1917] rounded-2xl p-6 border border-stone-800/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-600/5 opacity-10 blur-[80px] pointer-events-none transition-opacity duration-1000"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl mb-6 shadow-inner group-hover:border-orange-600/30 transition-all duration-500">
            <User className="text-orange-600" size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-black text-white mb-2 uppercase tracking-tighter leading-none">Register Account</h1>
          <p className="text-stone-500 font-black text-[9px] uppercase tracking-[0.4em] opacity-80">Administrative Portal</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6 relative z-10">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-stone-600 text-[9px] font-black mb-1 uppercase tracking-[0.3em] ml-2">Full Name</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User className="text-stone-700 group-focus-within/input:text-orange-600 transition-colors" size={16} />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder-stone-800 text-xs font-bold tracking-wider shadow-inner"
                placeholder="Full Name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-stone-600 text-[9px] font-black mb-1 uppercase tracking-[0.3em] ml-2">Email Address</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="text-stone-700 group-focus-within/input:text-orange-600 transition-colors" size={16} />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder-stone-800 text-xs font-bold tracking-wider shadow-inner"
                placeholder="university@email.edu"
                required
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-stone-600 text-[9px] font-black mb-1 uppercase tracking-[0.3em] ml-2">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="text-stone-700 group-focus-within/input:text-orange-600 transition-colors" size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder-stone-800 text-xs font-bold tracking-wider shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-stone-700 hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-stone-600 text-[9px] font-black mb-1 uppercase tracking-[0.3em] ml-2">Confirm Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <ShieldCheck className="text-stone-700 group-focus-within/input:text-orange-600 transition-colors" size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder-stone-800 text-xs font-bold tracking-wider shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-stone-700 hover:text-orange-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Server Sync Status Indicator */}
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${localStorage.getItem('serverUrl') ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-bounce'}`}></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${localStorage.getItem('serverUrl') ? 'text-green-500/80' : 'text-orange-500/80'}`}>
                {localStorage.getItem('serverUrl') ? 'Tunnel Linked' : 'Local Mode'}
              </span>
            </div>
            {!localStorage.getItem('serverUrl') && (
              <span className="text-[7px] text-stone-600 font-bold uppercase tracking-tighter">Sync recommended for connectivity</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-black py-6 rounded-xl transition-all shadow-2xl shadow-orange-950/40 uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 transform active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue to Role Selection
                <ChevronRight size={16} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center relative z-10 flex flex-col gap-4">
          <p className="text-[#D6D3D1] text-[10px] font-bold uppercase tracking-widest opacity-60">
            Already registered?
            <Link to="/login" className="text-orange-600 font-black ml-2 hover:opacity-80 transition-opacity">Sign In</Link>
          </p>
          <div className="h-[1px] w-12 bg-stone-800 mx-auto"></div>

          <button
            type="button"
            onClick={() => {
              const name = prompt('Frequency Sync: Enter 4-word identifier:');
              if (name) {
                const clean = name.trim().toLowerCase();
                localStorage.setItem('serverUrl', `https://${clean}.trycloudflare.com/api`);
                localStorage.setItem('portalUrl', `https://${clean}.trycloudflare.com`);
                window.location.reload();
              }
            }}
            className="text-[10px] text-stone-500 hover:text-orange-600 font-black uppercase tracking-tighter transition-colors"
          >
            ⚙️ Sync Server with Tunnel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;

