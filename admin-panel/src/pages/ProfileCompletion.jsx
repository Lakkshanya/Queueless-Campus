import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Building,
  Briefcase,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";
const ProfileCompletion = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collegeId: user?.collegeId || "",
    phone: user?.phone || "",
    department: user?.department || "",
    designation: user?.designation || "",
    workingHours: user?.workingHours || "",
    adminRoleType: user?.adminRoleType || "sub",
    permissions: user?.permissions || [],
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePermissionChange = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/complete-profile", formData);
      const updatedUser = { ...user, ...response.data.user, token: user.token };
      login(updatedUser);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/staff");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Profile update failed. Please verify your entries.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#1C1917] flex items-center justify-center p-6 font-sans">
      {" "}
      <div className="bg-[#292524] w-full max-w-4xl p-6 rounded-[40px] border border-stone-800 shadow-2xl relative overflow-hidden">
        {" "}
        {/* Subtle background glow */}{" "}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#9A3412] opacity-10 blur-[100px]"></div>{" "}
        <div className="text-center mb-6 relative z-10">
          {" "}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9A3412]/10 rounded-2xl mb-6 border border-[#9A3412]/20 shadow-inner">
            {" "}
            <User className="text-[#9A3412]" size={32} />{" "}
          </div>{" "}
          <h1 className="text-lg font-bold tracking-tight text-[#FAFAF9] mb-3 ">
            {" "}
            Complete Profile{" "}
          </h1>{" "}
          <p className="text-[#D6D3D1] font-bold tracking-tight text-xs opacity-60">
            {" "}
            Setting up authorized {user?.role.toUpperCase()} credentials{" "}
          </p>{" "}
        </div>{" "}
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {" "}
            {/* Common: Employee/Admin ID */}{" "}
            <div className="space-y-2">
              {" "}
              <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                {" "}
                {user?.role === "admin" ? "Admin ID" : "Employee ID"}{" "}
              </label>{" "}
              <div className="relative group">
                {" "}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {" "}
                  <Hash
                    className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                    size={18}
                  />{" "}
                </div>{" "}
                <input
                  type="text"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  placeholder="e.g. AD-001"
                  className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] placeholder-stone-700 text-sm font-bold tracking-tight"
                  required
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Common: Phone */}{" "}
            <div className="space-y-2">
              {" "}
              <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                {" "}
                Contact Number{" "}
              </label>{" "}
              <div className="relative group">
                {" "}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {" "}
                  <Phone
                    className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                    size={18}
                  />{" "}
                </div>{" "}
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] placeholder-stone-700 text-sm"
                  required
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* STAFF SPECIFIC */}{" "}
            {user?.role === "staff" && (
              <>
                {" "}
                <div className="space-y-2">
                  {" "}
                  <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                    {" "}
                    Department{" "}
                  </label>{" "}
                  <div className="relative group">
                    {" "}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {" "}
                      <Building
                        className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                        size={18}
                      />{" "}
                    </div>{" "}
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Registrar Office"
                      className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] placeholder-stone-700 text-sm"
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                    {" "}
                    Designation{" "}
                  </label>{" "}
                  <div className="relative group">
                    {" "}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {" "}
                      <Briefcase
                        className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                        size={18}
                      />{" "}
                    </div>{" "}
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Senior Clerk"
                      className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] placeholder-stone-700 text-sm"
                      required
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                    {" "}
                    Working Hours{" "}
                  </label>{" "}
                  <div className="relative group">
                    {" "}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {" "}
                      <Clock
                        className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                        size={18}
                      />{" "}
                    </div>{" "}
                    <input
                      type="text"
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleChange}
                      placeholder="e.g. 09:00 AM - 05:00 PM"
                      className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] placeholder-stone-700 text-sm"
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </>
            )}{" "}
            {/* ADMIN SPECIFIC */}{" "}
            {user?.role === "admin" && (
              <div className="space-y-2">
                {" "}
                <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                  {" "}
                  Admin Authority Level{" "}
                </label>{" "}
                <div className="relative group">
                  {" "}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {" "}
                    <ShieldCheck
                      className="text-stone-500 group-focus-within:text-[#9A3412] transition-colors"
                      size={18}
                    />{" "}
                  </div>{" "}
                  <select
                    name="adminRoleType"
                    value={formData.adminRoleType}
                    onChange={handleChange}
                    className="w-full bg-[#1C1917] border border-stone-800 p-4 pl-12 rounded-2xl focus:border-[#9A3412] outline-none transition text-[#FAFAF9] appearance-none cursor-pointer text-sm font-bold tracking-tight"
                    required
                  >
                    {" "}
                    <option value="sub">Staff Administrator</option>{" "}
                    <option value="super">System SuperAdmin</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Permissions (Admin Only) */}{" "}
          {user?.role === "admin" && (
            <div className="space-y-4 pt-6 border-t border-stone-800/50">
              {" "}
              <label className="block text-[#D6D3D1] text-xs font-bold tracking-tight mb-1 opacity-70 ml-1">
                {" "}
                System Permissions{" "}
              </label>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {" "}
                {[
                  "Queue Monitor",
                  "Staff Control",
                  "Analytics",
                  "Document Verify",
                ].map((perm) => (
                  <label
                    key={perm}
                    className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${formData.permissions.includes(perm) ? "bg-[#9A3412]/10 border-[#9A3412]" : "bg-[#1C1917] border-stone-800 opacity-60 hover:opacity-100"}`}
                  >
                    {" "}
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.permissions.includes(perm) ? "bg-[#9A3412] border-[#9A3412]" : "bg-[#292524] border-stone-800"}`}
                    >
                      {" "}
                      {formData.permissions.includes(perm) && (
                        <CheckCircle2 size={12} className="text-white" />
                      )}{" "}
                    </div>{" "}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => handlePermissionChange(perm)}
                    />{" "}
                    <span
                      className={`text-xs font-bold tracking-tight ${formData.permissions.includes(perm) ? "text-[#FAFAF9]" : "text-stone-500"}`}
                    >
                      {" "}
                      {perm}{" "}
                    </span>{" "}
                  </label>
                ))}{" "}
              </div>{" "}
            </div>
          )}{" "}
          <div className="pt-8">
            {" "}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9A3412] hover:bg-[#C2410C] text-white p-6 rounded-2xl font-bold tracking-tight transition shadow-2xl shadow-orange-950/40 flex items-center justify-center gap-3 disabled:opacity-50 text-xs group active:scale-[0.98]"
            >
              {" "}
              {loading ? (
                "Finalizing..."
              ) : (
                <>
                  {" "}
                  Complete Identity Profile{" "}
                  <CheckCircle2
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />{" "}
                </>
              )}{" "}
            </button>{" "}
            <p className="mt-6 text-center text-stone-600 text-xs font-bold tracking-tight flex items-center justify-center gap-2">
              {" "}
              <AlertCircle size={12} /> Identity verification required for
              campus portal access.{" "}
            </p>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
export default ProfileCompletion;
