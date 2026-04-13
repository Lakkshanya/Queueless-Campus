import React, { useState, useEffect } from "react";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Radio,
  Power,
  Users,
  Clock,
  Zap,
  ShieldCheck,
  ChevronRight,
  Monitor,
  AlertCircle,
} from "lucide-react";

const LiveMonitoring = () => {
  const { user } = useAuth();
  const [counters, setCounters] = useState([]);
  const [tokenStats, setTokenStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      const [countersRes, statsRes] = await Promise.all([
        api.get("/counters"),
        api.get("/tokens/admin/stats"),
      ]);
      setCounters(countersRes.data);
      setTokenStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 10000); // 10s refresh for "live" feel
    return () => clearInterval(interval);
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#1F1D1B] flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
        <p className="text-[#D6D3D1] text-xs font-bold tracking-tight opacity-40">
          Synchronizing Global Stream...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-5">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-xs font-bold tracking-tight mb-4">
                <Monitor size={14} strokeWidth={3} /> Strategic Operations
                Center
              </div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-white">
                Live Monitoring
              </h1>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#1C1917] px-5 py-5 rounded-xl border border-stone-800 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute top-0 -right-0 transition-opacity" />
              <div className="w-10 h-10 rounded-2xl bg-red-950/20 flex items-center justify-center text-red-500">
                <Radio size={20} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-tight text-stone-600">
                  Secure Stream
                </p>
                <p className="text-xs font-bold tracking-tight text-white">
                  Active Feed: High Bandwidth
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {counters.map((counter) => (
            <div
              key={counter._id}
              className="group bg-[#1C1917] rounded-2xl p-6 border border-stone-800/50 hover:border-[#9A3412]/30 transition-all shadow-xl relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#9A3412] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity blur-3xl pointer-events-none" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-20 h-20 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-[#FAFAF9] group-hover:text-[#9A3412] transition-colors shadow-inner">
                  <span className="text-xl font-bold tracking-tight ">
                    {(counter.number || 0).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-tight ${counter.status === "active" ? "bg-green-950/20 text-green-500 border-green-900/30" : "bg-red-950/20 text-red-500 border-red-900/30"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${counter.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                    />
                    {counter.status === "active" ? "Operational" : "Idle"}
                  </div>
                  <p className="text-xs text-stone-600 mt-4 font-bold tracking-tight pr-2">
                    {counter.service?.name || "General Operations"}
                  </p>
                </div>
              </div>
              <div className="space-y-8 mb-6 relative z-10 flex-1">
                <div className="bg-[#1F1D1B] p-5 rounded-2xl border border-stone-800/50 group-hover:border-[#9A3412]/20 transition-all">
                  <p className="text-xs text-stone-600 mb-4 font-bold tracking-tight">
                    Counter Load Activity
                  </p>
                  {counter.currentToken ? (
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold tracking-tight text-[#9A3412] ">
                        {counter.currentToken.number}
                      </h2>
                      <div className="w-12 h-12 rounded-2xl bg-[#9A3412]/10 border border-[#9A3412]/20 flex items-center justify-center text-[#9A3412]">
                        <Zap size={24} className="animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-stone-800">
                      <Clock size={28} strokeWidth={1} />
                      <p className="text-lg font-bold tracking-tight opacity-30">
                        Counter Idle
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-900 rounded-2xl border border-stone-800/50 flex items-center justify-center text-stone-600 group-hover:text-[#FAFAF9] transition-colors">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-stone-700 mb-1 font-bold tracking-tight">
                        Staff In-Charge
                      </p>
                      <p className="text-sm font-bold tracking-tight text-[#FAFAF9] group-hover:text-[#9A3412] transition-colors">
                        {counter.staff?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-700 mb-1 font-bold tracking-tight">
                      Queue Backlog
                    </p>
                    <p className="text-lg font-bold tracking-tight text-[#FAFAF9] ">
                      {counter.workload || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-stone-800/50 flex items-center justify-between text-xs font-bold tracking-tight text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} className="text-[#9A3412]" /> Load
                  Index:{" "}
                  {Math.min(100, (counter.workload || 0) * 12.5).toFixed(1)}%
                </div>
                <span className="text-[#9A3412]">Nominal Status</span>
              </div>
            </div>
          ))}
        </div>

        {counters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-48 opacity-20 group">
            <div className="w-16 h-16 bg-stone-900 border-4 border-stone-800 rounded-full border-t-[#9A3412] animate-spin mb-10 shadow-2xl" />
            <div className="text-center">
              <AlertCircle size={32} className="mx-auto mb-6 text-stone-800" />
              <h2 className="text-xl font-bold tracking-tight text-stone-800">
                Searching Network
              </h2>
              <p className="mt-4 text-xs font-bold tracking-tight text-stone-900">
                Scanning for active terminal nodes in the campus network...
              </p>
            </div>
          </div>
        )}

        {/* Global Overview Section */}
        <div className="mt-20 bg-[#1C1917] p-6 rounded-3xl border border-stone-800/50 flex flex-col lg:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.01] blur-[150px] pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-tight text-stone-600">
                Total Counters
              </p>
              <p className="text-lg font-bold tracking-tight text-[#FAFAF9]">
                {counters.length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-tight text-stone-600">
                Active Operators
              </p>
              <p className="text-lg font-bold tracking-tight text-[#9A3412]">
                {counters.filter((c) => c.status === "active").length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-tight text-stone-600">
                Total Enqueued
              </p>
              <p className="text-lg font-bold tracking-tight text-[#FAFAF9]">
                {counters.reduce((acc, c) => acc + (c.workload || 0), 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-tight text-stone-600">
                System Pulse
              </p>
              <div className="flex items-center gap-3">
                <Activity size={24} className="text-green-500 animate-pulse" />
                <p className="text-lg font-bold tracking-tight text-green-500">
                  Optimal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Statistics Section */}
        {tokenStats && (
          <div className="mt-8 mb-8 bg-[#1C1917] p-6 rounded-3xl border border-stone-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-[0.03] blur-[150px] pointer-events-none" />
            <div className="mb-10 relative z-10">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Token Analytics
              </h2>
              <p className="text-xs text-stone-600 mt-2 font-bold tracking-tight">
                System-wide Token Metrics
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-6 relative z-10">
              <div className="bg-stone-900/50 p-6 rounded-3xl border border-stone-800/50">
                <p className="text-xs font-bold tracking-tight text-stone-500 mb-2">
                  Total Tokens
                </p>
                <p className="text-xl font-bold tracking-tight text-white">
                  {tokenStats.totalTokens}
                </p>
              </div>
              <div className="bg-stone-900/50 p-6 rounded-3xl border border-stone-800/50">
                <p className="text-xs font-bold tracking-tight text-stone-500 mb-2">
                  Served
                </p>
                <p className="text-xl font-bold tracking-tight text-green-500">
                  {tokenStats.servedTokens}
                </p>
              </div>
              <div className="bg-stone-900/50 p-6 rounded-3xl border border-stone-800/50">
                <p className="text-xs font-bold tracking-tight text-stone-500 mb-2">
                  Serving
                </p>
                <p className="text-xl font-bold tracking-tight text-[#9A3412]">
                  {tokenStats.servingTokens}
                </p>
              </div>
              <div className="bg-stone-900/50 p-6 rounded-3xl border border-stone-800/50">
                <p className="text-xs font-bold tracking-tight text-stone-500 mb-2">
                  Waiting
                </p>
                <p className="text-xl font-bold tracking-tight text-blue-500">
                  {tokenStats.waitingTokens}
                </p>
              </div>
              <div className="bg-stone-900/50 p-6 rounded-3xl border border-stone-800/50">
                <p className="text-xs font-bold tracking-tight text-stone-500 mb-2">
                  Cancelled
                </p>
                <p className="text-xl font-bold tracking-tight text-red-500">
                  {tokenStats.missedTokens}
                </p>
              </div>
            </div>
            <div className="bg-stone-900/80 rounded-2xl border border-stone-800/50 p-5 shadow-inner overflow-x-auto relative z-10">
              <p className="text-xs font-bold tracking-tight text-stone-400 mb-6 px-4">
                Recent Token Activity
              </p>
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-stone-800/40 opacity-70">
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Token ID
                    </th>
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Student
                    </th>
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Service
                    </th>
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Counter
                    </th>
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Status
                    </th>
                    <th className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                      Time Issued
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/20">
                  {tokenStats.recentTokens.map((t) => (
                    <tr
                      key={t._id}
                      className="hover:bg-stone-800/20 transition-colors group/row"
                    >
                      <td className="px-4 py-4 text-xs font-bold tracking-tight text-white">
                        {t.number}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold tracking-tight text-stone-400">
                        {t.student?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold tracking-tight text-stone-400">
                        {t.service?.name || "-"}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold tracking-tight text-stone-400">
                        {t.counter ? `TERM #${t.counter.number}` : "Unassigned"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight border shadow-sm ${t.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" : t.status === "serving" ? "bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/20" : t.status === "waiting" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold tracking-tight text-stone-500">
                        {new Date(t.bookedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {tokenStats.recentTokens.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-xs text-stone-600 font-bold tracking-tight"
                      >
                        No recent token activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring;
