import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Mail, ArrowLeft, Send, Loader2 } from "lucide-react";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      alert("Verification code sent to your email.");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 font-sans selection:bg-orange-600/30">
      {" "}
      <div className="max-w-sm w-full bg-[#1C1917] rounded-2xl p-6 border border-stone-800/60 shadow-xl">
        {" "}
        <Link
          to="/login"
          className="inline-flex items-center text-stone-500 hover:text-white transition-colors mb-6"
        >
          {" "}
          <ArrowLeft size={20} className="mr-2" /> Back to Login{" "}
        </Link>{" "}
        <div className="text-center mb-8">
          {" "}
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Reset Password
          </h1>{" "}
          <p className="text-stone-500 text-sm">
            {" "}
            Enter your email address and we'll send you a code to reset your
            password.{" "}
          </p>{" "}
        </div>{" "}
        <form onSubmit={handleSendOtp} className="space-y-6">
          {" "}
          <div className="space-y-2">
            {" "}
            <label className="block text-stone-400 text-sm font-semibold mb-1 ml-1">
              {" "}
              Email Address{" "}
            </label>{" "}
            <div className="relative group">
              {" "}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {" "}
                <Mail
                  className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                  size={18}
                />{" "}
              </div>{" "}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="w-full bg-[#1C1917] border border-stone-800 rounded-2xl pl-12 pr-5 py-4 text-[#FAFAF9] focus:outline-none focus:border-[#9A3412] transition-all placeholder-stone-700 text-sm"
                placeholder="name@campus.com"
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
                <span className="text-sm uppercase "> Send Code </span>{" "}
                <Send size={16} />{" "}
              </>
            )}{" "}
          </button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
export default ForgotPassword;
