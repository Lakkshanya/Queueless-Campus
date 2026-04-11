import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCcw 
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captcha) {
      alert('Invalid Captcha Code. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        captcha: captchaInput
      });
      
      const { token, user } = response.data;
      login({ ...user, token });

      if (!user.profileCompleted) {
        navigate('/complete-profile');
        return;
      }

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else alert('Access Denied: Please use the mobile app for student access.');
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed. Please verify your credentials.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#292524] rounded-[40px] p-12 border border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9A3412] opacity-10 blur-[80px]"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9A3412]/10 rounded-2xl mb-6 border border-[#9A3412]/20 shadow-inner">
            <LogIn className="text-[#9A3412]" size={32} />
          </div>
          <h1 className="text-4xl font-black text-[#FAFAF9] mb-2 uppercase tracking-tighter">Identity Access</h1>
          <p className="text-[#D6D3D1] font-bold text-[10px] uppercase tracking-[4px] opacity-60">Admin & Staff Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors" size={18} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-12 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Captcha Section */}
          <div className="space-y-4 pt-2">
            <label className="block text-[#D6D3D1] text-[10px] font-black mb-1 uppercase tracking-widest opacity-70 ml-1">Identity Verification</label>
            <div className="flex gap-3">
              <div className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-4 flex items-center justify-between shadow-inner">
                <span className="text-xl font-black text-[#9A3412] tracking-[8px] select-none italic line-through decoration-stone-700/50">
                  {captcha}
                </span>
                <button 
                  type="button"
                  onClick={generateCaptcha}
                  className="text-stone-500 hover:text-[#9A3412] transition-colors p-1"
                  title="Generate New Code"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  className="w-full h-full bg-[#1C1917] border border-stone-800 rounded-2xl px-5 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-center font-bold text-lg"
                  placeholder="CODE"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-950/20 uppercase tracking-widest text-[11px] mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? 'Authenticating...' : (
              <>
                Secure Login
                <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10 flex flex-col gap-4">
          <p className="text-[#D6D3D1] text-[10px] font-bold uppercase tracking-widest opacity-60">
            Don't have an account? 
            <Link to="/signup" className="text-[#9A3412] font-black ml-2 hover:opacity-80 transition-opacity">Request Access</Link>
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

          <p className="text-stone-600 text-[9px] italic">
            This portal is restricted to authorized campus personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
