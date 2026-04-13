import React, { useState, useEffect, useCallback } from "react";
import { ShieldAlert, LogOut, Zap, RefreshCw } from "lucide-react";

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_START = 60; // 60 seconds

const InactivityWarning = ({ onLogout }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);
  const inactivityTimeout = React.useRef(null);
  const countdownInterval = React.useRef(null);

  const resetTimer = useCallback(() => {
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setIsVisible(false);
    setSecondsLeft(COUNTDOWN_START);
    inactivityTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, INACTIVITY_TIME);
  }, []);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleEvent = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handleEvent));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleEvent));
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (isVisible && secondsLeft > 0) {
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      onLogout();
    }
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isVisible, secondsLeft, onLogout]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0C0A09]/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-[#171412] w-full max-w-lg p-12 rounded-[32px] border border-stone-800 shadow-[0_0_100px_rgba(234,88,12,0.15)] flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full -mr-24 -mt-24 pointer-events-none" />
        <div className="w-20 h-20 bg-orange-600/10 rounded-3xl flex items-center justify-center mb-8 border border-orange-600/20 shadow-inner">
          <ShieldAlert className="text-orange-600" size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-4 font-display">
          TERMINAL STANDBY
        </h2>
        <p className="text-stone-500 text-center font-bold tracking-tight text-sm leading-relaxed mb-10 px-8">
          We've detected a lull in operator telemetry. To preserve grid
          resources and terminal security, the session will auto-terminate.
        </p>
        <div className="w-full bg-[#0C0A09] p-8 rounded-[40px] border border-stone-800 flex flex-col items-center justify-center mb-10 relative">
          <div
            className="absolute left-0 top-0 bottom-0 bg-orange-600/5 transition-all duration-1000 linear"
            style={{ width: `${(secondsLeft / COUNTDOWN_START) * 100}%` }}
          />
          <span className="text-stone-700 text-xs font-bold tracking-tight mb-4 uppercase z-10">
            Sequence Reset In
          </span>
          <span className="text-orange-600 text-4xl font-bold tracking-tight tabular-nums z-10">
            {secondsLeft}s
          </span>
        </div>
        <div className="flex flex-col w-full gap-4">
          <button
            onClick={resetTimer}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-tight py-6 rounded-[32px] text-xs uppercase shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <RefreshCw size={14} className="animate-spin-slow" /> Re-Authorize
            Session
          </button>
          <button
            onClick={onLogout}
            className="w-full bg-stone-900 border border-stone-800 hover:border-red-900/40 text-stone-600 hover:text-red-500 font-bold tracking-tight py-6 rounded-[32px] text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={14} /> Manual De-Link
          </button>
        </div>
        <div className="mt-10 flex items-center gap-4">
          <Zap className="text-stone-800" size={16} />
          <span className="text-xs font-bold tracking-tight text-stone-800 uppercase">
            Encryption Active: 256-BIT
          </span>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
