import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Users,
  Search,
  UserPlus,
  Building,
  Activity,
  Mail,
  Settings2,
  Monitor,
  UserX,
  UserCheck,
  Trash2,
  X,
  ShieldCheck,
  Briefcase,
  Tag,
  CheckCircle2,
  ChevronRight,
  Filter,
  Check,
  User,
  ArrowRight,
  ShieldAlert,
  Database,
  Zap,
} from "lucide-react";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1); // 1: Search/Filter, 2: Select Service, 3: Confirm
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [hoveredStaff, setHoveredStaff] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const fetchData = async () => {
    try {
      const [staffRes, userRes, counterRes, serviceRes] = await Promise.all([
        api.get("/auth/staff"),
        api.get("/auth/users"),
        api.get("/counters"),
        api.get("/services"),
      ]);
      setStaff(staffRes.data);
      setAllUsers(userRes.data);
      setCounters(counterRes.data);
      setServices(serviceRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStaff = async () => {
    if (!selectedUser || !selectedServiceId) return;
    try {
      // Assign service directly to the existing staff candidate
      await api.post("/auth/assign-services", {
        staffId: selectedUser._id,
        serviceIds: [selectedServiceId],
      });
      setIsAddModalOpen(false);
      setAddStep(1);
      resetAddState();
      fetchData();
      // Provide a clean confirmation message
      alert(
        `System Update: ${selectedUser.name} has been successfully authorized and assigned to the selected service nodes.`,
      );
    } catch (error) {
      alert(
        `Operational Conflict: ${error.response?.data?.message || "The network was unable to finalize this assignment at this time."}`,
      );
    }
  };

  const handleUpdateServices = async () => {
    if (!selectedStaff) return;
    try {
      await api.post("/auth/assign-services", {
        staffId: selectedStaff._id,
        serviceIds: selectedServiceIds,
      });
      setIsServiceModalOpen(false);
      fetchData();
      alert(
        "Operational protocols updated: Personnel re-allocation has been successfully deployed across the grid.",
      );
    } catch (error) {
      alert(
        "Critical Error: Failed to synchronize re-allocation with the server.",
      );
    }
  };

  const resetAddState = () => {
    setSelectedUser(null);
    setSelectedServiceId("");
    setAddStep(1);
    setUserSearch("");
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Confirm permanent revocation of staff access?"))
      return;
    try {
      await api.delete(`/auth/staff/${id}`);
      fetchData();
    } catch (error) {
      alert("Deletion failed");
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const candidates = allUsers.filter(
    (u) =>
      u.role === "staff" &&
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())) &&
      (deptFilter ? u.department === deptFilter : true),
  );

  const departments = [
    ...new Set(allUsers.map((u) => u.department).filter(Boolean)),
  ];

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
        <p className="text-stone-500 text-xs font-bold tracking-tight animate-pulse">
          Analyzing Personnel Grid...
        </p>
      </div>
    );

  return (
    <div className="space-y-12 animate-in font-display">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-orange-600 text-xs font-bold tracking-tight mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10">
            <Users size={12} strokeWidth={3} /> Human Capital Management
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-none">
            Administrative Staff
          </h1>
          <p className="text-stone-500 text-xs font-bold tracking-tight mt-6 max-w-xl leading-relaxed">
            Manage operational personnel, terminal permissions, and service
            protocol assignments across the campus hierarchy.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none transform transition-all focus-within:scale-105">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-700"
              size={16}
            />
            <input
              type="text"
              placeholder="Filter Personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-72 bg-[#171412] border border-stone-800/60 p-5 pl-14 rounded-2xl outline-none text-xs font-bold tracking-tight text-white placeholder-stone-800 focus:border-orange-600/40 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              resetAddState();
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white p-5 px-8 rounded-2xl font-bold tracking-tight text-xs transition-all shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] flex items-center gap-4 active:scale-95 group"
          >
            <UserPlus size={18} strokeWidth={3} /> Recruit Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#171412] rounded-[3rem] border border-stone-800/40 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 blur-[150px] pointer-events-none" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-800/40 bg-stone-900/30 backdrop-blur-xl">
                <th className="p-8 text-xs font-bold tracking-tight text-stone-600">
                  Personnel Profile
                </th>
                <th className="p-8 text-xs font-bold tracking-tight text-stone-600">
                  Active Service
                </th>
                <th className="p-8 text-xs font-bold tracking-tight text-stone-600">
                  Terminal Unit
                </th>
                <th className="p-8 text-xs font-bold tracking-tight text-stone-600 text-right">
                  Operational Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/10">
              {filteredStaff.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-orange-600/[0.01] transition-colors group relative"
                >
                  <td className="p-8 relative">
                    <div
                      className="flex items-center gap-6 cursor-help"
                      onMouseEnter={() => setHoveredStaff(s._id)}
                      onMouseLeave={() => setHoveredStaff(null)}
                    >
                      <div className="w-16 h-16 rounded-[1.25rem] bg-[#0C0A09] border border-stone-800/80 flex items-center justify-center text-orange-600 font-bold tracking-tight text-lg shadow-inner group-hover:border-orange-600/40 transition-all duration-500">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xl font-bold tracking-tight text-white group-hover:text-orange-500 transition-colors duration-500 leading-none">
                          {s.name}
                        </p>
                        <p className="text-xs text-stone-600 font-bold tracking-tight mt-3 italic">
                          {s.email}
                        </p>
                      </div>
                      {/* Hover Profile Card */}
                      {hoveredStaff === s._id && (
                        <div className="absolute left-80 top-0 z-50 w-72 bg-[#1C1917] border border-stone-800 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-800/60">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse-soft shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                            <span className="text-xs font-bold tracking-tight text-white leading-none">
                              Authorization Active
                            </span>
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-center gap-4 group/item">
                              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-700 group-hover/item:text-orange-600 transition-all shadow-inner">
                                <Building size={16} strokeWidth={2.5} />
                              </div>
                              <div>
                                <p className="text-xs font-bold tracking-tight text-stone-700">
                                  Department
                                </p>
                                <p className="text-xs font-bold tracking-tight text-white mt-0.5">
                                  {s.department || "GENERAL_OPS"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-700 group-hover/item:text-orange-600 transition-all shadow-inner">
                                <Activity size={16} strokeWidth={2.5} />
                              </div>
                              <div>
                                <p className="text-xs font-bold tracking-tight text-stone-700">
                                  Global Rank
                                </p>
                                <p className="text-xs font-bold tracking-tight text-white mt-0.5">
                                  ADMINISTRATOR
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-wrap gap-2.5 max-w-xs">
                      {s.assignedServices?.length > 0 ? (
                        s.assignedServices.map((svc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 px-4 py-2 bg-orange-600/5 border border-orange-600/20 rounded-xl text-xs font-bold tracking-tight text-orange-600 shadow-inner group-hover:border-orange-600/40 transition-all"
                          >
                            <Tag size={12} strokeWidth={3} />
                            {typeof svc === "object"
                              ? svc?.name || "GENERIC_SVC"
                              : "GENERIC_SVC"}
                          </div>
                        ))
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setSelectedServiceIds([]);
                            setIsServiceModalOpen(true);
                          }}
                          className="text-xs font-bold tracking-tight text-orange-600 hover:text-white transition-colors bg-orange-600/5 px-4 py-1.5 rounded-lg border border-orange-600/20"
                        >
                          Allocate Service
                        </button>
                      )}
                      {s.assignedServices?.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setSelectedServiceIds(
                              s.assignedServices.map((svc) =>
                                typeof svc === "object" ? svc._id : svc,
                              ),
                            );
                            setIsServiceModalOpen(true);
                          }}
                          className="bg-stone-900 border border-stone-800 p-2 rounded-lg text-stone-600 hover:text-orange-600 transition-all"
                        >
                          <Settings2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-4 px-5 py-3 bg-stone-950/40 border border-stone-800/80 rounded-2xl w-fit group-hover:border-orange-600/30 transition-all shadow-inner">
                      <Monitor
                        size={16}
                        className="text-stone-700 group-hover:text-orange-600 transition-colors"
                        strokeWidth={2.5}
                      />
                      <span className="text-xs font-bold tracking-tight text-white leading-none">
                        {s.assignedCounter
                          ? `TERM_${typeof s.assignedCounter === "object" ? s.assignedCounter.number : s.assignedCounter}`
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end items-center gap-6">
                      <div
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-full border text-xs font-bold tracking-tight ${s.assignedCounter ? (s.isVerified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-red-500/10 border-red-500/20 text-red-500") : "bg-stone-900 border-stone-800 text-stone-700"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${s.assignedCounter ? (s.isVerified ? "bg-emerald-500 animate-pulse" : "bg-red-500") : "bg-stone-800"}`}
                        />
                        {s.assignedCounter
                          ? s.isVerified
                            ? "Authorized"
                            : "Locked"
                          : "-"}
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(s._id)}
                        className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800/60 flex items-center justify-center text-stone-700 hover:text-red-500 hover:border-red-600/50 hover:bg-red-950/20 transition-all active:scale-90"
                      >
                        <Trash2 size={20} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RE-ALLOCATION MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-[#171412] w-full max-w-xl rounded-[3rem] border border-stone-800 p-6 md:p-10 relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.05] blur-[100px] pointer-events-none" />
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
            <header className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-white font-display">
                Service Allocation
              </h2>
              <p className="text-stone-600 text-xs font-bold tracking-tight mt-3 italic">
                Managing protocols for{" "}
                <span className="text-white">{selectedStaff?.name}</span>
              </p>
            </header>
            <div className="space-y-4 mb-12 overflow-y-auto pr-4 custom-scrollbar">
              {services.map((svc) => {
                const isSelected = selectedServiceIds.includes(svc._id);
                return (
                  <button
                    key={svc._id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServiceIds((prev) =>
                          prev.filter((id) => id !== svc._id),
                        );
                      } else {
                        setSelectedServiceIds((prev) => [...prev, svc._id]);
                      }
                    }}
                    className={`w-full p-6 border rounded-[2rem] flex items-center justify-between transition-all duration-300 shadow-inner ${isSelected ? "bg-orange-600/10 border-orange-600/40" : "bg-stone-900/40 border-stone-800/80 hover:bg-stone-900"}`}
                  >
                    <div className="flex items-center gap-6 text-left">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected ? "bg-orange-600 text-white" : "bg-stone-950 text-stone-700"}`}
                      >
                        <Database size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold tracking-tight font-display ${isSelected ? "text-white" : "text-stone-500"}`}
                        >
                          {svc.name}
                        </p>
                        <span className="text-xs font-bold tracking-tight px-2 py-1 bg-stone-950 rounded-lg text-stone-700 mt-2 block w-fit">
                          {svc.prefix} System
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-orange-600 border-white" : "border-stone-800"}`}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-white"
                          strokeWidth={4}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleUpdateServices}
              className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-bold tracking-tight text-sm text-white shadow-xl transition-all active:scale-[0.98]"
            >
              Finalize and Deploy
            </button>
          </div>
        </div>
      )}

      {/* ADMISSION MODAL (Multi-step) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-[#171412] w-full max-w-2xl rounded-[3rem] border border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative p-8 lg:p-6 md:p-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-[0.05] blur-[100px] pointer-events-none" />
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white hover:bg-red-600 transition-all duration-300"
            >
              <X size={20} />
            </button>
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-10 h-1 rounded-full transition-all duration-500 ${addStep >= step ? "bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]" : "bg-stone-800"}`}
                  />
                ))}
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {addStep === 1
                  ? "Search Personnel"
                  : addStep === 2
                    ? "Protocol Linkage"
                    : "Final Authorization"}
              </h2>
              <p className="text-stone-600 text-xs font-bold tracking-tight mt-3 italic">
                {addStep === 1
                  ? "Filter academic network for eligible candidates"
                  : addStep === 2
                    ? "Select operational service node for operator"
                    : "Validate permanent administrative assignment"}
              </p>
            </header>
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {addStep === 1 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative">
                      <Search
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-700"
                        size={16}
                      />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 p-6 pl-16 rounded-2xl outline-none text-xs font-bold tracking-tight text-white focus:border-orange-600 transition shadow-inner"
                        placeholder="Search Personnel Grid..."
                      />
                    </div>
                    <div className="relative">
                      <Filter
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-700"
                        size={16}
                      />
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 p-6 pl-16 rounded-2xl outline-none text-xs font-bold tracking-tight text-white focus:border-orange-600 transition appearance-none shadow-inner"
                      >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {candidates.length > 0 ? (
                      candidates.slice(0, 5).map((u) => (
                        <button
                          key={u._id}
                          onClick={() => {
                            setSelectedUser(u);
                            setAddStep(2);
                          }}
                          className={`w-full p-6 border rounded-[1.5rem] flex items-center justify-between transition-all duration-300 group/u shadow-inner ${selectedUser?._id === u._id ? "bg-orange-600 border-orange-600/50 shadow-orange-950/40 text-white" : "bg-stone-900/40 border-stone-800/80 hover:border-orange-600/40 hover:bg-stone-900"}`}
                        >
                          <div className="flex items-center gap-5 text-left">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold tracking-tight transition-all ${selectedUser?._id === u._id ? "bg-white/10 text-white" : "bg-stone-950"}`}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold tracking-tight">
                                {u.name}
                              </p>
                              <p className="text-xs text-stone-600 font-bold tracking-tight mt-1 lowercase opacity-60">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className="text-stone-800 group-hover/u:text-orange-600 transition-all group-hover/u:translate-x-2"
                            size={20}
                            strokeWidth={3}
                          />
                        </button>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-10">
                        <Search size={64} className="mx-auto mb-4" />
                        <p className="text-xs font-bold tracking-tight">
                          No eligibility matches
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {addStep === 2 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <div className="bg-orange-600/5 border border-orange-600/20 p-8 rounded-3xl flex items-center gap-6 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-xl font-bold tracking-tight">
                      {selectedUser?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-tight text-orange-600">
                        Selected Candidate
                      </p>
                      <p className="text-lg font-bold tracking-tight text-white">
                        {selectedUser?.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {services.map((svc) => (
                      <button
                        key={svc._id}
                        onClick={() => {
                          setSelectedServiceId(svc._id);
                          setAddStep(3);
                        }}
                        className="p-6 bg-stone-900/50 border border-stone-800 rounded-3xl flex items-center justify-between group/svc transition-all hover:bg-stone-900 hover:border-orange-600/40 shadow-inner"
                      >
                        <div className="flex items-center gap-6 text-left">
                          <div className="w-12 h-12 rounded-xl bg-stone-950 flex items-center justify-center text-stone-700 group-hover/svc:text-orange-600 transition-colors">
                            <Database size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight text-white">
                              {svc.name}
                            </p>
                            <span className="text-xs font-bold tracking-tight px-2 py-1 bg-stone-950 rounded-lg text-stone-500 mt-2 block w-fit">
                              {svc.prefix} System
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className="text-stone-800 group-hover/svc:text-orange-600 transition-all group-hover/svc:translate-x-2"
                          size={20}
                          strokeWidth={3}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {addStep === 3 && (
                <div className="space-y-10 animate-in slide-in-from-right duration-500">
                  <div className="bg-[#0C0A09] border border-stone-800 p-10 rounded-[2.5rem] space-y-10 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
                    <div className="flex items-center justify-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-orange-600 flex items-center justify-center text-white text-4xl font-bold tracking-tight shadow-[0_30px_60px_-15px_rgba(234,88,12,0.4)]">
                        <ShieldCheck size={48} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="text-center space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-white">
                          Authorization Pipeline
                        </h3>
                        <p className="text-stone-600 text-xs font-bold tracking-tight mt-3 italic">
                          Finalize departmental personnel allocation
                        </p>
                      </div>
                      <div className="bg-stone-900/40 p-10 rounded-[2rem] border border-stone-800/60 flex flex-col gap-8 shadow-inner">
                        <div className="flex justify-between items-center text-xs font-bold tracking-tight leading-none">
                          <div className="flex items-center gap-3 text-stone-700">
                            <User size={14} className="opacity-40" />
                            <span>Personnel</span>
                          </div>
                          <span className="text-white bg-white/5 px-6 py-3 rounded-xl border border-white/5">
                            {selectedUser?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold tracking-tight leading-none">
                          <div className="flex items-center gap-3 text-stone-700">
                            <Zap size={14} className="opacity-40" />
                            <span>Service</span>
                          </div>
                          <span className="text-orange-500 bg-orange-600/5 px-6 py-3 rounded-xl border border-orange-600/10">
                            {
                              services.find((s) => s._id === selectedServiceId)
                                ?.name
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-8 flex gap-4 border-t border-stone-800/40 mt-auto shrink-0">
              {addStep > 1 && (
                <button
                  onClick={() => setAddStep(addStep - 1)}
                  className="flex-1 p-6 bg-stone-900 border border-stone-800 rounded-2xl text-sm font-bold tracking-tight text-stone-600 hover:text-white transition-all active:scale-95 leading-none"
                >
                  Go Back
                </button>
              )}
              {addStep === 3 ? (
                <button
                  onClick={handleAddStaff}
                  className="flex-[2] bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-bold tracking-tight text-sm text-white shadow-[0_30px_60px_-15px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-6 active:scale-[0.97] leading-none whitespace-nowrap"
                >
                  <ShieldCheck size={24} strokeWidth={3} /> Finalize and Deploy
                </button>
              ) : (
                <div className="flex-[2] h-[1px] bg-transparent" />
              )}
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: ` .custom-scrollbar::-webkit-scrollbar { width: 5px;} .custom-scrollbar::-webkit-scrollbar-track { background: transparent;} .custom-scrollbar::-webkit-scrollbar-thumb { background: #171412; border-radius: 20px; border: 2px solid #0C0A09;} .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #EA580C;}`,
        }}
      />
    </div>
  );
};

export default StaffManagement;
