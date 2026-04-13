import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Fingerprint, ArrowRight, RefreshCcw, ShieldCheck } from "lucide-react";
const OTPVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const { email } = location.state || {};
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    setError("");
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: otpValue });
      const { token, user } = res.data;
      if (token && user) {
        login({ ...user, token });
        setNotification("Verification Successful. Loading your workspace...");
        setTimeout(() => navigate("/complete-profile"), 1500);
      } else {
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    setResending(true);
    setError("");
    setNotification("");
    try {
      await api.post("/auth/forgot-password", { email });
      setNotification("A new verification code has been sent to your email.");
    } catch (error) {
      setError("Failed to resend code. Please check your connection.");
    } finally {
      setResending(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-5 selection:bg-orange-600/30 font-sans relative overflow-hidden">
      {" "}
      {/* Background Ambience */}{" "}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-orange-600/5 blur-[150px] pointer-events-none" />{" "}
      <div className="max-w-xl w-full bg-[#171412] rounded-3xl p-6 border border-stone-800/80 shadow-2xl relative overflow-hidden group">
        {" "}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />{" "}
        <header className="text-center mb-10 relative z-10">
          {" "}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 border border-stone-800 rounded-2xl mb-8 shadow-inner group-hover:border-orange-600/30 transition-all duration-700">
            {" "}
            <Fingerprint
              className="text-orange-600"
              size={32}
              strokeWidth={1.5}
            />{" "}
          </div>{" "}
          <div className="flex items-center justify-center gap-2 text-orange-600 text-xs font-bold tracking-tight mb-4">
            {" "}
            <ShieldCheck size={12} strokeWidth={3} /> Security Verification{" "}
          </div>{" "}
          <h2 className="text-xl font-bold tracking-tight text-white leading-none mb-6">
            {" "}
            Verify Your Email{" "}
          </h2>{" "}
          <div className="px-5 py-2.5 bg-stone-900/50 rounded-full border border-stone-800/60 inline-flex items-center gap-3 shadow-inner">
            {" "}
            <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />{" "}
            <p className="text-stone-500 text-xs font-bold tracking-tight">
              {email}
            </p>{" "}
          </div>{" "}
        </header>{" "}
        <form onSubmit={handleVerify} className="space-y-12 relative z-10">
          {" "}
          <div className="flex justify-between gap-3">
            {" "}
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
                className="w-full h-16 bg-stone-900/50 border border-stone-800 rounded-xl text-center text-xl font-bold tracking-tight text-white focus:outline-none focus:border-orange-600/50 transition-all shadow-inner focus:shadow-[0_0_20px_rgba(234,88,12,0.1)] placeholder-stone-900/20"
                placeholder="-"
                autoFocus={index === 0}
              />
            ))}{" "}
          </div>{" "}
          {(error || notification) && (
            <div
              className={`p-5 rounded-xl border animate-in slide-in-from-top-4 duration-500 backdrop-blur-md ${error ? "bg-red-500/5 border-red-500/20 text-red-500" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"}`}
            >
              {" "}
              <p className="text-xs font-bold tracking-tight text-center leading-relaxed">
                {" "}
                {error || notification}{" "}
              </p>{" "}
            </div>
          )}{" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-bold tracking-tight text-xs shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-4 active:scale-[0.97] group/btn"
          >
            {" "}
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {" "}
                Confirm Verification{" "}
                <ArrowRight
                  size={18}
                  className="group-hover/btn:translate-x-1 transition-transform"
                  strokeWidth={3}
                />{" "}
              </>
            )}{" "}
          </button>{" "}
        </form>{" "}
        <footer className="mt-10 text-center relative z-10 border-t border-stone-800/40 pt-10">
          {" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="group/resend inline-flex flex-col items-center gap-3 transition-all"
          >
            {" "}
            <p className="text-xs font-bold tracking-tight text-stone-700 group-hover/resend:text-stone-500 transition-colors">
              {" "}
              Didn't receive the code?{" "}
            </p>{" "}
            <div className="flex items-center gap-2 text-orange-600 font-bold tracking-tight text-xs">
              {" "}
              <RefreshCcw
                size={14}
                className={`${resending ? "animate-spin" : "group-hover/resend:rotate-180"} transition-transform duration-700`}
                strokeWidth={3}
              />{" "}
              {resending ? "Sending Code..." : "Resend Verification Code"}{" "}
            </div>{" "}
          </button>{" "}
        </footer>{" "}
      </div>{" "}
    </div>
  );
};
export default OTPVerify;
