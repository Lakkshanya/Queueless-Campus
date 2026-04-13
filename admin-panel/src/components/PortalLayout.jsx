import React from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BarChart3,
  Layers,
  Database,
  Users,
  Monitor,
  Activity,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Zap,
  ShieldCheck,
} from "lucide-react";
import DashboardStatus from "./DashboardStatus";
const PortalLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const navLinks = [
    {
      to: "/admin/dashboard",
      icon: <BarChart3 size={20} />,
      label: "Dashboard",
      roles: ["admin"],
    },
    {
      to: "/admin/counters",
      icon: <Layers size={20} />,
      label: "Counters",
      roles: ["admin"],
    },
    {
      to: "/admin/services",
      icon: <Database size={20} />,
      label: "Services",
      roles: ["admin"],
    },
    {
      to: "/admin/staff",
      icon: <Users size={20} />,
      label: "Staff Management",
      roles: ["admin"],
    },
    {
      to: "/admin/notifications",
      icon: <Bell size={20} />,
      label: "Notifications",
      roles: ["admin"],
    },
    {
      to: "/admin/analytics",
      icon: <Activity size={20} />,
      label: "Analytics",
      roles: ["admin"],
    },
    {
      to: "/staff/dashboard",
      icon: <BarChart3 size={20} />,
      label: "Dashboard",
      roles: ["staff"],
    },
    {
      to: "/staff/queue",
      icon: <Monitor size={20} />,
      label: "Queue Handling",
      roles: ["staff"],
    },
    {
      to: "/staff/notifications",
      icon: <Bell size={20} />,
      label: "Notifications",
      roles: ["staff"],
    },
  ];
  const filteredLinks = navLinks.filter((link) =>
    link.roles.includes(user.role),
  );
  return (
    <div className="h-screen w-full bg-[#0C0A09] text-[#FAFAF9] font-display flex overflow-hidden selection:bg-orange-600/30">
      {" "}
      {/* Sidebar */}{" "}
      <aside className="w-80 h-full bg-[#171412] border-r border-stone-800/40 flex flex-col sticky top-0 z-50 overflow-hidden shadow-[20px_0_50px_-10px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-transparent opacity-50" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-600/5 blur-[120px] pointer-events-none" />
        <div className="p-8 flex-1 flex flex-col min-h-0">
          <header className="mb-10 animate-in">
            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard"}
              className="flex items-center gap-4 group"
            >
              <div className="p-3 bg-orange-600 rounded-2xl shadow-[0_10px_30px_-5px_rgba(234,88,12,0.4)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none font-display">
                  Queue Less
                </h1>
                <p className="text-[10px] font-bold tracking-widest text-[#EA580C] mt-2 uppercase opacity-60">
                  Queueless System
                </p>
              </div>
            </Link>
          </header>
          <nav className="flex-1 overflow-y-auto custom-scrollbar-thin pr-2 space-y-2.5">
            {filteredLinks.map((link, idx) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? "bg-orange-600 text-white shadow-lg" : "text-stone-500 hover:text-stone-300 hover:bg-stone-900/50"}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      {link.icon}
                    </div>
                    <span className="text-xs font-bold tracking-tight">
                      {link.label}
                    </span>
                  </div>
                  {isActive && <ChevronRight size={14} className="animate-in" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-8 pt-0 space-y-6">
          <div className="bg-stone-900/40 border border-stone-800/60 rounded-2xl p-4 transition-all hover:border-orange-600/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-orange-600 font-bold tracking-tight shadow-inner">
                {user.name?.charAt(0).toUpperCase() || <User size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-tight text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] font-bold tracking-tight text-stone-600 mt-0.5 uppercase">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-bold tracking-tight uppercase hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95 group"
          >
            <LogOut size={12} strokeWidth={3} />
            Sign Out
          </button>
        </div>
      </aside>{" "}
      {/* Main Content */}{" "}
      <main className="flex-1 flex flex-col relative bg-[#0C0A09] overflow-hidden">
        {" "}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 scroll-smooth">
          {" "}
          <div className="animate-in relative z-10">
            {" "}
            <Outlet />{" "}
          </div>{" "}
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-orange-600/[0.02] blur-[150px] pointer-events-none" />{" "}
        </div>{" "}
      </main>{" "}
      <style
        dangerouslySetInnerHTML={{
          __html: ` .custom-scrollbar::-webkit-scrollbar { width: 5px;} .custom-scrollbar::-webkit-scrollbar-track { background: transparent;} .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09;} .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C;}`,
        }}
      />{" "}
    </div>
  );
};
export default PortalLayout;
