import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/api";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes without user interaction = idle
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // Sync to backend every 5 minutes
const EYE_RESET_CYCLE_SEC = 20 * 60; // 20 minutes for 20-20-20 rule

export const useScreenTimeTracker = (isAuthenticated = false) => {
  const getTodayKey = () => `calmme_screentime_${new Date().toISOString().split("T")[0]}`;

  const [activeSecondsToday, setActiveSecondsToday] = useState(() => {
    const saved = localStorage.getItem(getTodayKey());
    return saved ? parseInt(saved, 10) : 0;
  });

  const [eyeResetSecondsLeft, setEyeResetSecondsLeft] = useState(EYE_RESET_CYCLE_SEC);
  const [showEyeResetReminder, setShowEyeResetReminder] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const activeSecondsRef = useRef(activeSecondsToday);

  activeSecondsRef.current = activeSecondsToday;

  // 1. Idle Detection & User Activity Listener
  useEffect(() => {
    const resetIdle = () => {
      lastActivityRef.current = Date.now();
      if (isIdle) setIsIdle(false);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));

    const idleCheckInterval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity > IDLE_TIMEOUT_MS) {
        setIsIdle(true);
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetIdle));
      clearInterval(idleCheckInterval);
    };
  }, [isIdle]);

  // 2. Active Screen Time Tick Counter
  useEffect(() => {
    const timer = setInterval(() => {
      // Only count if page is visible and user is not idle
      if (document.visibilityState === "visible" && !isIdle) {
        setActiveSecondsToday((prev) => {
          const nextVal = prev + 1;
          localStorage.setItem(getTodayKey(), String(nextVal));
          return nextVal;
        });

        // 20-20-20 Eye Reset countdown
        setEyeResetSecondsLeft((prev) => {
          if (prev <= 1) {
            setShowEyeResetReminder(true);
            return EYE_RESET_CYCLE_SEC;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isIdle]);

  // 3. Periodic Backend Sync to /api/wellness/daily
  const syncToBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const hours = parseFloat((activeSecondsRef.current / 3600).toFixed(2));
      await api.post("/api/wellness/daily", {
        screenTimeHours: hours,
      });
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const syncInterval = setInterval(syncToBackend, SYNC_INTERVAL_MS);
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, syncToBackend]);

  const dismissEyeReset = () => {
    setShowEyeResetReminder(false);
    setEyeResetSecondsLeft(EYE_RESET_CYCLE_SEC);
  };

  const formattedScreenTime = () => {
    const hours = Math.floor(activeSecondsToday / 3600);
    const mins = Math.floor((activeSecondsToday % 3600) / 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return {
    activeSecondsToday,
    screenTimeHours: parseFloat((activeSecondsToday / 3600).toFixed(2)),
    formattedScreenTime: formattedScreenTime(),
    isIdle,
    eyeResetSecondsLeft,
    showEyeResetReminder,
    dismissEyeReset,
    syncToBackend,
  };
};

export default useScreenTimeTracker;

