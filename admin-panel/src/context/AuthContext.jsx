import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("admin_user");
      const token = localStorage.getItem("token");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (token) {
        try {
          const res = await api.get("/auth/me");
          const finalUser = { ...res.data, token };
          setUser(finalUser);
          localStorage.setItem("admin_user", JSON.stringify(finalUser));
        } catch (error) {
          console.error("Failed to re-sync profile:", error);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin_user");
    localStorage.removeItem("token");
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {" "}
      {children}{" "}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
