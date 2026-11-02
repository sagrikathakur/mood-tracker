import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react";
import { EMOTIONS } from "./MoodTracker";
import { PixelStar } from "./PixelIcons";
import { sounds } from "../utils/soundEffects";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
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
    <div id="mood-calendar" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-8 scroll-mt-24">
      <div className="pixel-card bg-white p-6 sm:p-9">
        {/* Header & Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-[#18181B] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#FEF9C3] text-[#18181B] mb-2 font-pixel text-[10px]">
              <PixelStar className="w-3.5 h-3.5" fill="#EAB308" />
              MONTHLY ADVENTURE MAP
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              Pixel Mood Calendar
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] font-bold mt-0.5">
              Every day logged forms an 8-bit mosaic. Click any date to inspect moments.
            </p>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded-2xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
            <button
              onClick={handlePrevMonth}
              className="pixel-btn pixel-btn-white p-1.5 text-xs font-pixel"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-pixel text-xs text-[#18181B] min-w-[130px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="pixel-btn pixel-btn-white p-1.5 text-xs font-pixel"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend & Stats Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] mb-6 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[10px] text-[#18181B]">COLOR KEY:</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded bg-[#4ADE80] border border-[#18181B]" />
              <span>Positive (7+)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded bg-[#FACC15] border border-[#18181B]" />
              <span>Neutral (5-6)</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-3 rounded bg-[#FB7185] border border-[#18181B]" />
              <span>Heavy (1-4)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-pixel text-[10px] text-[#18181B]">
            <span>LOGGED: {loggedDaysCount}/{daysInMonth} DAYS</span>
            {avgMonthlyScore && <span>AVG: {avgMonthlyScore}/10</span>}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center font-pixel text-[10px] text-slate-500"
            >
              {d}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-slate-100/40 border border-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dataForDay = dayDataMap[dayNum];
            const hasData = Boolean(dataForDay);

            let dayBadgeClass = "bg-white hover:bg-slate-50 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-[#18181B]";
            let moodScoreText = null;

            if (hasData) {
              if (dataForDay.avg_score >= 7) {
                dayBadgeClass = "bg-[#4ADE80] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] text-[#18181B] hover:-translate-y-1";
              } else if (dataForDay.avg_score >= 5) {
                dayBadgeClass = "bg-[#FACC15] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] text-[#18181B] hover:-translate-y-1";
              } else {
                dayBadgeClass = "bg-[#FB7185] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] text-[#18181B] hover:-translate-y-1";
              }
              moodScoreText = dataForDay.avg_score;
            }

            const dominantEmotionObj = hasData
              ? EMOTIONS.find((e) => e.name === dataForDay.dominant_emotion)
              : null;

            return (
              <button
                key={dayNum}
                onClick={() => handleDateClick(dayNum, dataForDay)}
                className={`h-20 sm:h-24 rounded-xl p-2 flex flex-col justify-between items-start transition-all cursor-pointer text-left ${dayBadgeClass}`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="font-pixel text-[11px] font-bold">{dayNum}</span>
                  {dominantEmotionObj && (
                    <span className="text-base sm:text-lg">
                      {dominantEmotionObj.emoji}
                    </span>
                  )}
                </div>

                {hasData ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between font-pixel text-[10px]">
                      <span>{moodScoreText}/10</span>
                      <span className="opacity-75">{dataForDay.count}x</span>
                    </div>
                    <span className="text-[10px] font-bold block truncate opacity-85">
                      {dataForDay.dominant_emotion}
                    </span>
                  </div>
                ) : (
                  <span className="font-pixel text-[9px] text-slate-300">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAY INSPECTOR RETRO MODAL */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="pixel-card bg-white max-w-lg w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto shadow-[6px_6px_0px_#18181B]">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedDayInfo(null);
              }}
              className="pixel-btn pixel-btn-white absolute top-6 right-6 p-1.5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-pixel text-[10px] text-[#22C55E] mb-1">
              <span>📜</span> DAY LOG QUEST INSPECTOR
            </div>
            <h3 className="font-display text-2xl font-black text-[#18181B] mb-4">
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
                <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                  <div className="flex items-center justify-between mb-3 border-b border-[#18181B]/20 pb-2">
                    <span className="font-pixel text-[10px] text-slate-600 uppercase">
                      AVERAGE DAY MOOD
                    </span>
                    <span
                      className={`font-pixel text-xs px-2.5 py-0.5 rounded border border-[#18181B] ${
                        selectedDayInfo.data.avg_score >= 7
                          ? "bg-[#4ADE80]"
                          : selectedDayInfo.data.avg_score >= 5
                          ? "bg-[#FACC15]"
                          : "bg-[#FB7185]"
                      }`}
                    >
                      {selectedDayInfo.data.avg_score}/10 · {selectedDayInfo.data.dominant_emotion}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    <span className="font-pixel text-[10px] text-[#18181B] block">
                      CHECK-IN LOGS ({selectedDayInfo.data.entries.length}):
                    </span>
                    {selectedDayInfo.data.entries.map((entry, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border-2 border-[#18181B] text-xs flex flex-col gap-1 shadow-[1.5px_1.5px_0px_#18181B]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-sm text-[#18181B]">
                            {entry.emotion} ({entry.score}/10)
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {entry.time}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-slate-700 italic font-medium">"{entry.notes}"</p>
                        )}
                        {entry.triggers && entry.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.triggers.map((t, tidx) => (
                              <span
                                key={tidx}
                                className="text-[9px] font-bold bg-[#FAF8F5] border border-[#18181B] px-1.5 py-0.2 rounded"
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
              <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-dashed border-[#18181B] text-center font-pixel text-xs text-slate-400 mb-6">
                NO MOOD LOGGED FOR THIS DATE
              </div>
            )}

            {/* Journals for that date */}
            <div>
              <span className="font-pixel text-[10px] text-[#18181B] block mb-2">
                JOURNAL WRITINGS:
              </span>
              {loadingDayDetails ? (
                <div className="h-16 flex items-center justify-center font-pixel text-xs text-slate-400">
                  LOADING JOURNALS...
                </div>
              ) : dayJournals.length > 0 ? (
                <div className="space-y-3">
                  {dayJournals.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-[#18181B] text-xs space-y-2 shadow-[2px_2px_0px_#18181B]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-sm text-[#18181B] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#22C55E]" />
                          Mood: {j.mood}
                        </span>
                        {j.is_private && (
                          <span className="font-pixel text-[9px] bg-white border border-[#18181B] px-1.5 py-0.5 rounded">
                            PRIVATE
                          </span>
                        )}
                      </div>
                      <p className="text-[#18181B] whitespace-pre-wrap leading-relaxed font-bold">
                        {j.content || "Empty content"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border-2 border-dashed border-[#18181B] text-center font-pixel text-xs text-slate-400">
                  NO WRITTEN JOURNAL ENTRY
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
