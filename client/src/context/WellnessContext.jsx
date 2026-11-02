import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";

const WellnessContext = createContext(null);

export const WellnessProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/api/journal/analytics");
      if (res.data?.analytics) {
        setStats(res.data.analytics);
      }
    } catch (err) {
      console.warn("Could not load mood analytics:", err?.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  const toggleSoundMute = () => {
    const nextState = sounds.toggleMute();
    setIsMuted(nextState);
    return nextState;
  };

  return (
    <WellnessContext.Provider
      value={{
        activeTab,
        setActiveTab,
        refreshKey,
        triggerRefresh,
        stats,
        loadingStats,
        fetchStats,
        isLocked,
        setIsLocked,
        isMuted,
        toggleSoundMute,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
};

export default WellnessContext;
