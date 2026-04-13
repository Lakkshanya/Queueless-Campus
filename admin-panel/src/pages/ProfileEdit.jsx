import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield,
  ShieldCheck,
  Activity,
  Zap,
  Monitor,
  BadgeCheck,
} from "lucide-react";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    profilePhoto: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          department: res.data.department || "",
          designation: res.data.designation || "",
          profilePhoto: res.data.profilePhoto || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const response = await api.post("/auth/complete-profile", formData);
      setSuccess(true);
      const updatedUser = {
        ...user,
        ...response.data.user,
        token: user?.token || localStorage.getItem("token"),
      };
      login(updatedUser);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Update failed. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-[#1F1D1B]">
        <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
        <p className="text-[#D6D3D1] text-xs font-bold tracking-tight opacity-40">
          Loading Profile Data...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto py-10 px-6">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-500 hover:text-white hover:border-[#9A3412]/40 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[#9A3412] text-xs font-bold tracking-tight mb-2 uppercase opacity-60">
              <Shield size={12} /> Account Overview
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-none text-[#FAFAF9]">
              Staff Profile
            </h1>
          </div>
        </div>
        {success && (
          <div className="flex items-center gap-3 bg-green-950/20 border border-green-900/40 px-6 py-3 rounded-2xl animate-in zoom-in duration-300">
            <CheckCircle className="text-green-500" size={18} />
            <span className="text-green-500 text-xs font-bold tracking-tight">
              Profile Updated
            </span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: The "Mobile-Style" Staff Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#171412] rounded-[48px] p-8 border border-stone-800/60 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] rounded-full   pointer-events-none" />

            <div className="items-center flex flex-col mb-10 relative z-10">
              <div className="w-32 h-32 bg-[#0C0A09] rounded-[40px] border-2 border-orange-600/30 items-center justify-center overflow-hidden mb-6 shadow-inner">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-orange-600 text-5xl font-bold tracking-tight">
                    {formData.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                {formData.name || 'Authorized Staff'}
              </h2>
              <p className="text-stone-500 text-xs font-bold tracking-tight uppercase">
                {formData.email}
              </p>
            </div>

            <div className="bg-[#0C0A09] p-6 rounded-[32px] border border-stone-800/60 mb-8">
              <div className="flex items-center gap-3 mb-6 text-orange-600">
                <ShieldCheck size={16} strokeWidth={3} />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  Access Level 2
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-stone-800/40">
                  <span className="text-stone-600 text-[10px] font-bold tracking-tight uppercase">
                    Department
                  </span>
                  <span className="text-white text-xs font-bold tracking-tight">
                    {formData.department || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-800/40">
                  <span className="text-stone-600 text-[10px] font-bold tracking-tight uppercase">
                    Designation
                  </span>
                  <span className="text-white text-xs font-bold tracking-tight">
                    {formData.designation || "Staff"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-[#0C0A09] rounded-2xl p-4 border border-stone-800">
                <Activity size={14} className="text-emerald-500 mb-2" />
                <p className="text-xl font-bold tracking-tight text-white">
                  Active
                </p>
                <p className="text-stone-700 text-[9px] font-bold tracking-tight uppercase">
                  Status
                </p>
              </div>
              <div className="flex-1 bg-[#0C0A09] rounded-2xl p-4 border border-stone-800">
                <Zap size={14} className="text-orange-600 mb-2" />
                <p className="text-xl font-bold tracking-tight text-white">
                  Sync
                </p>
                <p className="text-stone-700 text-[9px] font-bold tracking-tight uppercase">
                  Network
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Edit Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="bg-[#171412] p-10 rounded-[48px] border border-stone-800/60 shadow-xl space-y-10"
          >
            <div className="flex items-center gap-4 mb-2">
              <BadgeCheck size={20} className="text-orange-600" />
              <h3 className="text-xl font-bold tracking-tight text-white uppercase">
                Update Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  label: "Full Name",
                  icon: <User />,
                  name: "name",
                  type: "text",
                },
                {
                  label: "Email Address",
                  icon: <Mail />,
                  name: "email",
                  type: "email",
                  disabled: true,
                },
                {
                  label: "Contact Phone",
                  icon: <Phone />,
                  name: "phone",
                  type: "tel",
                },
                {
                  label: "Department",
                  icon: <Building />,
                  name: "department",
                  type: "text",
                },
                {
                  label: "Designation",
                  icon: <Briefcase />,
                  name: "designation",
                  type: "text",
                },
              ].map((field, idx) => (
                <div key={idx} className="space-y-3">
                  <label className="text-xs font-bold tracking-tight text-stone-500 ml-1 flex items-center gap-3">
                    {React.cloneElement(field.icon, {
                      size: 14,
                      className: "text-orange-600",
                    })}
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.name]}
                    disabled={field.disabled}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className={`w-full bg-[#0C0A09] border border-stone-800 rounded-2xl py-4 px-6 text-sm font-bold tracking-tight text-[#FAFAF9] outline-none transition-all placeholder-stone-800 ${field.disabled ? "opacity-40 cursor-not-allowed" : "focus:border-orange-600/50"}`}
                  />
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-stone-800/40 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-4 bg-orange-600 hover:bg-orange-500 px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-orange-950/40 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <Save size={20} className="text-white" />
                )}
                <span className="text-sm font-bold tracking-tight text-white uppercase tracking-wider">
                  Save Settings
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
