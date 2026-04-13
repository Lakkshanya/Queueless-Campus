import React, { useState, useEffect } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  Plus,
  Trash2,
  Power,
  Pause,
  Search,
  ShieldCheck,
  X,
  User,
  ChevronRight,
  Database,
  ArrowRight,
  Settings,
  Activity,
  Zap,
} from "lucide-react";

const CounterManagement = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCounterNumber, setNewCounterNumber] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCounterId, setSelectedCounterId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [counterRes, serviceRes] = await Promise.all([
        api.get("/counters"),
        api.get("/services"),
      ]);
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

  const handleCreateCounter = async (e) => {
    e.preventDefault();
    if (!newCounterNumber) return;
    setIsSubmitting(true);
    try {
      await api.post("/counters", { number: parseInt(newCounterNumber) });
      setNewCounterNumber("");
      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to initialize terminal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedCounterId) return;
    setIsSubmitting(true);
    try {
      // Update the service with the assigned counter
      const service = services.find((s) => s._id === selectedServiceId);
      await api.put(`/services/${selectedServiceId}`, {
        ...service,
        assignedCounter: selectedCounterId,
      });
      // Requirement: Redirect to notification page after saving
      navigate("/admin/notifications");
    } catch (error) {
      alert(error.response?.data?.message || "Assignment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (counterId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      await api.post("/counters/toggle-status", {
        counterId,
        status: newStatus,
      });
      fetchData();
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-4" />
        <p className="text-stone-500 text-xs font-bold tracking-tight animate-pulse">
          Mapping Network Terminals...
        </p>
      </div>
    );

  return (
    <div className="space-y-12 animate-in font-display">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-orange-600 text-xs font-bold tracking-tight mb-4 bg-orange-600/5 w-fit px-4 py-1.5 rounded-full border border-orange-600/10">
            <Monitor size={12} strokeWidth={3} /> Terminal Infrastructure
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-none">
            Counter Units
          </h1>
          <p className="text-stone-500 text-xs font-bold tracking-tight mt-6 max-w-xl leading-relaxed">
            Manage physical campus workstations and their associated service
            nodes for real-time queue synchronization.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 lg:flex-none bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-orange-600/30 p-5 px-8 rounded-2xl font-bold tracking-tight text-xs flex items-center justify-center gap-4 active:scale-95 group shadow-inner whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} className="text-orange-600" />{" "}
            Initialize Unit
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 lg:flex-none bg-orange-600 hover:bg-orange-500 text-white p-5 px-8 rounded-2xl font-bold tracking-tight text-xs transition-all shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] flex items-center justify-center gap-4 active:scale-95 group whitespace-nowrap"
          >
            <Zap size={18} strokeWidth={3} /> Synchronize Node
          </button>
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {counters.map((counter) => {
          const service = services.find(
            (s) => s.assignedCounter?._id === counter._id,
          );
          const isOccupied = !!service;
          return (
            <div
              key={counter._id}
              className="group relative bg-[#171412] border border-stone-800/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-orange-600/30 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-center text-white text-xl font-bold tracking-tight shadow-inner">
                  {counter.number.toString().padStart(2, "0")}
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-tight ${counter.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}
                >
                  {counter.status === "active" ? "Active" : "Offline"}
                </div>
              </div>
              <div className="mb-10 space-y-2">
                <p className="text-xs font-bold tracking-tight text-stone-700">
                  Assigned Service
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${isOccupied ? "bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.5)]" : "bg-stone-800"}`}
                  />
                  <h3
                    className={`text-sm font-bold tracking-tight ${isOccupied ? "text-white" : "text-stone-800 italic"}`}
                  >
                    {service ? service.name : "Unlinked Node"}
                  </h3>
                </div>
              </div>
              <div className="mb-10 space-y-2">
                <p className="text-xs font-bold tracking-tight text-stone-700">
                  Assigned Officer
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${counter.staff ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-stone-800"}`}
                  />
                  <h3
                    className={`text-sm font-bold tracking-tight ${counter.staff ? "text-white" : "text-stone-800 italic"}`}
                  >
                    {counter.staff ? counter.staff.name : "No Officer Assigned"}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() =>
                    handleToggleStatus(counter._id, counter.status)
                  }
                  className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 text-xs font-bold tracking-tight border transition-all active:scale-95 ${counter.status === "active" ? "bg-red-950/20 border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-950/20 border-emerald-900/30 text-emerald-500 hover:bg-emerald-500 hover:text-white"}`}
                >
                  {counter.status === "active" ? (
                    <Pause size={14} strokeWidth={3} />
                  ) : (
                    <Power size={14} strokeWidth={3} />
                  )}
                  {counter.status === "active" ? "Deactivate" : "Activate Unit"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in">
          <div className="bg-[#171412] w-full max-w-lg rounded-[3rem] border border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative p-6 md:p-10">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white hover:bg-red-600 transition-all duration-300"
            >
              <X size={20} />
            </button>
            <div className="mb-12 text-center">
              <div className="text-orange-600 text-xs font-bold tracking-tight mb-4">
                Infrastructure Linking
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Assign Terminal
              </h2>
            </div>
            <form onSubmit={handleAssign} className="space-y-12">
              <div className="space-y-4">
                <label className="block text-xs font-bold tracking-tight text-stone-600 ml-2">
                  Select Target Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-xs font-bold tracking-tight text-white focus:border-orange-600 transition shadow-inner appearance-none"
                  required
                >
                  <option value="">Select Service Node...</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.prefix})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center py-2 animate-pulse-soft">
                <ArrowRight
                  className="text-orange-600 rotate-90"
                  size={32}
                  strokeWidth={3}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <label className="block text-xs font-bold tracking-tight text-stone-600">
                    Select Physical Counter
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs font-bold tracking-tight text-orange-600 hover:text-orange-400 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={10} strokeWidth={3} /> Quick Add
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedCounterId}
                    onChange={(e) => setSelectedCounterId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 p-6 rounded-2xl outline-none text-xs font-bold tracking-tight text-white focus:border-orange-600 transition shadow-inner appearance-none pr-12"
                    required
                  >
                    <option value="">
                      {counters.length === 0
                        ? "No terminals found"
                        : "Select Terminal..."}
                    </option>
                    {counters.map((c) => {
                      const isAlreadyAssigned = services.some(
                        (s) => s.assignedCounter?._id === c._id,
                      );
                      return (
                        <option
                          key={c._id}
                          value={c._id}
                          disabled={isAlreadyAssigned}
                        >
                          Unit-{c.number.toString().padStart(2, "0")}{" "}
                          {isAlreadyAssigned ? "[Already Assigned]" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {counters.length === 0 && (
                    <div className="absolute top-full left-0 mt-2 text-[7px] font-bold tracking-tight text-orange-600 animate-pulse">
                      {" "}
                      Critical Error: Operational registry empty. Use 'Quick
                      Add' to initialize.{" "}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-bold tracking-tight text-xs text-white shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95 leading-none"
              >
                <ShieldCheck size={20} strokeWidth={2.5} /> CONFIRM ASSIGNMENT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Counter Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-in fade-in">
          <div className="bg-[#171412] w-full max-w-md rounded-[3rem] border border-stone-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative p-6 md:p-10">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 hover:text-white hover:bg-red-600 transition-all duration-300"
            >
              <X size={20} />
            </button>
            <div className="mb-12 text-center">
              <div className="text-orange-600 text-xs font-bold tracking-tight mb-4">
                Unit Identification
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Add Terminal
              </h2>
            </div>
            <form onSubmit={handleCreateCounter} className="space-y-12">
              <div className="space-y-4">
                <label className="block text-xs font-bold tracking-tight text-stone-600 ml-2">
                  Terminal Number
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-600 font-bold tracking-tight text-xs">
                    UNIT-
                  </div>
                  <input
                    type="number"
                    value={newCounterNumber}
                    onChange={(e) => setNewCounterNumber(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 p-6 pl-16 rounded-2xl outline-none text-[14px] font-bold tracking-tight text-white focus:border-orange-600 transition shadow-inner"
                    placeholder="01"
                    required
                  />
                </div>
                <p className="text-xs font-bold tracking-tight text-stone-700 px-2 italic">
                  Provide the physical counter number for operational alignment.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-2xl font-bold tracking-tight text-xs text-white shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95 leading-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={20} strokeWidth={2.5} /> Initialize Unit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterManagement;
