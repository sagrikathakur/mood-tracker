import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Check,
  Trash2,
  LayoutGrid,
  Columns,
  CalendarDays,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Botanical sanctuary tags
const EVENT_TAGS = [
  { id: "code", label: "Deep Work", dot: "bg-emerald-600", chip: "bg-emerald-50 text-emerald-900 border border-emerald-200/80" },
  { id: "wellness", label: "Rest & Recovery", dot: "bg-teal-600", chip: "bg-teal-50 text-teal-900 border border-teal-200/80" },
  { id: "meeting", label: "Sync & Meeting", dot: "bg-sky-600", chip: "bg-sky-50 text-sky-900 border border-sky-200/80" },
  { id: "break", label: "Mindful Break", dot: "bg-amber-600", chip: "bg-amber-50 text-amber-900 border border-amber-200/80" },
  { id: "deadline", label: "Sprint Milestone", dot: "bg-rose-600", chip: "bg-rose-50 text-rose-900 border border-rose-200/80" },
];
const tagOf = (id) => EVENT_TAGS.find((t) => t.id === id) || EVENT_TAGS[0];

const DAY_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const formatHourLabel = (hour) => {
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${ampm}`;
};

// Local-time YYYY-MM-DD
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const moodTone = (score) =>
  score >= 7
    ? { bar: "bg-emerald-500", text: "text-emerald-700", label: "Flow" }
    : score >= 5
      ? { bar: "bg-amber-400", text: "text-amber-700", label: "Steady" }
      : { bar: "bg-rose-400", text: "text-rose-700", label: "Burnout" };

const INPUT =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-xs text-[#1b4332] border border-[#1b4332]/15 placeholder:text-[#1b4332]/35 transition focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a4f] focus-visible:ring-offset-2";

/* ---------- Modal Wrapper ---------- */

const Modal = ({ title, icon: Icon, onClose, children, wide = false }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B1A11]/60 p-0 sm:p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${wide ? "sm:max-w-xl" : "sm:max-w-md"} max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FCFAF7] shadow-2xl border border-[#1b4332]/15 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FCFAF7]/95 px-6 py-4 backdrop-blur-md border-b border-[#1b4332]/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1b4332] text-emerald-200">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="font-serif italic text-base font-semibold text-[#1b4332]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`rounded-full p-1.5 text-[#1b4332]/50 transition hover:bg-[#1b4332]/10 hover:text-[#1b4332] ${FOCUS}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */

export const MoodCalendar = ({ refreshKey, onWriteForDate, initialView = "week" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(initialView); // "week" | "day" | "month"
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Local storage events
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal scheduler state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(toDateStr(new Date()));
  const [newEventHour, setNewEventHour] = useState(10);
  const [newEventTag, setNewEventTag] = useState("code");

  // Inline quick scheduler for Day View
  const [quickTitle, setQuickTitle] = useState("");
  const [quickHour, setQuickHour] = useState(9);
  const [quickTag, setQuickTag] = useState("code");

  // Day inspector modal
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [dayJournals, setDayJournals] = useState([]);
  const [loadingDayDetails, setLoadingDayDetails] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_calendar_events", JSON.stringify(events));
    } catch (e) {
      console.warn("Could not sync events", e);
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/moods/calendar?year=${year}&month=${month}`);
      if (res.data?.calendar) setCalendarData(res.data.calendar);
    } catch (err) {
      console.warn("Could not fetch calendar telemetry:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month, refreshKey]);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = toDateStr(new Date());
  const currentDateIso = toDateStr(currentDate);

  /* Navigation */
  const shift = (dir) => {
    sounds.playClick();
    if (viewMode === "month") {
      return setCurrentDate(new Date(year, month - 1 + dir, 1));
    }
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (viewMode === "week" ? 7 : 1) * dir);
    setCurrentDate(d);
  };

  const handlePrev = () => shift(-1);
  const handleNext = () => shift(1);
  const handleToday = () => {
    sounds.playClick();
    setCurrentDate(new Date());
  };
  const switchView = (mode) => {
    sounds.playClick();
    setViewMode(mode);
  };

  /* Day inspector modal */
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
    } catch {
      setDayJournals([]);
    } finally {
      setLoadingDayDetails(false);
    }
  };

  /* Event actions */
  const handleOpenScheduler = (dateStr = null, hour = null) => {
    sounds.playClick();
    if (dateStr) setNewEventDate(dateStr);
    if (hour !== null) setNewEventHour(hour);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = (e) => {
    if (e) e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error("Please enter a name for the schedule block.");
      return;
    }
    sounds.playSuccess();
    const tagObj = tagOf(newEventTag);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newEventTitle.trim(),
        date: newEventDate,
        hour: parseInt(newEventHour, 10),
        tagId: tagObj.id,
        tagLabel: tagObj.label,
        completed: false,
      },
    ]);
    setNewEventTitle("");
    setIsEventModalOpen(false);
    toast.success("Scheduled to calendar.");
  };

  const handleQuickAddEvent = (e) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) {
      toast.error("Please enter an event title.");
      return;
    }
    sounds.playSuccess();
    const tagObj = tagOf(quickTag);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: quickTitle.trim(),
        date: currentDateIso,
        hour: parseInt(quickHour, 10),
        tagId: tagObj.id,
        tagLabel: tagObj.label,
        completed: false,
      },
    ]);
    setQuickTitle("");
    toast.success("Added to today's schedule.");
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
    setSelectedDayInfo((prev) =>
      prev ? { ...prev, events: prev.events.filter((e) => e.id !== id) } : prev
    );
    toast.success("Event removed.");
  };

  /* Derived data */
  const dayDataMap = useMemo(() => {
    const map = {};
    calendarData.forEach((item) => {
      map[parseInt(item.date.split("-")[2], 10)] = item;
    });
    return map;
  }, [calendarData]);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const currentWeekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const rangeLabel =
    viewMode === "month"
      ? `${MONTH_NAMES[month - 1]} ${year}`
      : viewMode === "week"
        ? `${currentWeekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${currentWeekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
        : currentDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const VIEWS = [
    { id: "week", label: "Week", icon: Columns },
    { id: "day", label: "Day", icon: Clock },
    { id: "month", label: "Month", icon: LayoutGrid },
  ];

  // Day view specific calculations
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === currentDateIso)
      .sort((a, b) => a.hour - b.hour);
  }, [events, currentDateIso]);

  const todayCompletedCount = todayEvents.filter((e) => e.completed).length;

  return (
    <div id="sanctuary-calendar" className="w-full max-w-5xl mx-auto select-none animate-in fade-in duration-300">
      <div className="overflow-hidden rounded-3xl bg-[#FCFAF7]/95 border border-[#1b4332]/15 shadow-xl">
        {/* ---------- Clean Botanical Header ---------- */}
        <div className="relative bg-gradient-to-r from-[#1b4332] via-[#24533e] to-[#2d6a4f] text-white p-5 sm:p-7 shadow-sm">
          {/* Subtle ambient light glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & Description */}
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-emerald-100 shadow-sm">
                <CalendarIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif italic text-2xl font-normal text-white tracking-wide">
                  Sanctuary Calendar
                </h2>
                <p className="text-xs text-emerald-100/80 font-sans mt-0.5">
                  Plan your focus, balance deep sprints, and schedule mindful recovery.
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Switcher */}
              <div
                role="tablist"
                aria-label="Calendar view"
                className="flex rounded-full bg-black/20 p-1 backdrop-blur-sm border border-white/15"
              >
                {VIEWS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={viewMode === id}
                    onClick={() => switchView(id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${FOCUS} ${
                      viewMode === id
                        ? "bg-white text-[#1b4332] shadow-sm font-semibold"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Navigator */}
              <div className="flex items-center rounded-full bg-black/20 p-1 backdrop-blur-sm border border-white/15">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous"
                  className={`rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white ${FOCUS}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className={`rounded-full px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/15 ${FOCUS}`}
                >
                  Today
                </button>
                <span className="min-w-[124px] px-2 text-center text-xs font-semibold text-white tabular-nums">
                  {rangeLabel}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next"
                  className={`rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white ${FOCUS}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Schedule CTA */}
              <button
                type="button"
                onClick={() => handleOpenScheduler(currentDateIso)}
                className={`flex items-center gap-1.5 rounded-full bg-[#FCFAF7] px-4 py-2 text-xs font-semibold text-[#1b4332] shadow-sm transition hover:bg-white active:scale-95 ${FOCUS}`}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Content Area ---------- */}
        <div className="p-4 sm:p-6 lg:p-7">
          {/* =========================================================
              1. WEEK VIEW
             ========================================================= */}
          {viewMode === "week" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5">
                {currentWeekDays.map((dObj) => {
                  const dateStr = toDateStr(dObj);
                  const dayEvents = events
                    .filter((e) => e.date === dateStr)
                    .sort((a, b) => a.hour - b.hour);
                  const isToday = todayStr === dateStr;

                  return (
                    <div
                      key={dateStr}
                      className={`group relative flex flex-col justify-between min-h-[230px] rounded-2xl p-3.5 border transition-all ${
                        isToday
                          ? "bg-[#eaf5ed]/50 border-[#2d6a4f] shadow-xs ring-1 ring-[#2d6a4f]"
                          : "bg-white/95 border-[#1b4332]/10 hover:border-[#1b4332]/30 hover:shadow-xs"
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#1b4332]/8">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1b4332]/55">
                            {dObj.toLocaleDateString(undefined, { weekday: "short" })}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-lg font-bold tabular-nums font-serif leading-none ${
                                isToday
                                  ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1b4332] text-white text-xs"
                                  : "text-[#1b4332]"
                              }`}
                            >
                              {dObj.getDate()}
                            </span>
                            {isToday && (
                              <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider">
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenScheduler(dateStr)}
                          title="Schedule event"
                          aria-label={`Add event for ${dateStr}`}
                          className={`rounded-full p-1 text-[#1b4332]/40 transition hover:bg-[#1b4332]/10 hover:text-[#1b4332] ${FOCUS}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Event Cards List */}
                      <div className="flex-1 my-2 flex flex-col justify-center overflow-y-auto min-h-[85px]">
                        {dayEvents.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center text-[#1b4332]/35 py-3">
                            <CalendarDays className="w-5 h-5 mb-1.5 opacity-35 text-[#1b4332]" />
                            <span className="text-xs font-serif italic text-[#1b4332]/50">
                              Open rhythm
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 pr-0.5">
                            {dayEvents.map((ev) => {
                              const tag = tagOf(ev.tagId);
                              return (
                                <div
                                  key={ev.id}
                                  className={`group/ev flex items-center justify-between px-2 py-1 rounded-lg text-[11px] border transition ${tag.chip} ${
                                    ev.completed ? "opacity-50 line-through bg-slate-50 border-slate-200" : "shadow-xs"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tag.dot}`} />
                                    <span className="truncate font-medium">{ev.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/ev:opacity-100 transition shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleEvent(ev.id)}
                                      title={ev.completed ? "Mark incomplete" : "Mark complete"}
                                      className="text-[#1b4332]/60 hover:text-[#2d6a4f]"
                                    >
                                      <Check className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(ev.id)}
                                      title="Delete"
                                      aria-label={`Delete ${ev.title}`}
                                      className="text-rose-600 hover:text-rose-800"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Add button at bottom */}
                      <button
                        type="button"
                        onClick={() => handleOpenScheduler(dateStr)}
                        className={`w-full rounded-xl py-1.5 text-xs font-medium text-[#1b4332]/60 border border-dashed border-[#1b4332]/20 transition hover:bg-[#eaf5ed] hover:text-[#1b4332] hover:border-[#1b4332]/40 ${FOCUS}`}
                      >
                        + Add event
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              2. DAY VIEW (Two-Column Balanced Layout)
             ========================================================= */}
          {viewMode === "day" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols): Hourly Timeline */}
              <div className="lg:col-span-7 bg-white/95 rounded-2xl border border-[#1b4332]/10 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1b4332]/8">
                  <div>
                    <h3 className="font-serif italic text-lg font-normal text-[#1b4332]">
                      Timeline Schedule
                    </h3>
                    <p className="text-xs text-[#1b4332]/60">
                      {currentDate.toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#eaf5ed] text-[#1b4332] border border-[#2d6a4f]/20">
                    {todayEvents.length} {todayEvents.length === 1 ? "event" : "events"}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {DAY_HOURS.map((hour) => {
                    const hourEvents = events.filter(
                      (e) => e.date === currentDateIso && e.hour === hour
                    );
                    const isNow = todayStr === currentDateIso && new Date().getHours() === hour;

                    return (
                      <div key={hour} className="flex items-start gap-3 group">
                        {/* Time Label */}
                        <div className="w-16 shrink-0 pt-2 text-right">
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              isNow ? "text-[#2d6a4f] font-bold" : "text-[#1b4332]/50"
                            }`}
                          >
                            {formatHourLabel(hour)}
                          </span>
                        </div>

                        {/* Spine Dot & Line */}
                        <div className="relative flex flex-col items-center self-stretch">
                          <span
                            className={`w-2.5 h-2.5 rounded-full mt-2.5 ring-2 ring-white shrink-0 ${
                              isNow
                                ? "bg-[#2d6a4f] scale-125"
                                : hourEvents.length > 0
                                  ? "bg-[#1b4332]"
                                  : "bg-[#1b4332]/25"
                            }`}
                          />
                          <div className="w-[1px] bg-[#1b4332]/10 flex-1 my-1" />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 pb-2">
                          {hourEvents.length > 0 ? (
                            <div className="space-y-1.5">
                              {hourEvents.map((ev) => {
                                const tag = tagOf(ev.tagId);
                                return (
                                  <div
                                    key={ev.id}
                                    className={`flex items-center justify-between p-3 rounded-xl transition border ${tag.chip} ${
                                      ev.completed
                                        ? "opacity-60 bg-slate-50 border-slate-200"
                                        : "shadow-xs"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleEvent(ev.id)}
                                        aria-label={ev.completed ? "Mark incomplete" : "Mark complete"}
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                          ev.completed
                                            ? "bg-[#2d6a4f] border-[#2d6a4f] text-white"
                                            : "border-[#1b4332]/30 hover:border-[#2d6a4f] bg-white"
                                        }`}
                                      >
                                        {ev.completed && <Check className="h-3 w-3 stroke-[3]" />}
                                      </button>
                                      <span
                                        className={`text-xs font-medium text-[#1b4332] truncate ${
                                          ev.completed ? "line-through text-[#1b4332]/45" : ""
                                        }`}
                                      >
                                        {ev.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-[#1b4332]/75 border border-[#1b4332]/10">
                                        {tag.label}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEvent(ev.id)}
                                        aria-label={`Delete ${ev.title}`}
                                        className={`rounded-md p-1 text-[#1b4332]/35 hover:text-rose-600 hover:bg-rose-50 transition ${FOCUS}`}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenScheduler(currentDateIso, hour)}
                              className={`w-full py-2 px-3 rounded-xl border border-dashed border-[#1b4332]/15 hover:border-[#1b4332]/35 hover:bg-[#eaf5ed]/40 text-xs text-[#1b4332]/35 hover:text-[#1b4332] transition flex items-center justify-between group-hover:border-[#1b4332]/25 ${FOCUS}`}
                            >
                              <span>Schedule focus or rest block</span>
                              <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-[#2d6a4f]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (5 cols): Day Overview & Inline Quick Scheduler */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Quick Add Event Card */}
                <div className="bg-white/95 rounded-2xl border border-[#1b4332]/10 p-5 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-serif italic text-base font-medium text-[#1b4332]">
                      Quick Schedule
                    </h4>
                    <p className="text-xs text-[#1b4332]/60">
                      Add a session for {currentDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>

                  <form onSubmit={handleQuickAddEvent} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="e.g. Deep Code Architecture, Tea Walk..."
                        className="w-full text-xs rounded-xl border border-[#1b4332]/20 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-[#FCFAF7] placeholder:text-[#1b4332]/35"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-medium text-[#1b4332]/70 block mb-1">
                          Time
                        </label>
                        <select
                          value={quickHour}
                          onChange={(e) => setQuickHour(Number(e.target.value))}
                          className="w-full text-xs rounded-xl border border-[#1b4332]/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-[#FCFAF7]"
                        >
                          {DAY_HOURS.map((h) => (
                            <option key={h} value={h}>
                              {formatHourLabel(h)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[#1b4332]/70 block mb-1">
                          Category
                        </label>
                        <select
                          value={quickTag}
                          onChange={(e) => setQuickTag(e.target.value)}
                          className="w-full text-xs rounded-xl border border-[#1b4332]/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-[#FCFAF7]"
                        >
                          {EVENT_TAGS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Day Schedule
                    </button>
                  </form>
                </div>

                {/* 2. Today's Rhythm & Checklist */}
                <div className="bg-white/95 rounded-2xl border border-[#1b4332]/10 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic text-base font-medium text-[#1b4332]">
                      Day Rhythm
                    </h4>
                    <span className="text-xs font-semibold text-[#2d6a4f]">
                      {todayCompletedCount} of {todayEvents.length} completed
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#eaf5ed] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2d6a4f] to-[#52b788] transition-all duration-300"
                      style={{
                        width: `${todayEvents.length ? (todayCompletedCount / todayEvents.length) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Event Checklist */}
                  <div className="pt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {todayEvents.length === 0 ? (
                      <p className="text-xs text-[#1b4332]/45 italic text-center py-4">
                        No scheduled items for this day yet.
                      </p>
                    ) : (
                      todayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => handleToggleEvent(ev.id)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#eaf5ed]/40 cursor-pointer text-xs transition"
                        >
                          {ev.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#1b4332]/30 shrink-0" />
                          )}
                          <span
                            className={`truncate flex-1 font-medium ${
                              ev.completed ? "line-through text-[#1b4332]/45" : "text-[#1b4332]"
                            }`}
                          >
                            {ev.title}
                          </span>
                          <span className="text-[10px] text-[#1b4332]/50 tabular-nums">
                            {formatHourLabel(ev.hour)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Sanctuary Mindful Reflection Card */}
                <div className="bg-[#eaf5ed]/60 rounded-2xl border border-[#1b4332]/10 p-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1b4332]/85 leading-relaxed font-serif italic">
                    "Balance focused momentum with stillness. Protect your attention, and honor moments of rest."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              3. MONTH VIEW
             ========================================================= */}
          {viewMode === "month" && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-[#1b4332]/50 uppercase tracking-wider">
                    {d}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const dataForDay = dayDataMap[dayNum];
                  const dayEvents = events.filter((e) => e.date === dateStr);
                  const isToday = todayStr === dateStr;
                  const tone = dataForDay ? moodTone(dataForDay.avg_score) : null;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleDateClick(dateStr, dataForDay)}
                      className={`group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl bg-white/95 p-2 text-left border transition duration-150 hover:-translate-y-0.5 hover:shadow-sm ${FOCUS} ${
                        isToday
                          ? "border-[#2d6a4f] bg-[#eaf5ed]/40 ring-1 ring-[#2d6a4f]"
                          : "border-[#1b4332]/10 hover:border-[#1b4332]/30"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums ${
                            isToday ? "bg-[#1b4332] text-white" : "text-[#1b4332]"
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-semibold text-[#2d6a4f] tabular-nums">
                            {dayEvents.length} {dayEvents.length === 1 ? "task" : "tasks"}
                          </span>
                        )}
                      </div>

                      {/* Event Chips */}
                      <div className="hidden w-full space-y-1 sm:block mt-1">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const tag = tagOf(ev.tagId);
                          return (
                            <div
                              key={ev.id}
                              className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-medium border truncate ${tag.chip} ${
                                ev.completed ? "opacity-50 line-through" : ""
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tag.dot}`} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="block pl-1 text-[10px] font-medium text-[#1b4332]/50">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Mobile: dots */}
                      <div className="flex gap-1 sm:hidden mt-1">
                        {dayEvents.slice(0, 4).map((ev) => (
                          <span
                            key={ev.id}
                            className={`h-1.5 w-1.5 rounded-full ${tagOf(ev.tagId).dot}`}
                          />
                        ))}
                      </div>

                      {tone && <span className={`absolute inset-x-0 bottom-0 h-1 ${tone.bar}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Modal: Schedule Event ---------- */}
      {isEventModalOpen && (
        <Modal
          title="Schedule Rhythm Block"
          icon={CalendarIcon}
          onClose={() => setIsEventModalOpen(false)}
        >
          <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="evt-title" className="block text-xs font-semibold text-[#1b4332]/80">
                Title or Focus Intention
              </label>
              <input
                id="evt-title"
                type="text"
                autoFocus
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. Deep architecture session, mindful walk..."
                required
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="evt-date" className="block text-xs font-semibold text-[#1b4332]/80">
                  Date
                </label>
                <input
                  id="evt-date"
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                  className={INPUT}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="evt-hour" className="block text-xs font-semibold text-[#1b4332]/80">
                  Time
                </label>
                <select
                  id="evt-hour"
                  value={newEventHour}
                  onChange={(e) => setNewEventHour(e.target.value)}
                  className={INPUT}
                >
                  {DAY_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {formatHourLabel(h)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#1b4332]/80">Category</span>
              <div className="flex flex-wrap gap-2">
                {EVENT_TAGS.map((tag) => {
                  const active = newEventTag === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        sounds.playPop(300);
                        setNewEventTag(tag.id);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${FOCUS} ${
                        active
                          ? "bg-[#1b4332] text-white shadow-xs"
                          : "bg-white text-[#1b4332]/70 border border-[#1b4332]/15 hover:border-[#1b4332]/40"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${tag.dot}`} />
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b4332]/10">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className={`rounded-full px-4 py-2 text-xs font-semibold text-[#1b4332]/65 transition hover:bg-[#1b4332]/8 ${FOCUS}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-full bg-[#1b4332] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2d6a4f] active:scale-95 ${FOCUS}`}
              >
                Save Schedule Block
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: Day Details Inspector ---------- */}
      {selectedDayInfo && (
        <Modal
          wide
          title={new Date(`${selectedDayInfo.date}T00:00:00`).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          icon={CalendarIcon}
          onClose={() => setSelectedDayInfo(null)}
        >
          {/* Scheduled Events */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#1b4332]">
                Scheduled Blocks{" "}
                <span className="font-normal text-[#1b4332]/50">
                  ({(selectedDayInfo.events || []).length})
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  handleOpenScheduler(selectedDayInfo.date);
                  setSelectedDayInfo(null);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold text-[#2d6a4f] bg-[#eaf5ed] transition hover:bg-[#d8f3dc] ${FOCUS}`}
              >
                + Add block
              </button>
            </div>

            {(selectedDayInfo.events || []).length === 0 ? (
              <p className="text-xs text-[#1b4332]/50 italic bg-[#1b4332]/[0.03] p-3 rounded-xl">
                No blocks scheduled for this day.
              </p>
            ) : (
              selectedDayInfo.events.map((ev) => {
                const tag = tagOf(ev.tagId);
                return (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${tag.chip}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${tag.dot}`} />
                      <span className="text-xs font-semibold tabular-nums opacity-70">
                        {formatHourLabel(ev.hour)}
                      </span>
                      <span className="truncate text-xs font-medium">{ev.title}</span>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium border border-[#1b4332]/10">
                      {ev.tagLabel || tag.label}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          {/* Journal Entries for this day */}
          <section className="space-y-3 border-t border-[#1b4332]/10 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#1b4332]">
                Journal Reflections{" "}
                <span className="font-normal text-[#1b4332]/50">({dayJournals.length})</span>
              </h4>
              {onWriteForDate && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onWriteForDate(selectedDayInfo.date);
                    setSelectedDayInfo(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[#2d6a4f] bg-[#eaf5ed] transition hover:bg-[#d8f3dc] ${FOCUS}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Write entry
                </button>
              )}
            </div>

            {loadingDayDetails ? (
              <div className="space-y-2" aria-busy="true">
                <div className="h-14 animate-pulse rounded-xl bg-[#1b4332]/[0.06]" />
              </div>
            ) : dayJournals.length === 0 ? (
              <div className="rounded-xl bg-[#1b4332]/[0.03] px-4 py-4 text-center">
                <p className="text-xs text-[#1b4332]/55">No journal entries recorded for this day.</p>
              </div>
            ) : (
              dayJournals.map((j) => (
                <div
                  key={j.id}
                  className="rounded-xl bg-white p-3.5 text-xs leading-relaxed text-[#1b4332]/80 border border-[#1b4332]/10"
                >
                  <p className="whitespace-pre-wrap">{j.content}</p>
                </div>
              ))
            )}
          </section>
        </Modal>
      )}
    </div>
  );
};

export default MoodCalendar;
