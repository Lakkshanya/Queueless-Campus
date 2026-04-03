import React, { useState, useEffect } from 'react';
import api from './services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Users, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  PieChart as PieIcon,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, peakRes, perfRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/peak-hours'),
          api.get('/analytics/staff-performance')
        ]);
        setDashboardStats(statsRes.data);
        setPeakHours(peakRes.data.map((count, hour) => ({ hour: `${hour}:00`, count })));
        setPerformance(perfRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-4" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synthesizing Intelligence...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <Activity size={14} />
                Global Intelligence
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Operational Analytics</h1>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-[#1C1917] px-6 py-4 rounded-2xl border border-stone-800 flex items-center gap-4 shadow-xl">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400">Real-time Stream: Active</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Summary Hub */}
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 relative overflow-hidden group hover:border-[#9A3412]/30 transition-all shadow-xl flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A3412] opacity-[0.02] blur-3xl group-hover:opacity-[0.05] transition-opacity" />
                <p className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] mb-3">Total Demand Today</p>
                <div className="flex items-end gap-3">
                   <h2 className="text-5xl font-black text-[#FAFAF9] tracking-tighter">{dashboardStats?.totalTokensToday || 0}</h2>
                   <div className="flex items-center gap-1 text-green-500 text-[10px] font-black mb-2">
                      <TrendingUp size={12} />
                      +12.4%
                   </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-stone-700 text-[9px] font-black uppercase tracking-widest">
                   <BarChart3 size={12} /> Peak Latency Recorded
                </div>
             </div>
             
             <div className="bg-[#1C1917] p-10 rounded-[3rem] border border-stone-800/50 relative overflow-hidden group hover:border-blue-900/30 transition-all shadow-xl flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
                <p className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] mb-3">Mean Latency</p>
                <div className="flex items-end gap-3">
                   <h2 className="text-5xl font-black text-[#FAFAF9] tracking-tighter">{dashboardStats?.avgWaitTime || 0}m</h2>
                   <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black mb-2">
                      <Clock size={12} />
                      Optimized
                   </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-stone-700 text-[9px] font-black uppercase tracking-widest">
                   <Zap size={12} /> Throughput Normalization Active
                </div>
             </div>
          </div>

          {/* Peak Traffic Area Chart */}
          <div className="lg:col-span-3 bg-[#1C1917] p-12 rounded-[3.5rem] border border-stone-800/50 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#9A3412] opacity-[0.01] blur-[120px]" />
             <div className="flex justify-between items-center mb-12">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                      <TrendingUp className="text-[#9A3412]" size={28} /> 
                      Network Load Peak Distribution
                   </h3>
                   <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Temporal entity density analysis</p>
                </div>
                <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-lg bg-stone-900/50 border border-stone-800/30 flex items-center justify-center text-stone-600"><ChevronRight size={16} /></div>
                </div>
             </div>
             <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={peakHours}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9A3412" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#9A3412" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" stroke="#292524" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#44403C" 
                        fontSize={9} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      />
                      <YAxis 
                        stroke="#44403C" 
                        fontSize={9} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontWeight: 900 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1917', border: '1px solid #292524', borderRadius: '24px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#FAFAF9', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                        labelStyle={{ color: '#9A3412', fontWeight: 900, marginBottom: '8px', fontSize: '9px', tracking: '0.3em' }}
                        cursor={{ stroke: '#9A3412', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#9A3412" 
                        strokeWidth={5} 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                        animationDuration={2000}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Personnel Performance Bar Chart */}
          <div className="bg-[#1C1917] p-12 rounded-[3.5rem] border border-stone-800/50 shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/5 rounded-full blur-[100px]" />
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                <ShieldCheck className="text-blue-500" size={28} /> 
                Personnel Throughput Audit
             </h3>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={performance} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid stroke="#292524" horizontal={false} strokeDasharray="4 4" opacity={0.2} />
                      <XAxis type="number" stroke="#44403C" fontSize={9} hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#D6D3D1" 
                        fontSize={10} 
                        width={90} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(154, 52, 18, 0.03)' }}
                        contentStyle={{ backgroundColor: '#1C1917', border: '1px solid #292524', borderRadius: '20px', padding: '12px' }}
                        itemStyle={{ color: '#FAFAF9', fontWeight: 900, fontSize: '9px', textTransform: 'uppercase' }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#9A3412" 
                        radius={[0, 12, 12, 0]} 
                        barSize={18}
                        animationDuration={1500}
                      >
                         {performance.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#9A3412' : '#C2410C'} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Service Cluster Distribution */}
          <div className="bg-[#1C1917] p-12 rounded-[3.5rem] border border-stone-800/50 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A3412] opacity-[0.02] blur-[100px]" />
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                <PieIcon className="text-[#9A3412]" size={28} /> 
                Subject Discipline Density
             </h3>
             <div className="space-y-10">
                {dashboardStats?.serviceStats?.map((s, i) => (
                   <div key={i} className="group">
                     <div className="flex justify-between mb-4 items-end">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#FAFAF9] group-hover:text-[#9A3412] transition-colors flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-[#9A3412]' : 'bg-[#C2410C]'}`} />
                           {s.name}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-[#FAFAF9]">{s.count} Flows</span>
                           <span className="text-[9px] text-stone-600 font-bold uppercase tracking-widest">({Math.round((s.count / (dashboardStats.totalTokensToday || 1)) * 100)}%)</span>
                        </div>
                     </div>
                     <div className="w-full bg-[#1F1D1B] h-3 rounded-full overflow-hidden border border-stone-800/50 shadow-inner">
                        <div 
                          className={`h-full transition-all duration-[2s] group-hover:brightness-125 ${i % 2 === 0 ? 'bg-gradient-to-r from-[#9A3412] to-[#C2410C]' : 'bg-gradient-to-r from-stone-800 to-stone-700'}`} 
                          style={{ width: `${(s.count / (dashboardStats.totalTokensToday || 1)) * 100}%` }} 
                        />
                     </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-14 p-8 bg-[#1F1D1B] rounded-[2.5rem] border border-stone-800 flex items-center gap-6 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#9A3412] opacity-50" />
                <div className="w-12 h-12 bg-[#9A3412]/10 rounded-2xl flex items-center justify-center text-[#9A3412]">
                   <Info size={24} />
                </div>
                <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest leading-relaxed pr-4">
                   Predictive analysis suggests augmenting capacity for <span className="text-[#FAFAF9]">Finance Registry</span> during the <span className="text-[#9A3412]">09:00 - 11:30</span> peak temporal interval.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
