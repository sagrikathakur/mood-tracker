import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    const hasTokens =
      localStorage.getItem("accessToken") || localStorage.getItem("refreshToken");
    try {
      return saved && hasTokens ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token && !refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      // If refreshToken also expired or invalid, clear user
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        if (!localStorage.getItem("refreshToken")) {
          setUser(null);
          localStorage.removeItem("user");
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback((userData, accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/api/auth/logout", { refreshToken });
    } catch (e) {
      // Continue cleanup regardless
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [user, loading, login, logout, fetchCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
