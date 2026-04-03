import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Fingerprint, 
  ArrowRight, 
  RefreshCcw, 
  ShieldCheck 
} from 'lucide-react';

const OTPVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      alert('Security Session Expired. Please restart the registration process.');
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp: otpValue
      });
      
      const { token, user } = res.data;
      if (token && user) {
        // Auto-login after successful verification
        login({ ...user, token });
        alert('Identity Verified Successfully! Redirecting to setup...');
        navigate('/complete-profile');
      } else {
        alert('Verification Successful! Please log in to continue.');
        navigate('/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      alert('A new security code has been dispatched to your email.');
    } catch (error) {
      alert('System failed to re-dispatch the code. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#292524] rounded-[40px] p-12 border border-stone-800 shadow-2xl relative overflow-hidden text-center">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9A3412] opacity-10 blur-[80px]"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9A3412]/10 rounded-2xl mb-6 border border-[#9A3412]/20 shadow-inner">
            <Fingerprint className="text-[#9A3412]" size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#FAFAF9] mb-3 uppercase tracking-tighter italic">Verify Identity</h2>
          <p className="text-[#D6D3D1] font-bold text-[10px] uppercase tracking-[4px] opacity-60">Authentication Code required</p>
          <div className="mt-4 px-4 py-2 bg-stone-900/50 rounded-full border border-stone-800 inline-block">
            <p className="text-[#9A3412] text-[10px] font-mono font-bold tracking-wider">{email}</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-10 relative z-10">
          <div className="flex justify-between gap-2 px-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                inputMode="numeric"
                value={digit}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-16 bg-[#1C1917] border border-stone-800 rounded-2xl text-center text-2xl font-black text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all shadow-inner focus:shadow-[#9A3412]/10"
              />
            ))}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-950/20 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Verifying...' : (
              <>
                Finalize Verification
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10">
          <button 
            onClick={handleResend}
            className="group flex flex-col items-center gap-3 mx-auto"
          >
            <div className="flex items-center gap-2 text-[#D6D3D1] text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              Didn't receive the code?
            </div>
            <div className="flex items-center gap-2 text-[#9A3412] font-black text-[10px] uppercase tracking-widest">
              <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Re-dispatch Security OTP
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
