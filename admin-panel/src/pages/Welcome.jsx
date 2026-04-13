import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Monitor,
  Zap,
  ArrowUpRight,
} from "lucide-react";
const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-between py-5 px-6 font-sans relative overflow-hidden">
      {" "}
      {/* Background Ambience */}{" "}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#9A341215,transparent_50%)]" />{" "}
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-[#9A3412]/5 blur-[100px] rounded-full" />{" "}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl text-center relative z-10">
        {" "}
        {/* Animated Brand Mark */}{" "}
        <div className="relative mb-6 group">
          {" "}
          <div className="w-20 h-20 bg-gradient-to-br from-[#9A3412] to-[#7C2D12] rounded-2xl rotate-12 flex items-center justify-center shadow-[0_20px_50px_rgba(154,52,18,0.3)] border border-[#9A3412]/20 animate-in zoom-in-50 duration-700">
            {" "}
            <div className="text-white text-lg font-bold tracking-tight -rotate-12 drop-shadow-2xl select-none">
              {" "}
              Q{" "}
            </div>{" "}
          </div>{" "}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#292524] border border-stone-800 rounded-xl flex items-center justify-center shadow-lg animate-bounce duration-[2000ms]">
            {" "}
            <Zap
              className="text-[#9A3412]"
              size={18}
              fill="currentColor"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
          {" "}
          <h1 className="text-[#FAFAF9] text-xl font-bold tracking-tight lowercase flex items-center gap-1">
            {" "}
            queue{" "}
            <span className="text-[#9A3412] font-bold tracking-tight text-lg tracking-normal">
              {" "}
              Less{" "}
            </span>{" "}
          </h1>{" "}
          <p className="text-[#9A3412] text-xs mb-6 font-bold tracking-tight opacity-90 flex items-center justify-center gap-3">
            {" "}
            <span className="h-[1px] w-4 bg-[#9A3412]/30"></span> Campus
            Administration v2.0{" "}
            <span className="h-[1px] w-4 bg-[#9A3412]/30"></span>{" "}
          </p>{" "}
          <p className="text-[#D6D3D1] text-lg mb-6 leading-relaxed font-medium px-5 opacity-80 max-w-md mx-auto">
            {" "}
            Manage campus operations with ease. Coordinate staff, monitor
            service queues, and verify student records in one professional
            dashboard.{" "}
          </p>{" "}
        </div>{" "}
        {/* Feature Highlights */}{" "}
        <div className="grid grid-cols-2 gap-4 w-full mb-6 animate-in fade-in duration-1000 delay-500">
          {" "}
          <div className="bg-[#292524]/50 border border-stone-800 p-4 rounded-2xl flex flex-col items-center gap-2">
            {" "}
            <ShieldCheck className="text-[#9A3412]" size={20} />{" "}
            <span className="text-[#FAFAF9] text-xs font-bold tracking-tight">
              {" "}
              Admin Control{" "}
            </span>{" "}
          </div>{" "}
          <div className="bg-[#292524]/50 border border-stone-800 p-4 rounded-2xl flex flex-col items-center gap-2">
            {" "}
            <Monitor className="text-[#9A3412]" size={20} />{" "}
            <span className="text-[#FAFAF9] text-xs font-bold tracking-tight">
              {" "}
              Live Analytics{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-700 delay-700">
        {" "}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white py-6 rounded-2xl font-bold tracking-tight text-xs flex items-center justify-center shadow-2xl shadow-orange-950/40 transition-all group relative overflow-hidden"
        >
          {" "}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>{" "}
          Get Started{" "}
          <ArrowUpRight className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />{" "}
        </button>{" "}
        <p className="mt-8 text-stone-600 text-xs font-bold tracking-tight text-center">
          {" "}
          Authorized Campus Staff Only{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
};
export default Welcome;
