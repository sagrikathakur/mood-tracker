import React, { useState, useEffect } from "react";
import api from "../utils/api";
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Smile,
  Layers,
  LayoutGrid,
  Columns,
  CalendarDays,
  Tag,
  Check,
} from "lucide-react";
import { EMOTIONS } from "./MoodTracker";
import { PixelFox, PixelOwl } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EVENT_TAGS = [
  { id: "code", label: "Deep Work", color: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "wellness", label: "Recovery", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { id: "meeting", label: "Sync / Meet", color: "bg-purple-100 text-purple-900 border-purple-300" },
  { id: "break", label: "Break", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "deadline", label: "Sprint Milestone", color: "bg-rose-100 text-rose-900 border-rose-300" },
];

const DAY_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const formatHourLabel = (hour) => {
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${ampm}`;
};

export const MoodCalendar = ({ refreshKey, onWriteForDate, initialView = "month" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(initialView); // "month" | "week" | "day"
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduled Events State (persisted in localStorage)
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal / Scheduling State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventHour, setNewEventHour] = useState(10);
  const [newEventTag, setNewEventTag] = useState("code");

  // Selected Day Details Modal
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [dayJournals, setDayJournals] = useState([]);
  const [loadingDayDetails, setLoadingDayDetails] = useState(false);

  // Sync events with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_calendar_events", JSON.stringify(events));
    } catch (e) {
      console.warn("Could not sync events", e);
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 1. Fetch Month Telemetry
  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/moods/calendar?year=${year}&month=${month}`);
      if (res.data?.calendar) {
        setCalendarData(res.data.calendar);
      }
    } catch (err) {
      console.warn("Could not fetch calendar telemetry:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month, refreshKey]);

  // Date Calculations
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrev = () => {
    sounds.playClick();
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 2, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    sounds.playClick();
    setCurrentDate(new Date());
  };

  // Day Click Inspector
  const handleDateClick = async (dateStr, dataForDay) => {
    sounds.playClick();
    setSelectedDayInfo({
      date: dateStr,
      data: dataForDay || null,
      events: events.filter((e) => e.date === dateStr),
    });

    setLoadingDayDetails(true);
    try {
      const res = await api.get(`/api/journal?startDate=${dateStr}&endDate=${dateStr}`);
      setDayJournals(res.data?.entries || []);
    } catch (err) {
      setDayJournals([]);
    } finally {
      setLoadingDayDetails(false);
    }
  };

  // Open Scheduler modal prefilled
  const handleOpenScheduler = (dateStr = null, hour = null) => {
    sounds.playClick();
    if (dateStr) setNewEventDate(dateStr);
    if (hour !== null) setNewEventHour(hour);
    setIsEventModalOpen(true);
  };

  // Create Event
  const handleCreateEvent = (e) => {
    if (e) e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error("Please enter an event or task name.");
      return;
    }

    sounds.playSuccess();
    const tagObj = EVENT_TAGS.find((t) => t.id === newEventTag) || EVENT_TAGS[0];
    const newEvt = {
      id: Date.now(),
      title: newEventTitle.trim(),
      date: newEventDate,
      hour: parseInt(newEventHour, 10),
      tagId: tagObj.id,
      tagLabel: tagObj.label,
      tagColor: tagObj.color,
      completed: false,
    };

    setEvents((prev) => [...prev, newEvt]);
    setNewEventTitle("");
    setIsEventModalOpen(false);
    toast.success("Event scheduled on calendar!");
  };

  const handleToggleEvent = (id) => {
    sounds.playPop(350);
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, completed: !evt.completed } : evt))
    );
  };

  const handleDeleteEvent = (id) => {
    sounds.playClick();
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    toast("Event removed.");
  };

  // Map monthly data
  const dayDataMap = {};
  calendarData.forEach((item) => {
    const dNum = parseInt(item.date.split("-")[2], 10);
    dayDataMap[dNum] = item;
  });

  // Week Days array
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const currentDateIso = currentDate.toISOString().slice(0, 10);

  return (
    <div id="mood-calendar" className="w-full space-y-6 select-none animate-in fade-in duration-200">
      
      {/* =========================================================================
          MAIN CALENDAR CONTAINER
         ========================================================================= */}
      <div className="bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-5 sm:p-8 shadow-[5px_5px_0px_#0a1b10] space-y-6">
        
        {/* 1. Header Toolbar: Title, View Switcher, Navigator, Add Event */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b-2 border-[#0a1b10]/15">
          {/* Title & Mascot */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#64DC4C] border-2 border-[#0a1b10] text-[#0a1b10] flex items-center justify-center shadow-[1px_1px_0px_#0a1b10]">
              <CalendarIcon className="w-5 h-5 text-[#0a1b10]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0a1b10] font-display">
                Sanctuary Calendar
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Schedule sprint focus, recovery rituals, and track daily emotional stamina
              </p>
            </div>
          </div>

          {/* Controls: Navigator + View Tabs + Add Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Tabs (Month | Week | Day) */}
            <div className="flex items-center p-1 bg-white border-2 border-[#0a1b10] rounded-2xl shadow-[2px_2px_0px_#0a1b10] text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setViewMode("month");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "month"
                    ? "bg-[#0a1b10] text-[#64DC4C]"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setViewMode("week");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "week"
                    ? "bg-[#0a1b10] text-[#64DC4C]"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Week</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setViewMode("day");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "day"
                    ? "bg-[#0a1b10] text-[#64DC4C]"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-xl hover:bg-[#64DC4C]/30 text-[#0a1b10] transition cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-mono font-black text-[#0a1b10] hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Today
              </button>

              <span className="text-xs font-mono font-black text-[#0a1b10] px-2 min-w-[120px] text-center">
                {viewMode === "month" && `${MONTH_NAMES[month - 1]} ${year}`}
                {viewMode === "week" &&
                  `${currentWeekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${currentWeekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                {viewMode === "day" &&
                  currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" })}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-xl hover:bg-[#64DC4C]/30 text-[#0a1b10] transition cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Schedule Event Action */}
            <button
              type="button"
              onClick={() => handleOpenScheduler()}
              className="px-4 py-2 rounded-2xl bg-[#64DC4C] hover:bg-[#52c83b] active:translate-y-0.5 text-[#0a1b10] text-xs font-black uppercase tracking-wide border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] cursor-pointer flex items-center gap-1.5 transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: MONTH VIEW (30-Day Grid with Mood & Scheduled Badges)
           ========================================================================= */}
        {viewMode === "month" && (
          <div className="space-y-4">
            {/* Legend & Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] text-xs">
              <div className="flex items-center gap-3 flex-wrap font-bold text-slate-800">
                <span className="font-mono font-black text-[#0a1b10] uppercase text-[11px]">Mood Legend:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-[#64DC4C] border border-[#0a1b10]" />
                  <span>Flow (7+)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-amber-300 border border-[#0a1b10]" />
                  <span>Steady (5-6)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 rounded-md bg-rose-300 border border-[#0a1b10]" />
                  <span>Burnout (1-4)</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700">
                <span>{events.length} scheduled events</span>
              </div>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d}
                  className="py-1.5 text-center text-xs font-mono font-bold uppercase tracking-wider text-slate-400"
                >
                  {d}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-20 sm:h-24 rounded-2xl bg-slate-100/40 border border-transparent"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dataForDay = dayDataMap[dayNum];
                const dayEvents = events.filter((e) => e.date === dateStr);
                const hasMood = Boolean(dataForDay);

                let cellBg = "bg-white border-[#0a1b10]/20 hover:border-[#0a1b10]";
                if (hasMood) {
                  if (dataForDay.avg_score >= 7) cellBg = "bg-emerald-50/90 border-[#0a1b10] hover:bg-emerald-100";
                  else if (dataForDay.avg_score >= 5) cellBg = "bg-amber-50/90 border-[#0a1b10] hover:bg-amber-100";
                  else cellBg = "bg-rose-50/90 border-[#0a1b10] hover:bg-rose-100";
                }

                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleDateClick(dateStr, dataForDay)}
                    className={`h-22 sm:h-26 rounded-2xl p-2 border-2 flex flex-col justify-between items-start transition-all cursor-pointer text-left shadow-[2px_2px_0px_#0a1b10] hover:-translate-y-0.5 ${cellBg}`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-xs font-black font-mono px-1.5 py-0.5 rounded-lg ${
                          isToday ? "bg-[#0a1b10] text-[#64DC4C]" : "text-[#0a1b10]"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {hasMood && (
                        <span className="text-xs font-bold text-slate-800">
                          {dataForDay.avg_score}/10
                        </span>
                      )}
                    </div>

                    {/* Day Events Indicator Pills */}
                    <div className="w-full space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded truncate bg-white border border-[#0a1b10] text-[#0a1b10]"
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-mono font-bold text-slate-500 pl-1 block">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: WEEK VIEW (7 Columns with Scheduled Times)
           ========================================================================= */}
        {viewMode === "week" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {currentWeekDays.map((dObj) => {
                const dateStr = dObj.toISOString().slice(0, 10);
                const dayNum = dObj.getDate();
                const dayEvents = events.filter((e) => e.date === dateStr);
                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col min-h-[380px] justify-between shadow-[2px_2px_0px_#0a1b10] ${
                      isToday
                        ? "bg-emerald-50/80 border-[#0a1b10]"
                        : "bg-white border-[#0a1b10]/20"
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="pb-2.5 border-b border-[#0a1b10]/15 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                          {dObj.toLocaleDateString(undefined, { weekday: "short" })}
                        </span>
                        <span className="text-base font-black text-[#0a1b10] font-mono">
                          {dayNum}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenScheduler(dateStr)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-[#0a1b10] cursor-pointer"
                        title="Add event to this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Event List */}
                    <div className="flex-1 py-2 space-y-2 overflow-y-auto">
                      {dayEvents.length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-mono text-center pt-8">
                          No events
                        </p>
                      ) : (
                        dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`p-2 rounded-xl border text-xs space-y-1 shadow-2xs group ${ev.tagColor} ${
                              ev.completed ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-slate-600">
                                {formatHourLabel(ev.hour)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-600 hover:bg-rose-100 p-0.5 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="font-bold text-[#0a1b10] leading-tight truncate">
                              {ev.title}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduler(dateStr)}
                      className="w-full py-1 text-[11px] font-bold text-slate-600 hover:text-black border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: DAY VIEW (Hourly Time Slots from 08:00 to 20:00)
           ========================================================================= */}
        {viewMode === "day" && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-black text-[#0a1b10] font-mono">
                  {currentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {events.filter((e) => e.date === currentDateIso).length} items today
              </span>
            </div>

            {/* Hourly Agenda Stack */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {DAY_HOURS.map((hour) => {
                const hourEvents = events.filter(
                  (e) => e.date === currentDateIso && e.hour === hour
                );

                return (
                  <div
                    key={hour}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white border-2 border-[#0a1b10]/20 hover:border-[#0a1b10] transition-colors"
                  >
                    <div className="w-20 shrink-0 text-xs font-mono font-black text-[#0a1b10] pt-1">
                      {formatHourLabel(hour)}
                    </div>

                    <div className="flex-1 space-y-2 min-h-[36px]">
                      {hourEvents.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenScheduler(currentDateIso, hour)}
                          className="w-full text-left text-xs font-medium text-slate-300 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer"
                        >
                          + Click to schedule focus / event
                        </button>
                      ) : (
                        hourEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${ev.tagColor} shadow-[1px_1px_0px_#0a1b10]`}
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleToggleEvent(ev.id)}
                                className="cursor-pointer"
                              >
                                {ev.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                                ) : (
                                  <div className="w-4 h-4 rounded border-2 border-slate-700 bg-white" />
                                )}
                              </button>
                              <span
                                className={`text-xs font-bold ${
                                  ev.completed ? "line-through opacity-60" : "text-[#0a1b10]"
                                }`}
                              >
                                {ev.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/70 border border-black/10">
                                {ev.tagLabel}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL A: SCHEDULE NEW EVENT
         ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[6px_6px_0px_#0a1b10] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/15">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#0a1b10]" />
                <h3 className="font-black text-base text-[#0a1b10] font-display">
                  Schedule Calendar Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-xl text-slate-500 hover:text-black hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                  Event / Task Name
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. 45-min Deep Coding Session"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#0a1b10] text-xs font-bold text-[#0a1b10] focus:outline-none focus:ring-1 focus:ring-[#64DC4C] shadow-[1px_1px_0px_#0a1b10]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#0a1b10] text-xs font-mono font-bold text-[#0a1b10] shadow-[1px_1px_0px_#0a1b10]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                    Time Slot
                  </label>
                  <select
                    value={newEventHour}
                    onChange={(e) => setNewEventHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#0a1b10] text-xs font-mono font-bold text-[#0a1b10] shadow-[1px_1px_0px_#0a1b10]"
                  >
                    {DAY_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {formatHourLabel(h)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                  Category Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        sounds.playPop(300);
                        setNewEventTag(tag.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newEventTag === tag.id
                          ? "border-[#0a1b10] bg-[#0a1b10] text-[#64DC4C] shadow-[1px_1px_0px_#0a1b10]"
                          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#64DC4C] hover:bg-[#52c83b] text-[#0a1b10] font-black text-xs uppercase tracking-wide border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL B: DAY INSPECTOR DRAWER (Day details, Mood telemetry, and Journals)
         ========================================================================= */}
      {selectedDayInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[6px_6px_0px_#0a1b10] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/15">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#0a1b10]" />
                <h3 className="font-black text-base text-[#0a1b10] font-mono">
                  Day Details: {selectedDayInfo.date}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayInfo(null)}
                className="p-1 rounded-xl text-slate-500 hover:text-black hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Mood Telemetry */}
            {selectedDayInfo.data ? (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Emotional Telemetry
                </span>
                <div className="flex items-center justify-between text-xs font-bold text-[#0a1b10]">
                  <span>Average Mood Score: {selectedDayInfo.data.avg_score}/10</span>
                  <span className="capitalize">{selectedDayInfo.data.dominant_emotion}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono italic">
                No mood telemetry check-in on this date.
              </p>
            )}

            {/* 2. Scheduled Events */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#0a1b10] uppercase">
                  Scheduled Events ({(selectedDayInfo.events || []).length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenScheduler(selectedDayInfo.date);
                    setSelectedDayInfo(null);
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  + Add Event
                </button>
              </div>

              {(selectedDayInfo.events || []).length === 0 ? (
                <p className="text-xs text-slate-400 font-mono">No events scheduled for this day.</p>
              ) : (
                selectedDayInfo.events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-2.5 rounded-xl border-2 flex items-center justify-between text-xs ${ev.tagColor}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{formatHourLabel(ev.hour)}</span>
                      <span className="font-bold text-[#0a1b10]">{ev.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1 rounded bg-white/60">
                      {ev.tagLabel}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* 3. Reflections / Journals on this day */}
            <div className="space-y-2 pt-2 border-t border-[#0a1b10]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#0a1b10] uppercase block">
                  Journal Reflections ({dayJournals.length})
                </span>
                {onWriteForDate && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onWriteForDate(selectedDayInfo.date);
                      setSelectedDayInfo(null);
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Write Note</span>
                  </button>
                )}
              </div>

              {loadingDayDetails ? (
                <p className="text-xs text-slate-400 font-mono">Loading reflections...</p>
              ) : dayJournals.length === 0 ? (
                <div className="p-3 rounded-xl bg-white/60 border border-dashed border-slate-300 text-center space-y-1">
                  <p className="text-xs text-slate-400 font-mono">No journal entries written on this day.</p>
                  {onWriteForDate && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        onWriteForDate(selectedDayInfo.date);
                        setSelectedDayInfo(null);
                      }}
                      className="text-xs font-bold text-[#0a1b10] underline cursor-pointer"
                    >
                      Write an entry now →
                    </button>
                  )}
                </div>
              ) : (
                dayJournals.map((j) => (
                  <div
                    key={j.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1"
                  >
                    <p className="whitespace-pre-wrap">{j.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCalendar;
