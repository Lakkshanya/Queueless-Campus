import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'staff') navigate('/staff');
        else navigate('/login'); 
      } else {
        navigate('/welcome');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#9A3412]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#C2410C]/5 blur-[120px] rounded-full animate-pulse delay-700" />
      
      {/* Central Brand Identity */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative group perspective-1000">
          {/* Logo Card with Luxury Depth */}
          <div className="w-32 h-32 bg-gradient-to-br from-[#9A3412] to-[#7C2D12] rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-[0_20px_50px_rgba(154,52,18,0.3)] border border-[#9A3412]/20 animate-in zoom-in-50 fade-in duration-1000">
            <div className="text-white text-6xl font-black -rotate-12 tracking-tighter drop-shadow-2xl select-none">Q</div>
          </div>
          
          {/* Decorative Ring */}
          <div className="absolute inset-0 border-2 border-[#9A3412]/20 rounded-[2.5rem] rotate-[24deg] scale-110 pointer-events-none animate-spin duration-[10s] linear divide-stone-800"></div>
        </div>

        <div className="mt-16 text-center animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
          <h1 className="text-[#FAFAF9] text-5xl font-black tracking-tighter lowercase flex items-center gap-1">
            queue<span className="text-[#9A3412] uppercase font-bold text-4xl tracking-normal">Less</span>
          </h1>
          <div className="flex items-center gap-3 mt-4 justify-center">
            <div className="h-[1px] w-8 bg-stone-800"></div>
            <p className="text-stone-500 font-bold tracking-[0.4em] uppercase text-[9px] opacity-80">Campus Office Portal</p>
            <div className="h-[1px] w-8 bg-stone-800"></div>
          </div>
        </div>
      </div>

      {/* Modern High-End Loading Indicator */}
      <div className="absolute bottom-24 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-700">
        <div className="w-48 h-[2px] bg-stone-800/50 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-[#9A3412] w-1/3 rounded-full animate-[shimmer_2s_infinite_ease-in-out]"></div>
        </div>
        <p className="text-[#D6D3D1] text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Initializing Analytics Engine</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%); width: 20%; }
          50% { transform: translateX(150%); width: 50%; }
          100% { transform: translateX(450%); width: 20%; }
        }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
};

export default Splash;
