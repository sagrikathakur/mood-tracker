import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  TrendingUp,
  Brain,
  Moon,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Code2,
  Heart,
  Flame,
  Zap,
  BookOpen,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

const CorrelationAnalytics = ({ refreshKey }) => {
  const [correlationData, setCorrelationData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [insightDays, setInsightDays] = useState(7);

  const fetchCorrelation = async () => {
    try {
      const res = await api.get("/api/moods/correlation");
      if (res.data?.correlation) {
        setCorrelationData(res.data.correlation);
      }
    } catch (err) {
      console.warn("Could not load correlation data:", err?.message);
    }
  };

  const fetchAiReflections = async (days = 7) => {
    setLoadingAi(true);
    try {
      const res = await api.get(`/api/ai/insights?days=${days}`);
      if (res.data?.insights) {
        setAiInsights(res.data.insights);
      }
    } catch (err) {
      console.warn("Could not load AI reflections:", err?.message);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCorrelation(), fetchAiReflections(insightDays)]);
      setLoading(false);
    };
    init();
  }, [refreshKey]);

  const handlePeriodChange = (days) => {
    sounds.playClick();
    setInsightDays(days);
    fetchAiReflections(days);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6 animate-pulse">
        <div className="h-80 bg-slate-100 rounded-3xl border border-slate-200/60" />
      </div>
    );
  }

  const summary = correlationData?.summary || { avg_mood: 0, avg_stress: 0, avg_energy: 0, total_logs: 0 };
  const weeklyTrend = correlationData?.weeklyTrend || [];
  const triggerImpact = correlationData?.triggerImpact || [];
  const sleepCorrelation = correlationData?.sleepCorrelation || [];

  return (
    <div id="analytics" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24 space-y-6">
      {/* 1. Header Banner & HUD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Calm Me · Burnout Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Developer State & Burnout Correlations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium">
              Understand how sprint crunch, sleep cycles, and debugging triggers correlate with your mental bandwidth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              Correlation Engine Active
            </span>
          </div>
        </div>

        {/* Quick HUD Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg Mood
              </span>
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500/30" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block font-display">
              {summary.avg_mood ? `${summary.avg_mood}` : "—"}
              <span className="text-xs font-semibold text-slate-400">/10</span>
            </span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg Stress
              </span>
              <Flame className="w-4 h-4 text-rose-600 fill-rose-500/30" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block font-display">
              {summary.avg_stress ? `${summary.avg_stress}` : "—"}
              <span className="text-xs font-semibold text-slate-400">/10</span>
            </span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Energy
              </span>
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400/30" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block font-display">
              {summary.avg_energy ? `${summary.avg_energy}` : "—"}
              <span className="text-xs font-semibold text-slate-400">/5</span>
            </span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Logs
              </span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block font-display">
              {summary.total_logs || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STANDOUT: AI REFLECTION INSIGHT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                AI Synthesis & Guided Reflection
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Empathetic, non-diagnostic developer pattern detection across your daily journals.
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handlePeriodChange(d)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  insightDays === d
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {loadingAi ? (
          <div className="h-32 flex items-center justify-center text-xs font-medium text-slate-400">
            Analyzing recurring developer patterns...
          </div>
        ) : aiInsights ? (
          <div className="space-y-6">
            {/* Summary Observation */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span>Calm Me Insights</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {aiInsights.summary}
              </p>
            </div>

            {/* Recurring Themes & Trajectory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Recurring Stressors & Themes
                </span>
                {aiInsights.recurringThemes && aiInsights.recurringThemes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {aiInsights.recurringThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200/60 text-emerald-800"
                      >
                        #{theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">More entries needed to detect recurring themes.</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Emotional Trajectory
                </span>
                <p className="text-base font-black text-emerald-600 uppercase font-display mt-1">
                  {aiInsights.sentimentTrajectory || "Steady & Calm"}
                </p>
              </div>
            </div>

            {/* Guided Reflection Prompts */}
            {aiInsights.reflectionPrompts && aiInsights.reflectionPrompts.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                  Suggested Self-Reflection Prompts
                </span>
                <div className="space-y-2">
                  {aiInsights.reflectionPrompts.map((prompt, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-700 font-medium flex items-start gap-2.5"
                    >
                      <span className="font-bold text-indigo-600 mt-0.5 shrink-0">
                        {pIdx + 1}.
                      </span>
                      <span>{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Diagnostic Disclaimer */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 font-medium">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{aiInsights.disclaimer || "Descriptive wellness insights only. Not a medical conclusion or clinical diagnosis."}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. CHARTS GRID: WEEKLY MOOD TREND & TRIGGER IMPACT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Weekly Mood Trajectory Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                7-Day Mood Trajectory
              </h3>
              <span className="text-xs text-slate-400 font-medium">Past Week</span>
            </div>

            {weeklyTrend.length > 0 ? (
              <div className="h-44 flex items-end gap-2 pt-6 pb-2">
                {weeklyTrend.map((item, idx) => {
                  const heightPercent = Math.max(15, (item.avg_score / 10) * 100);
                  const isHigh = item.avg_score >= 7;
                  const isMid = item.avg_score >= 5;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => sounds.playBlip(350 + idx * 40, 0.03)}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-600 transition">
                        {item.avg_score}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isHigh
                            ? "bg-emerald-500"
                            : isMid
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {item.day_name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-medium">
                Log moods to see 7-day trajectory
              </div>
            )}
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-3 border-t border-slate-100">
            Green: 7+ High Clarity · Yellow: 5-6 Steady · Coral: 1-4 Burnout Tension
          </div>
        </div>

        {/* Trigger Impact Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Burnout Trigger Correlation
              </h3>
              <span className="text-xs text-slate-400 font-medium">Avg Score</span>
            </div>

            {triggerImpact.length > 0 ? (
              <div className="space-y-3 my-2">
                {triggerImpact.slice(0, 5).map((t, idx) => {
                  const widthPercent = (t.avg_score_with_trigger / 10) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-xs text-slate-700">{t.trigger_name}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {t.avg_score_with_trigger}/10 <span className="text-slate-400">({t.frequency}x)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className={`h-full rounded-full ${
                            t.avg_score_with_trigger >= 7
                              ? "bg-emerald-500"
                              : t.avg_score_with_trigger >= 5
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-medium">
                Add triggers to check-ins to decode correlations
              </div>
            )}
          </div>
          <div className="text-[11px] font-medium text-slate-400 pt-3 border-t border-slate-100">
            Unveils which factors deplete or recharge your engineering energy
          </div>
        </div>
      </div>

      {/* 4. SLEEP VS MOOD CORRELATION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-sky-600" />
              Sleep & Developer Mood Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Direct relationship between recorded rest and coding performance.
            </p>
          </div>
        </div>

        {sleepCorrelation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Sleep Duration</th>
                  <th className="pb-2.5">Quality</th>
                  <th className="pb-2.5">Mood Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sleepCorrelation.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-semibold text-slate-800 text-xs">{row.log_date}</td>
                    <td className="py-3 font-bold text-sky-600">{row.sleep_hours} hrs</td>
                    <td className="py-3 text-amber-400 text-sm">
                      {"★".repeat(row.sleep_quality || 3)}
                      <span className="text-slate-200">{"★".repeat(5 - (row.sleep_quality || 3))}</span>
                    </td>
                    <td className="py-3 font-bold">
                      {row.mood_score ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.mood_score >= 7
                              ? "bg-emerald-100 text-emerald-800"
                              : row.mood_score >= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {row.mood_score}/10
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Mood Log</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
            Log sleep in Habits to generate correlation insights!
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationAnalytics;
