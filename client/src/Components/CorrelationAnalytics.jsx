import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  TrendingUp,
  Brain,
  Moon,
  Sparkles,
  BarChart3,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { PixelFlame, PixelStar, PixelHeart, PixelOwl } from "./PixelIcons";

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
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 animate-pulse">
        <div className="h-80 bg-white border-2 border-[#18181B] rounded-2xl shadow-[4px_4px_0px_#18181B]" />
      </div>
    );
  }

  const summary = correlationData?.summary || { avg_mood: 0, avg_stress: 0, avg_energy: 0, total_logs: 0 };
  const weeklyTrend = correlationData?.weeklyTrend || [];
  const triggerImpact = correlationData?.triggerImpact || [];
  const sleepCorrelation = correlationData?.sleepCorrelation || [];

  return (
    <div id="analytics" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24 space-y-8">
      {/* 1. Header Banner */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#FFEAA7] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <Sparkles className="w-3.5 h-3.5" />
              CORRELATION ENGINE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Mood & Lifestyle Correlations
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-1 max-w-xl">
              Unpack how sleep cycles, behavioral triggers, and journaling themes shape your emotional baseline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-['Silkscreen'] text-[#18181B]/70 bg-white px-2.5 py-1 rounded border border-[#18181B]">
              SYNTHESIS V2.0
            </span>
          </div>
        </div>

        {/* Quick HUD Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border-2 border-[#18181B] rounded-xl p-4 shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/60">
                AVG MOOD
              </span>
              <PixelHeart className="w-4 h-4 text-[#00B894]" />
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Press_Start_2P'] text-[#00B894] mt-2 block">
              {summary.avg_mood ? `${summary.avg_mood}` : "—"}
              <span className="text-xs font-['Silkscreen'] text-[#18181B]/40">/10</span>
            </span>
          </div>

          <div className="bg-white border-2 border-[#18181B] rounded-xl p-4 shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/60">
                AVG STRESS
              </span>
              <PixelFlame className="w-4 h-4 text-[#D63031]" />
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Press_Start_2P'] text-[#D63031] mt-2 block">
              {summary.avg_stress ? `${summary.avg_stress}` : "—"}
              <span className="text-xs font-['Silkscreen'] text-[#18181B]/40">/10</span>
            </span>
          </div>

          <div className="bg-white border-2 border-[#18181B] rounded-xl p-4 shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/60">
                ENERGY
              </span>
              <PixelStar className="w-4 h-4 text-[#F1C40F]" />
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Press_Start_2P'] text-[#F1C40F] mt-2 block">
              {summary.avg_energy ? `${summary.avg_energy}` : "—"}
              <span className="text-xs font-['Silkscreen'] text-[#18181B]/40">/5</span>
            </span>
          </div>

          <div className="bg-white border-2 border-[#18181B] rounded-xl p-4 shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/60">
                TOTAL LOGS
              </span>
              <span className="text-xs">📜</span>
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Press_Start_2P'] text-[#18181B] mt-2 block">
              {summary.total_logs || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STANDOUT: AI REFLECTION INSIGHT CARD */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#18181B]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-[#18181B] bg-[#74B9FF] flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              <Brain className="w-5 h-5 text-[#18181B]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#18181B] font-['Bricolage_Grotesque']">
                AI Synthesis & Guided Reflection
              </h3>
              <p className="text-xs text-[#18181B]/70">
                Empathetic, non-diagnostic pattern detection across your journal logs.
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => handlePeriodChange(d)}
                className={`px-3 py-1 rounded text-xs font-['Silkscreen'] border-2 border-[#18181B] cursor-pointer transition ${
                  insightDays === d
                    ? "bg-[#FFEAA7] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                    : "bg-white text-[#18181B]/60 hover:text-[#18181B]"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {loadingAi ? (
          <div className="h-32 flex items-center justify-center text-xs font-['Silkscreen'] text-[#18181B]/50">
            COMPUTING RECURRING PATTERNS...
          </div>
        ) : aiInsights ? (
          <div className="space-y-6">
            {/* Summary Observation */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-['Silkscreen'] text-[#6C5CE7]">
                <PixelOwl className="w-4 h-4" />
                <span>KIZU'S OBSERVATION</span>
              </div>
              <p className="text-xs sm:text-sm text-[#18181B] leading-relaxed font-medium">
                {aiInsights.summary}
              </p>
            </div>

            {/* Recurring Themes & Trajectory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
                <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/70 uppercase tracking-wider block mb-2.5">
                  RECURRING THEMES
                </span>
                {aiInsights.recurringThemes && aiInsights.recurringThemes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {aiInsights.recurringThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded text-xs font-['Silkscreen'] bg-[#FFEAA7] border border-[#18181B] text-[#18181B]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#18181B]/50 font-['Silkscreen']">MORE ENTRIES NEEDED FOR THEMES</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
                <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/70 uppercase tracking-wider block mb-2">
                  EMOTIONAL TRAJECTORY
                </span>
                <p className="text-xs font-black font-['Press_Start_2P'] text-[#00B894] uppercase mt-1">
                  {aiInsights.sentimentTrajectory || "CONSISTENT"}
                </p>
              </div>
            </div>

            {/* Guided Reflection Prompts */}
            {aiInsights.reflectionPrompts && aiInsights.reflectionPrompts.length > 0 && (
              <div>
                <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/70 block mb-2.5">
                  SUGGESTED SELF-REFLECTION PROMPTS
                </span>
                <div className="space-y-2">
                  {aiInsights.reflectionPrompts.map((prompt, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-lg bg-white border-2 border-[#18181B] text-xs text-[#18181B] font-medium flex items-start gap-2.5 shadow-[2px_2px_0px_#18181B]"
                    >
                      <span className="font-['Press_Start_2P'] text-[10px] text-[#E17055] mt-0.5">
                        Q{pIdx + 1}
                      </span>
                      <span>{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Diagnostic Disclaimer */}
            <div className="flex items-center gap-2 text-[10px] font-['Silkscreen'] text-[#18181B]/50 pt-2 border-t border-[#18181B]/15">
              <ShieldCheck className="w-3.5 h-3.5 text-[#18181B]/50 flex-shrink-0" />
              <span>{aiInsights.disclaimer || "DESCRIPTIVE WELLNESS INSIGHTS ONLY. NOT A CLINICAL DIAGNOSIS."}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. CHARTS GRID: WEEKLY MOOD TREND & TRIGGER IMPACT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Weekly Mood Trajectory Chart */}
        <div className="pixel-card p-6 bg-[#FAF8F5] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#18181B]/15">
              <h3 className="text-xs font-['Silkscreen'] text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0984E3]" />
                7-DAY MOOD TRAJECTORY
              </h3>
              <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/50">PAST WEEK</span>
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
                      <span className="text-[9px] font-['Press_Start_2P'] text-[#18181B]/80 group-hover:text-[#0984E3] transition">
                        {item.avg_score}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t border-2 border-[#18181B] transition-all duration-300 ${
                          isHigh
                            ? "bg-[#55EFC4]"
                            : isMid
                            ? "bg-[#FFEAA7]"
                            : "bg-[#FF7675]"
                        } shadow-[2px_0px_0px_#18181B]`}
                      />
                      <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/70">
                        {item.day_name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs font-['Silkscreen'] text-[#18181B]/40">
                LOG MOODS TO SEE 7-DAY TRAJECTORY
              </div>
            )}
          </div>
          <div className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 pt-3 border-t border-[#18181B]/15">
            GREEN: 7+ POSITIVE · YELLOW: 5-6 CALM · RED: 1-4 TENSE
          </div>
        </div>

        {/* Trigger Impact Matrix */}
        <div className="pixel-card p-6 bg-[#FAF8F5] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#18181B]/15">
              <h3 className="text-xs font-['Silkscreen'] text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#00B894]" />
                TRIGGER CORRELATION MATRIX
              </h3>
              <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/50">AVG SCORE</span>
            </div>

            {triggerImpact.length > 0 ? (
              <div className="space-y-3 my-2">
                {triggerImpact.slice(0, 5).map((t, idx) => {
                  const widthPercent = (t.avg_score_with_trigger / 10) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-xs font-['Bricolage_Grotesque'] text-[#18181B]">{t.trigger_name}</span>
                        <span className="text-[10px] font-['Press_Start_2P'] text-[#18181B]">
                          {t.avg_score_with_trigger}/10 <span className="text-[9px] text-[#18181B]/50">({t.frequency}x)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white h-3 rounded border-2 border-[#18181B] p-0.5 shadow-[1.5px_1.5px_0px_#18181B]">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className={`h-full rounded-xs ${
                            t.avg_score_with_trigger >= 7
                              ? "bg-[#55EFC4]"
                              : t.avg_score_with_trigger >= 5
                              ? "bg-[#FFEAA7]"
                              : "bg-[#FF7675]"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs font-['Silkscreen'] text-[#18181B]/40">
                ADD TRIGGERS TO CHECK-INS TO VIEW CORRELATION
              </div>
            )}
          </div>
          <div className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 pt-3 border-t border-[#18181B]/15">
            DISCOVERS WHICH FACTORS STABILIZE OR DRAIN YOU
          </div>
        </div>
      </div>

      {/* 4. SLEEP VS MOOD CORRELATION */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#18181B]/15">
          <div>
            <h3 className="text-xs font-['Silkscreen'] text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-[#0984E3]" />
              SLEEP & MOOD CORRELATION STREAM
            </h3>
            <p className="text-xs text-[#18181B]/70 mt-0.5">
              Direct relationship between recorded night rest and daily mood ratings.
            </p>
          </div>
        </div>

        {sleepCorrelation.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#18181B]/20 text-[#18181B]/60 uppercase font-['Silkscreen'] tracking-wider text-[10px]">
                  <th className="pb-2.5">DATE</th>
                  <th className="pb-2.5">SLEEP DURATION</th>
                  <th className="pb-2.5">QUALITY</th>
                  <th className="pb-2.5">MOOD SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/10">
                {sleepCorrelation.map((row, i) => (
                  <tr key={i} className="hover:bg-white/80 transition">
                    <td className="py-3 font-semibold text-[#18181B] font-['Silkscreen'] text-[11px]">{row.log_date}</td>
                    <td className="py-3 font-['Press_Start_2P'] text-[10px] text-[#0984E3]">{row.sleep_hours} hrs</td>
                    <td className="py-3 text-[#F1C40F] text-base">
                      {"★".repeat(row.sleep_quality || 3)}
                      <span className="text-[#18181B]/20">{"★".repeat(5 - (row.sleep_quality || 3))}</span>
                    </td>
                    <td className="py-3 font-extrabold">
                      {row.mood_score ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-['Silkscreen'] border border-[#18181B] ${
                            row.mood_score >= 7
                              ? "bg-[#55EFC4] text-[#18181B]"
                              : row.mood_score >= 5
                              ? "bg-[#FFEAA7] text-[#18181B]"
                              : "bg-[#FF7675] text-[#18181B]"
                          }`}
                        >
                          {row.mood_score}/10
                        </span>
                      ) : (
                        <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/40">NO MOOD LOG</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-['Silkscreen'] text-[#18181B]/40 bg-white border-2 border-dashed border-[#18181B]/30 rounded-xl">
            LOG SLEEP IN THE HABITS TAB TO GENERATE CORRELATION METRICS!
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationAnalytics;
