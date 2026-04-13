import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import api from "../services/api";
import { Lock, Check, Loader2, KeyRound } from "lucide-react";
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }
  const handleReset = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) return alert("Please fill in all fields");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, token, newPassword });
      alert("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 font-sans selection:bg-orange-600/30">
      {" "}
      <div className="max-w-sm w-full bg-[#1C1917] rounded-2xl p-6 border border-stone-800/60 shadow-xl">
        {" "}
        <div className="text-center mb-8">
          {" "}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9A3412]/10 rounded-2xl mb-6 border border-[#9A3412]/20 shadow-inner">
            {" "}
            <KeyRound className="text-[#9A3412]" size={32} />{" "}
          </div>{" "}
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            {" "}
            Create New Password{" "}
          </h1>{" "}
          <p className="text-stone-500 text-sm">
            {" "}
            Enter the recovery code sent to {email}{" "}
          </p>{" "}
        </div>{" "}
        <form onSubmit={handleReset} className="space-y-6">
          {" "}
          <div className="space-y-2">
            {" "}
            <label className="block text-stone-400 text-sm font-semibold mb-1 ml-1">
              {" "}
              Recovery Code{" "}
            </label>{" "}
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl px-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm text-center font-mono"
              placeholder="000000"
              maxLength={6}
              required
            />{" "}
          </div>{" "}
          <div className="space-y-2">
            {" "}
            <label className="block text-stone-400 text-sm font-semibold mb-1 ml-1">
              {" "}
              New Password{" "}
            </label>{" "}
            <div className="relative group">
              {" "}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {" "}
                <Lock
                  className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                  size={18}
                />{" "}
              </div>{" "}
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="********"
                required
              />{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white font-bold tracking-tight py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {" "}
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {" "}
                <span className="text-sm uppercase ">
                  {" "}
                  Reset Password{" "}
                </span>{" "}
                <Check size={16} />{" "}
              </>
            )}{" "}
          </button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
export default ResetPassword;
