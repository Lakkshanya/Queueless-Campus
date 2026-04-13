import React, { useState, useEffect } from "react";
import api from "./services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  Activity,
  Zap,
  Info,
  Layers,
  Monitor,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
const AnalyticsPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, peakRes, perfRes] = await Promise.all([
          api.get("/analytics/dashboard"),
          api.get("/analytics/peak-hours"),
          api.get("/analytics/staff-performance"),
        ]);
        setDashboardStats(statsRes.data);
        setPeakHours(
          peakRes.data.map((count, hour) => ({ hour: `${hour}:00`, count })),
        );
        setPerformance(perfRes.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        {" "}
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />{" "}
        <p className="text-stone-500 text-xs font-bold tracking-tight animate-pulse">
          {" "}
          Aggregating Grid Metrics...{" "}
        </p>{" "}
      </div>
    );
  return (
    <div className="space-y-12 animate-in font-display">
      {" "}
      {/* Header */}{" "}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        {" "}
        <div>
          {" "}
          <div className="flex items-center gap-3 text-orange-600 text-xs font-bold tracking-tight mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10">
            {" "}
            <BarChart3 size={12} strokeWidth={3} /> Data Intelligence
            Engine{" "}
          </div>{" "}
          <h1 className="text-5xl font-bold tracking-tight text-white leading-none">
            {" "}
            Global Analytics{" "}
          </h1>{" "}
          <p className="text-stone-500 text-xs font-bold tracking-tight mt-6 max-w-xl leading-relaxed">
            {" "}
            Monitor real-time queue density, terminal efficiency, and personnel
            performance across the administrative grid.{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4 bg-[#171412] px-6 py-4 rounded-2xl border border-stone-800/60 shadow-2xl overflow-hidden group">
          {" "}
          <div
            className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
          />{" "}
          <span className="text-xs font-bold tracking-tight text-stone-600">
            {" "}
            Sync_Active: Real-time{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Primary Metrics */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {" "}
        {[
          {
            label: "Total Tokens",
            value: dashboardStats?.totalTokensToday || 0,
            icon: <Layers size={20} />,
            color: "orange",
          },
          {
            label: "Completed",
            value: dashboardStats?.completedToday || 0,
            icon: <CheckCircle2 size={20} />,
            color: "emerald",
          },
          {
            label: "Pending Grid",
            value: dashboardStats?.pendingToday || 0,
            icon: <Activity size={20} />,
            color: "blue",
          },
          {
            label: "Avg Process Time",
            value: `${dashboardStats?.avgWaitTime || 0}M`,
            icon: <Clock size={20} />,
            color: "stone",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-[#171412] border border-stone-800/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-orange-600/30 hover:translate-y-[-5px] shadow-2xl relative overflow-hidden"
          >
            {" "}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color === "orange" ? "orange" : stat.color === "emerald" ? "emerald" : "blue"}-600/[0.03] blur-[50px] pointer-events-none`}
            />{" "}
            <div className="flex justify-between items-start mb-10">
              {" "}
              <div className="w-14 h-14 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                {" "}
                {stat.icon}{" "}
              </div>{" "}
              <div className="text-xs font-bold tracking-tight text-stone-800 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full">
                {" "}
                Live{" "}
              </div>{" "}
            </div>{" "}
            <p className="text-xs font-bold tracking-tight text-stone-700 mb-2">
              {" "}
              {stat.label}{" "}
            </p>{" "}
            <h3 className="text-4xl font-bold tracking-tight text-white leading-none">
              {" "}
              {stat.value}{" "}
            </h3>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {" "}
        {/* Peak Hours Chart */}{" "}
        <div className="lg:col-span-8 bg-[#171412] border border-stone-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          {" "}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/[0.02] blur-[100px] pointer-events-none" />{" "}
          <div className="flex justify-between items-center mb-12">
            {" "}
            <div className="flex items-center gap-6">
              {" "}
              <div className="w-14 h-14 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600">
                {" "}
                <Activity size={24} strokeWidth={2.5} />{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-2xl font-bold tracking-tight text-white font-display">
                  {" "}
                  Peak Load Density{" "}
                </h3>{" "}
                <p className="text-stone-700 text-xs font-bold tracking-tight mt-2 ml-1 italic">
                  {" "}
                  Daily token distribution across operating hours{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="h-[400px] w-full relative z-10">
            {" "}
            <ResponsiveContainer width="100%" height="100%">
              {" "}
              <AreaChart data={peakHours}>
                {" "}
                <defs>
                  {" "}
                  <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                    {" "}
                    <stop
                      offset="5%"
                      stopColor="#EA580C"
                      stopOpacity={0.4}
                    />{" "}
                    <stop
                      offset="95%"
                      stopColor="#EA580C"
                      stopOpacity={0}
                    />{" "}
                  </linearGradient>{" "}
                </defs>{" "}
                <CartesianGrid
                  strokeDasharray="10 10"
                  stroke="#1C1917"
                  vertical={false}
                />{" "}
                <XAxis
                  dataKey="hour"
                  stroke="#292524"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontWeight: 900, fill: "#44403C" }}
                />{" "}
                <YAxis
                  stroke="#292524"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontWeight: 900, fill: "#44403C" }}
                />{" "}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171412",
                    border: "1px solid #292524",
                    borderRadius: "1.5rem",
                    padding: "1.5rem",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                  }}
                  itemStyle={{
                    color: "#FAFAF9",
                    fontWeight: 900,
                    fontSize: "12px",
                    textTransform: "",
                  }}
                  labelStyle={{
                    color: "#EA580C",
                    fontWeight: 900,
                    marginBottom: "8px",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                  }}
                  cursor={{
                    stroke: "#EA580C",
                    strokeWidth: 2,
                    strokeDasharray: "6 6",
                  }}
                />{" "}
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#EA580C"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#loadGrad)"
                  animationDuration={2500}
                  activeDot={{
                    r: 8,
                    fill: "#EA580C",
                    stroke: "#FAFAF9",
                    strokeWidth: 3,
                  }}
                />{" "}
              </AreaChart>{" "}
            </ResponsiveContainer>{" "}
          </div>{" "}
        </div>{" "}
        {/* Staff Performance */}{" "}
        <div className="lg:col-span-4 bg-[#171412] border border-stone-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          {" "}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[80px] pointer-events-none" />{" "}
          <div className="flex items-center gap-6 mb-12 pb-12 border-b border-stone-800/40">
            {" "}
            <div className="w-14 h-14 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-blue-500 shadow-inner">
              {" "}
              <Users size={24} strokeWidth={2.5} />{" "}
            </div>{" "}
            <div>
              {" "}
              <h3 className="text-2xl font-bold tracking-tight text-white font-display">
                {" "}
                Personnel Throughput{" "}
              </h3>{" "}
              <p className="text-stone-700 text-xs font-bold tracking-tight mt-2 ml-1 italic">
                {" "}
                Load distribution per authorized operator{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="space-y-10">
            {" "}
            {performance.length > 0 ? (
              performance.map((staff, i) => (
                <div key={i} className="group/perf">
                  {" "}
                  <div className="flex justify-between items-end mb-4">
                    {" "}
                    <span className="text-xs font-bold tracking-tight text-[#D6D3D1] group-hover/perf:text-orange-500 transition-colors duration-500 truncate max-w-[150px]">
                      {" "}
                      {staff.name}{" "}
                    </span>{" "}
                    <span className="text-sm font-bold tracking-tight text-white">
                      {" "}
                      {staff.count} TOKENS{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="w-full bg-[#0C0A09] h-3 rounded-full overflow-hidden border border-stone-800/60 shadow-inner p-0.5">
                    {" "}
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-[3s]"
                      style={{
                        width: `${(staff.count / (dashboardStats?.totalTokensToday || 1)) * 100}%`,
                      }}
                    />{" "}
                  </div>{" "}
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-20 flex flex-col items-center gap-6 grayscale filter">
                {" "}
                <Users size={48} strokeWidth={1} />{" "}
                <p className="text-xs font-bold tracking-tight">
                  Personnel Offline
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
          <div className="mt-16 p-6 bg-stone-900/40 border border-stone-800/60 rounded-3xl relative overflow-hidden group/alert flex items-center gap-6">
            {" "}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600" />{" "}
            <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
              {" "}
              <Zap size={22} strokeWidth={3} className="animate-pulse" />{" "}
            </div>{" "}
            <p className="text-xs text-stone-500 font-bold tracking-tight leading-relaxed flex-1 italic">
              {" "}
              System Recommendation: Optimized allocation detected for Unit-04
              based on surge patterns.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default AnalyticsPage;
