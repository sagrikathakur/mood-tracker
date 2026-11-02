import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { EMOTIONS } from "./MoodTracker";
import { sounds } from "../utils/soundEffects";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MoodCalendar = ({ refreshKey }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [dayJournals, setDayJournals] = useState([]);
  const [loadingDayDetails, setLoadingDayDetails] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/moods/calendar?year=${year}&month=${month}`);
      if (res.data?.calendar) {
        setCalendarData(res.data.calendar);
      }
    } catch (err) {
      console.warn("Could not fetch calendar:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month, refreshKey]);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    sounds.playClick();
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    sounds.playClick();
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDateClick = async (dayNumber, dataForDay) => {
    sounds.playClick();
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    setSelectedDayInfo({
      date: formattedDate,
      dayNumber,
      data: dataForDay || null,
    });

    setLoadingDayDetails(true);
    try {
      const res = await api.get(`/api/journal?startDate=${formattedDate}&endDate=${formattedDate}`);
      setDayJournals(res.data?.entries || []);
    } catch (err) {
      setDayJournals([]);
    } finally {
      setLoadingDayDetails(false);
    }
  };

  const dayDataMap = {};
  calendarData.forEach((item) => {
    const dNum = parseInt(item.date.split("-")[2], 10);
    dayDataMap[dNum] = item;
  });

  const loggedDaysCount = Object.keys(dayDataMap).length;
  const avgMonthlyScore =
    loggedDaysCount > 0
      ? (
          Object.values(dayDataMap).reduce((acc, curr) => acc + curr.avg_score, 0) /
          loggedDaysCount
        ).toFixed(1)
      : null;

  return (
    <div id="mood-calendar" className="w-full scroll-mt-24 select-none">
      <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-9 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10]">
        {/* Header & Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-[#0a1b10]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] font-mono text-xs font-bold shadow-[2px_2px_0px_#64DC4C] mb-2">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>[ MATRIX // MONTHLY EMOTIONAL TELEMETRY ]</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a1b10] tracking-tight font-display">
              Dev Mood Calendar
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
              Every day logged forms your cognitive roadmap. Click any date to inspect dev moments.
            </p>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-[#90D786] text-[#0a1b10] transition-all cursor-pointer border border-transparent hover:border-[#0a1b10]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-mono font-black text-[#0a1b10] min-w-[140px] text-center uppercase">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-[#90D786] text-[#0a1b10] transition-all cursor-pointer border border-transparent hover:border-[#0a1b10]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend & Stats Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] mb-6 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-[#0a1b10] uppercase tracking-wider text-[11px]">LEGEND:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-sm bg-[#90D786] border border-[#0a1b10]" />
              <span>Flow (7+)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-sm bg-amber-400 border border-[#0a1b10]" />
              <span>Steady (5-6)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-sm bg-rose-400 border border-[#0a1b10]" />
              <span>Burnout (1-4)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-800">
            <span>LOGGED: <strong className="text-[#0a1b10] font-black">{loggedDaysCount}/{daysInMonth}</strong> DAYS</span>
            {avgMonthlyScore && <span>AVG: <strong className="text-emerald-800 font-black">{avgMonthlyScore}/10</strong></span>}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              {d}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/40 border border-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dataForDay = dayDataMap[dayNum];
            const hasData = Boolean(dataForDay);

            let dayBadgeClass = "bg-slate-50/60 hover:bg-white border-slate-200/70 text-slate-700";

            if (hasData) {
              if (dataForDay.avg_score >= 7) {
                dayBadgeClass = "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs hover:bg-emerald-100/80 hover:-translate-y-0.5";
              } else if (dataForDay.avg_score >= 5) {
                dayBadgeClass = "bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs hover:bg-amber-100/80 hover:-translate-y-0.5";
              } else {
                dayBadgeClass = "bg-rose-50/90 border-rose-300 text-rose-950 shadow-2xs hover:bg-rose-100/80 hover:-translate-y-0.5";
              }
            }

            const dominantEmotionObj = hasData
              ? EMOTIONS.find((e) => e.name === dataForDay.dominant_emotion)
              : null;

            return (
              <button
                key={dayNum}
                onClick={() => handleDateClick(dayNum, dataForDay)}
                className={`h-20 sm:h-24 rounded-2xl p-2.5 border flex flex-col justify-between items-start transition-all cursor-pointer text-left ${dayBadgeClass}`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold">{dayNum}</span>
                  {dominantEmotionObj && (
                    <span className="text-base sm:text-lg">
                      {dominantEmotionObj.emoji}
                    </span>
                  )}
                </div>

                {hasData ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>{dataForDay.avg_score}/10</span>
                      <span className="opacity-60">{dataForDay.count}x</span>
                    </div>
                    <span className="text-[10px] font-medium block truncate opacity-80">
                      {dataForDay.dominant_emotion}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAY INSPECTOR MODAL */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 relative max-h-[85vh] overflow-y-auto shadow-xl">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedDayInfo(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Day Record Inspector</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 font-display mb-4">
              {new Date(selectedDayInfo.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            {/* Check-ins Summary */}
            {selectedDayInfo.data ? (
              <div className="space-y-4 mb-6">
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Average Day Mood
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        selectedDayInfo.data.avg_score >= 7
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : selectedDayInfo.data.avg_score >= 5
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-rose-100 text-rose-900 border-rose-300"
                      }`}
                    >
                      {selectedDayInfo.data.avg_score}/10 · {selectedDayInfo.data.dominant_emotion}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      Check-in Logs ({selectedDayInfo.data.entries.length}):
                    </span>
                    {selectedDayInfo.data.entries.map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs flex flex-col gap-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {entry.emotion} ({entry.score}/10)
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {entry.time}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-slate-600 italic font-medium">"{entry.notes}"</p>
                        )}
                        {entry.triggers && entry.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.triggers.map((t, tidx) => (
                              <span
                                key={tidx}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 mb-6">
                No mood check-ins logged for this date.
              </div>
            )}

            {/* Journals for that date */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2.5">
                Written Dev Reflections:
              </span>
              {loadingDayDetails ? (
                <div className="h-16 flex items-center justify-center text-xs text-slate-400">
                  Loading reflections...
                </div>
              ) : dayJournals.length > 0 ? (
                <div className="space-y-3">
                  {dayJournals.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          Mood: {j.mood}
                        </span>
                        {j.is_private && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {j.content || "Empty content"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No written journal entry on this day.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCalendar;
