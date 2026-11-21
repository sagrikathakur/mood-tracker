import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import {
  Flame,
  Heart,
  Calendar,
  BookOpen,
  Smile,
  ShieldCheck,
  Activity,
  Moon,
  Droplets,
  Trophy,
  Gamepad2,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";
import { sounds } from "../utils/soundEffects";

const MOOD_SCORE_MAP = {
  Happy: 5,
  Excited: 5,
  Grateful: 4.5,
  Calm: 4,
  Neutral: 3,
  Steady: 3,
  Tired: 2.2,
  Sad: 2,
  Anxious: 1.5,
  Angry: 1,
};

const MOOD_PALETTE = {
  Calm: { bg: "bg-teal-500", text: "text-teal-700", hex: "#14b8a6" },
  Happy: { bg: "bg-emerald-500", text: "text-emerald-700", hex: "#10b981" },
  Grateful: { bg: "bg-rose-500", text: "text-rose-700", hex: "#f43f5e" },
  Excited: { bg: "bg-amber-500", text: "text-amber-700", hex: "#f59e0b" },
  Neutral: { bg: "bg-slate-400", text: "text-slate-600", hex: "#94a3b8" },
  Steady: { bg: "bg-emerald-400", text: "text-emerald-700", hex: "#34d399" },
  Tired: { bg: "bg-indigo-400", text: "text-indigo-700", hex: "#818cf8" },
  Anxious: { bg: "bg-purple-500", text: "text-purple-700", hex: "#a855f7" },
  Sad: { bg: "bg-sky-400", text: "text-sky-700", hex: "#38bdf8" },
  Angry: { bg: "bg-red-500", text: "text-red-700", hex: "#ef4444" },
};

const MoodDashboard = ({ refreshKey }) => {
  const [analytics, setAnalytics] = useState(null);
  const [wellnessHistory, setWellnessHistory] = useState([]);
  const [topGameScore, setTopGameScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const [hoveredDayIdx, setHoveredDayIdx] = useState(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllDashboardData = async () => {
      try {
        const [analyticsRes, wellnessRes, gameRes] = await Promise.allSettled([
          api.get("/api/journal/analytics"),
          api.get("/api/wellness/history?days=7"),
          api.get("/api/game/leaderboard?mode=arcade&limit=1"),
        ]);

        if (isMounted) {
          if (analyticsRes.status === "fulfilled" && analyticsRes.value.data?.analytics) {
            setAnalytics(analyticsRes.value.data.analytics);
          }

          if (wellnessRes.status === "fulfilled" && wellnessRes.value.data?.history) {
            setWellnessHistory(wellnessRes.value.data.history);
          }

          if (gameRes.status === "fulfilled" && gameRes.value.data?.leaderboard?.[0]?.score) {
            setTopGameScore(gameRes.value.data.leaderboard[0].score);
          }
        }
      } catch (err) {
        console.warn("Could not load dashboard telemetry:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllDashboardData();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const timelineData = useMemo(() => {
    const days = [];
    const recentWeekly = analytics?.recentWeekly || [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = d.getDate();

      const journalLog = recentWeekly.find((r) => r.date === dateStr);
      const moodName = journalLog?.mood || null;
      const moodScore = moodName ? (MOOD_SCORE_MAP[moodName] || 3.0) : null;

      const wellnessLog = wellnessHistory.find((w) => w.log_date === dateStr);
      const sleepHours = wellnessLog?.sleep_hours !== undefined && wellnessLog?.sleep_hours !== null
        ? parseFloat(wellnessLog.sleep_hours)
        : null;
      const waterGlasses = wellnessLog?.water_glasses !== undefined
        ? parseInt(wellnessLog.water_glasses, 10)
        : null;
      const stressLevel = wellnessLog?.stress_level !== undefined
        ? parseInt(wellnessLog.stress_level, 10)
        : null;

      days.push({
        date: dateStr,
        dayShort,
        dayNumber,
        isToday: i === 0,
        mood: moodName,
        moodScore,
        isMoodLogged: Boolean(moodName),
        sleepHours,
        isSleepLogged: sleepHours !== null && sleepHours > 0,
        waterGlasses,
        stressLevel,
      });
    }

    return days;
  }, [analytics, wellnessHistory]);

  const hasAnyMoodLogged = useMemo(
    () => timelineData.some((d) => d.isMoodLogged),
    [timelineData]
  );

  const hasAnySleepLogged = useMemo(
    () => timelineData.some((d) => d.isSleepLogged),
    [timelineData]
  );

  const svgDimensions = { width: 560, height: 160, paddingX: 30, paddingY: 25 };

  const graphPoints = useMemo(() => {
    const { width, height, paddingX, paddingY } = svgDimensions;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;

    return timelineData.map((d, index) => {
      const x = paddingX + (index / (timelineData.length - 1)) * innerWidth;
      const score = d.moodScore !== null ? d.moodScore : 3.0;
      const normalized = (score - 1) / 4;
      const y = paddingY + (1 - normalized) * innerHeight;
      return { ...d, x, y };
    });
  }, [timelineData]);

  const curvePaths = useMemo(() => {
    if (!hasAnyMoodLogged || graphPoints.length === 0) return { line: "", area: "" };

    const loggedPoints = graphPoints.filter((p) => p.isMoodLogged);
    if (loggedPoints.length < 2) {
      return { line: "", area: "" };
    }

    let line = `M ${loggedPoints[0].x} ${loggedPoints[0].y}`;
    for (let i = 0; i < loggedPoints.length - 1; i++) {
      const p0 = loggedPoints[i === 0 ? 0 : i - 1];
      const p1 = loggedPoints[i];
      const p2 = loggedPoints[i + 1];
      const p3 = loggedPoints[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5.5;
      const cp1y = p1.y + (p2.y - p0.y) / 5.5;
      const cp2x = p2.x - (p3.x - p1.x) / 5.5;
      const cp2y = p2.y - (p3.y - p1.y) / 5.5;

      line += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const baselineY = svgDimensions.height - svgDimensions.paddingY;
    const area = `${line} L ${loggedPoints[loggedPoints.length - 1].x} ${baselineY} L ${loggedPoints[0].x} ${baselineY} Z`;

    return { line, area };
  }, [graphPoints, hasAnyMoodLogged]);

  const currentStreak = analytics?.currentStreak || 0;
  const totalEntries = analytics?.totalEntries || 0;
  const dominantMoodName = analytics?.mostFrequentMood || null;
  const dominantMoodObj = dominantMoodName
    ? MOOD_OPTIONS.find((m) => m.name === dominantMoodName) || null
    : null;

  const recoveryScore = useMemo(() => {
    if (totalEntries === 0 && wellnessHistory.length === 0 && currentStreak === 0) {
      return null;
    }
    let score = 50;
    if (currentStreak > 0) score += Math.min(20, currentStreak * 5);
    if (dominantMoodName && ["Happy", "Calm", "Grateful", "Excited"].includes(dominantMoodName)) {
      score += 15;
    } else if (dominantMoodName && ["Neutral", "Steady"].includes(dominantMoodName)) {
      score += 5;
    }
    if (wellnessHistory.length > 0) {
      const loggedSleeps = wellnessHistory.filter((w) => w.sleep_hours > 0);
      if (loggedSleeps.length > 0) {
        const avgS = loggedSleeps.reduce((acc, c) => acc + c.sleep_hours, 0) / loggedSleeps.length;
        if (avgS >= 7) score += 15;
        else if (avgS >= 5) score += 8;
      }
    }
    return Math.min(100, Math.max(10, Math.round(score)));
  }, [totalEntries, wellnessHistory, currentStreak, dominantMoodName]);

  const moodDistributionList = useMemo(() => {
    const rawDist = analytics?.moodDistribution || [];
    if (rawDist.length === 0) return [];
    const total = rawDist.reduce((acc, curr) => acc + curr.count, 0) || 1;
    return rawDist.map((item) => ({
      mood: item.mood,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [analytics]);

  const avgSleep = useMemo(() => {
    const validLogs = wellnessHistory.filter((w) => w.sleep_hours && w.sleep_hours > 0);
    if (validLogs.length === 0) return null;
    const sum = validLogs.reduce((acc, curr) => acc + curr.sleep_hours, 0);
    return (sum / validLogs.length).toFixed(1);
  }, [wellnessHistory]);

  const actualAvgMoodScore = useMemo(() => {
    const logged = timelineData.filter((d) => d.moodScore !== null);
    if (logged.length === 0) return null;
    const sum = logged.reduce((acc, d) => acc + d.moodScore, 0);
    return (sum / logged.length).toFixed(1);
  }, [timelineData]);

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/70 rounded-2xl border border-slate-200/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-white/70 rounded-2xl border border-slate-200/60" />
          <div className="lg:col-span-4 h-80 bg-white/70 rounded-2xl border border-slate-200/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 select-none animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                {currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {currentStreak === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium truncate">
                {currentStreak > 0 ? "Daily streak active" : "No active streak"}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                currentStreak > 0
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                  : "text-slate-500 bg-slate-50 border-slate-200/60"
              }`}>
                {currentStreak > 0 ? "Active" : "Ready"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mental Baseline
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
              <Heart className="w-4 h-4 text-teal-600 fill-teal-100" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dominantMoodObj?.emoji || "—"}</span>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-display truncate">
                {dominantMoodObj?.name || "No Logs Yet"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium truncate">
                {dominantMoodObj ? dominantMoodObj.desc : "Write a journal entry"}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                dominantMoodObj
                  ? "text-teal-700 bg-teal-50 border-teal-200/60"
                  : "text-slate-400 bg-slate-50 border-slate-200/60"
              }`}>
                {dominantMoodObj ? "Primary" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Reflections Saved
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                {totalEntries}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {totalEntries === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium truncate">
                {totalEntries > 0 ? "AES-256 encrypted" : "Zero entries recorded"}
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                Private
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Recovery Index
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                {recoveryScore !== null ? `${recoveryScore}%` : "—"}
              </span>
              {recoveryScore !== null && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" /> Optimal
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium truncate">
                {recoveryScore !== null ? "Burnout defense score" : "Awaiting check-in data"}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                recoveryScore !== null
                  ? "text-emerald-800 bg-emerald-100/70 border-emerald-200/60"
                  : "text-slate-400 bg-slate-50 border-slate-200/60"
              }`}>
                {recoveryScore !== null ? "Calculated" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasAnyMoodLogged ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  7-Day Emotional Baseline Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mental baseline tracking across daily coding sprints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/70">
                {actualAvgMoodScore !== null
                  ? `Avg Score: ${actualAvgMoodScore}/5`
                  : "No Logs Recorded"}
              </span>
            </div>
          </div>

          <div className="relative w-full my-4">
            {hasAnyMoodLogged ? (
              <div className="w-full overflow-x-auto overflow-y-hidden">
                <svg
                  viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
                  className="w-full h-44 sm:h-52 drop-shadow-2xs select-none"
                >
                  <defs>
                    <linearGradient id="moodAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[5, 4, 3, 2, 1].map((level) => {
                    const norm = (level - 1) / 4;
                    const y = svgDimensions.paddingY + (1 - norm) * (svgDimensions.height - svgDimensions.paddingY * 2);
                    return (
                      <g key={level}>
                        <line
                          x1={svgDimensions.paddingX}
                          y1={y}
                          x2={svgDimensions.width - svgDimensions.paddingX}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                          strokeDasharray={level === 3 ? "4 4" : undefined}
                        />
                        <text
                          x={svgDimensions.paddingX - 6}
                          y={y + 3}
                          fontSize="9"
                          fontWeight="600"
                          fill="#94a3b8"
                          textAnchor="end"
                        >
                          {level === 5 ? "Peak" : level === 3 ? "Steady" : level === 1 ? "Low" : ""}
                        </text>
                      </g>
                    );
                  })}

                  {curvePaths.area && (
                    <path d={curvePaths.area} fill="url(#moodAreaGradient)" />
                  )}

                  {curvePaths.line && (
                    <path
                      d={curvePaths.line}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {graphPoints.map((pt, idx) => {
                    const isHovered = hoveredDayIdx === idx;
                    return (
                      <g
                        key={idx}
                        onMouseEnter={() => {
                          if (pt.isMoodLogged) {
                            sounds.playPop(440);
                            setHoveredDayIdx(idx);
                          }
                        }}
                        onMouseLeave={() => setHoveredDayIdx(null)}
                        className={pt.isMoodLogged ? "cursor-pointer" : "cursor-default"}
                      >
                        <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                        {pt.isMoodLogged ? (
                          <>
                            {(isHovered || pt.isToday) && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? "8" : "6"}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                opacity="0.4"
                                className="animate-pulse"
                              />
                            )}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? "5.5" : "4"}
                              fill="#059669"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all duration-150"
                            />
                          </>
                        ) : (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="3"
                            fill="#ffffff"
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                          />
                        )}

                        <text
                          x={pt.x}
                          y={svgDimensions.height - 4}
                          fontSize="11"
                          fontWeight={pt.isToday ? "700" : "500"}
                          fill={pt.isToday ? "#0f172a" : pt.isMoodLogged ? "#475569" : "#94a3b8"}
                          textAnchor="middle"
                        >
                          {pt.dayShort}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {hoveredDayIdx !== null && graphPoints[hoveredDayIdx]?.isMoodLogged && (
                  <div className="absolute top-0 right-4 bg-slate-900 text-white rounded-xl py-2 px-3 shadow-lg text-xs space-y-1 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                      <span>{graphPoints[hoveredDayIdx]?.dayShort}</span>
                      <span>·</span>
                      <span>{graphPoints[hoveredDayIdx]?.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {MOOD_OPTIONS.find((m) => m.name === graphPoints[hoveredDayIdx]?.mood)?.emoji || "🌿"}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {graphPoints[hoveredDayIdx]?.mood}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No emotional baseline entries this week
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Write your daily reflection in the journal to begin charting your real mental trajectory.
                </p>
                <Link
                  to="/journal"
                  onClick={() => sounds.playClick()}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Today&apos;s Journal Entry</span>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>Recorded Entry</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span>Unrecorded</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Live Database
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Mood Proportions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown of recorded states.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {totalEntries} Total
              </span>
            </div>

            {moodDistributionList.length > 0 ? (
              <>
                <div className="my-5">
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                    {moodDistributionList.map((item, idx) => {
                      const palette = MOOD_PALETTE[item.mood] || { bg: "bg-emerald-500" };
                      return (
                        <div
                          key={idx}
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full ${palette.bg} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                          title={`${item.mood}: ${item.percentage}%`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {moodDistributionList.slice(0, 4).map((item, idx) => {
                    const moodObj = MOOD_OPTIONS.find((m) => m.name === item.mood);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{moodObj?.emoji || "🌿"}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.mood}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">
                            {item.count} {item.count === 1 ? "entry" : "entries"}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-display">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-10 px-3 my-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                <Smile className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">No mood distribution yet</span>
                <span className="text-[11px] text-slate-400 mt-0.5 max-w-[220px]">
                  Entries recorded in your journal will automatically map here.
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Primary:{" "}
              <strong className="text-slate-800">
                {dominantMoodObj ? dominantMoodObj.name : "None"}
              </strong>
            </span>
            <Link
              to="/journal"
              onClick={() => sounds.playClick()}
              className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>Log Entry</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  7-Day Sleep & Recovery Hours
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rest consistency directly impacts developer cognition and focus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                {avgSleep !== null ? `Avg: ${avgSleep} hrs/night` : "No sleep logs"}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/60">
                7.5h Target
              </span>
            </div>
          </div>

          <div className="relative w-full my-4">
            {hasAnySleepLogged ? (
              <div className="h-44 sm:h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2">
                <div
                  className="absolute inset-x-0 border-b border-dashed border-sky-300 pointer-events-none flex justify-end pr-2"
                  style={{ bottom: `${(7.5 / 10) * 100}%` }}
                >
                  <span className="text-[10px] font-bold text-sky-600 bg-white/90 px-1 rounded -translate-y-1/2">
                    7.5h Target
                  </span>
                </div>

                {timelineData.map((d, idx) => {
                  const sleep = d.sleepHours || 0;
                  const barHeightPercent = Math.min(100, Math.max(8, (sleep / 10) * 100));
                  const isHovered = hoveredBarIdx === idx;
                  const meetsTarget = sleep >= 7.0;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => {
                        if (d.isSleepLogged) {
                          sounds.playPop(380);
                          setHoveredBarIdx(idx);
                        }
                      }}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {isHovered && d.isSleepLogged && (
                        <div className="absolute -top-12 z-20 bg-slate-900 text-white rounded-lg py-1 px-2.5 text-[11px] font-bold shadow-md whitespace-nowrap animate-in fade-in duration-150">
                          {sleep.toFixed(1)} hrs {d.waterGlasses !== null ? `(${d.waterGlasses} glasses water)` : ""}
                        </div>
                      )}

                      {d.isSleepLogged ? (
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 flex flex-col justify-start items-center pt-1.5 ${
                            meetsTarget
                              ? "bg-gradient-to-t from-sky-600 to-teal-400 group-hover:from-sky-700 group-hover:to-teal-500"
                              : "bg-gradient-to-t from-slate-400 to-sky-300 group-hover:from-slate-500 group-hover:to-sky-400"
                          } ${isHovered ? "ring-2 ring-sky-400/50 shadow-md scale-y-[1.02]" : "shadow-2xs"}`}
                        >
                          <span className="text-[10px] font-bold text-white/95">
                            {sleep.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full max-w-[42px] h-2 rounded-full bg-slate-200" title="Not logged" />
                      )}

                      <span
                        className={`mt-2 text-xs font-semibold ${
                          d.isToday ? "text-slate-900 font-extrabold" : d.isSleepLogged ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {d.dayShort}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-2.5">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No sleep or hydration recorded this week
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Record your sleep hours in Habits & Boundaries to visualize your physical recovery trajectory.
                </p>
                <Link
                  to="/habits"
                  onClick={() => sounds.playClick()}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-sky-700 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Sleep & Physical Baseline</span>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Hydration & sleep sync from Wellness habits</span>
            </span>
            <Link
              to="/habits"
              onClick={() => sounds.playClick()}
              className="font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-0.5"
            >
              <span>Manage Habits</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Cognitive Reset
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Ready
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">
              2-minute sensory de-escalation game to clear code fatigue and restore working memory.
            </p>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Record</span>
                  <Trophy className="w-3 h-3 text-amber-500" />
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                  {topGameScore > 0 ? `${topGameScore} pts` : "0 pts"}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {topGameScore > 0 ? "Personal top" : "No runs logged"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Break Time</span>
                  <Clock className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                  2 mins
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Recommended</span>
              </div>
            </div>
          </div>

          <Link
            to="/anxiety-game"
            onClick={() => sounds.playClick()}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Cognitive Reset Game</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
