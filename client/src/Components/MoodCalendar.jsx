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
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Each tag: dot color + soft tint used for chips.
const EVENT_TAGS = [
  { id: "code", label: "Deep work", dot: "bg-sky-500", chip: "bg-sky-50 text-sky-900 ring-sky-200" },
  { id: "wellness", label: "Recovery", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-900 ring-emerald-200" },
  { id: "meeting", label: "Sync / meet", dot: "bg-violet-500", chip: "bg-violet-50 text-violet-900 ring-violet-200" },
  { id: "break", label: "Break", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-900 ring-amber-200" },
  { id: "deadline", label: "Sprint milestone", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-900 ring-rose-200" },
];
const tagOf = (id) => EVENT_TAGS.find((t) => t.id === id) || EVENT_TAGS[0];

const DAY_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const formatHourLabel = (hour) => {
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${ampm}`;
};

// Local-time YYYY-MM-DD (toISOString shifts the date in non-UTC timezones)
const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const moodTone = (score) =>
  score >= 7
    ? { bar: "bg-emerald-500", text: "text-emerald-700", label: "Flow" }
    : score >= 5
      ? { bar: "bg-amber-400", text: "text-amber-700", label: "Steady" }
      : { bar: "bg-rose-400", text: "text-rose-700", label: "Burnout" };

const INPUT =
  "w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-[#12261B] ring-1 ring-[#12261B]/15 placeholder:text-[#12261B]/35 transition focus:outline-none focus:ring-2 focus:ring-[#2F7D4F]";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7D4F] focus-visible:ring-offset-2";

/* ---------- Small building blocks ---------- */

const Modal = ({ title, icon: Icon, onClose, children, wide = false }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B1A11]/50 p-0 sm:p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FBFCFA] shadow-[0_30px_80px_-20px_rgba(11,26,17,0.55)] ring-1 ring-[#12261B]/10 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FBFCFA]/90 px-6 py-4 backdrop-blur border-b border-[#12261B]/8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#12261B] text-[#9BEA86]">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold tracking-tight text-[#12261B]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`rounded-full p-1.5 text-[#12261B]/50 transition hover:bg-[#12261B]/8 hover:text-[#12261B] ${FOCUS}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div className="flex-1 min-w-[96px] rounded-2xl bg-[#12261B]/[0.035] px-4 py-3">
    <div className="font-display text-2xl font-bold leading-none tracking-tight text-[#12261B] tabular-nums">
      {value}
    </div>
    <div className="mt-1.5 text-xs text-[#12261B]/55">{label}</div>
  </div>
);

const EventChip = ({ ev, compact = false }) => {
  const tag = tagOf(ev.tagId);
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2 ${compact ? "py-0.5" : "py-1.5"} text-[11px] font-semibold ring-1 ${tag.chip} ${ev.completed ? "opacity-50 line-through" : ""
        }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tag.dot}`} />
      <span className="truncate">{ev.title}</span>
    </div>
  );
};

/* ---------- Main component ---------- */

export const MoodCalendar = ({ refreshKey, onWriteForDate, initialView = "month" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(initialView); // "month" | "week" | "day"
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(toDateStr(new Date()));
  const [newEventHour, setNewEventHour] = useState(10);
  const [newEventTag, setNewEventTag] = useState("code");

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
    if (viewMode === "month") return setCurrentDate(new Date(year, month - 1 + dir, 1));
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

  /* Day inspector */
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

  /* Events */
  const handleOpenScheduler = (dateStr = null, hour = null) => {
    sounds.playClick();
    if (dateStr) setNewEventDate(dateStr);
    if (hour !== null) setNewEventHour(hour);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = (e) => {
    if (e) e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error("Enter an event name.");
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
    toast.success("Event scheduled.");
  };

  const handleToggleEvent = (id) => {
    sounds.playPop(350);
    setEvents((prev) => prev.map((evt) => (evt.id === id ? { ...evt, completed: !evt.completed } : evt)));
  };

  const handleDeleteEvent = (id) => {
    sounds.playClick();
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    setSelectedDayInfo((prev) => (prev ? { ...prev, events: prev.events.filter((e) => e.id !== id) } : prev));
    toast("Event removed.");
  };

  /* Derived data */
  const dayDataMap = useMemo(() => {
    const map = {};
    calendarData.forEach((item) => {
      map[parseInt(item.date.split("-")[2], 10)] = item;
    });
    return map;
  }, [calendarData]);

  const stats = useMemo(() => {
    const scores = calendarData.map((d) => Number(d.avg_score)).filter((n) => !Number.isNaN(n));
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "–";
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const monthEvents = events.filter((e) => e.date?.startsWith(prefix));
    return {
      checkins: scores.length,
      avg,
      planned: monthEvents.length,
      done: monthEvents.filter((e) => e.completed).length,
    };
  }, [calendarData, events, year, month]);

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
        : currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });

  const VIEWS = [
    { id: "month", label: "Month", icon: LayoutGrid },
    { id: "week", label: "Week", icon: Columns },
    { id: "day", label: "Day", icon: Clock },
  ];

  return (
    <div id="mood-calendar" className="w-full select-none animate-in fade-in duration-300">
      <div className="overflow-hidden rounded-[28px] bg-[#FBFCFA] ring-1 ring-[#12261B]/10 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_24px_60px_-28px_rgba(11,26,17,0.35),0_2px_6px_-2px_rgba(11,26,17,0.08)]">
        {/* ---------- Header ---------- */}
        <div className="relative bg-[#12261B] px-5 pt-6 pb-16 sm:px-8 sm:pt-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#64DC4C]/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#64DC4C] text-[#12261B] shadow-[0_8px_20px_-6px_rgba(100,220,76,0.6)]">
                <CalendarIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Sanctuary Calendar
                </h2>
                <p className="mt-0.5 text-sm text-white/55">
                  Plan your focus and recovery, and see how each day felt.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View switcher */}
              <div role="tablist" aria-label="Calendar view" className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/10">
                {VIEWS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={viewMode === id}
                    onClick={() => switchView(id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${FOCUS} ${viewMode === id
                        ? "bg-white text-[#12261B] shadow-sm"
                        : "text-white/65 hover:text-white"
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Navigator */}
              <div className="flex items-center rounded-full bg-white/10 p-1 ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous"
                  className={`rounded-full p-1.5 text-white/75 transition hover:bg-white/15 hover:text-white ${FOCUS}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/15 ${FOCUS}`}
                >
                  Today
                </button>
                <span className="min-w-[128px] px-2 text-center text-xs font-semibold text-white tabular-nums">
                  {rangeLabel}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next"
                  className={`rounded-full p-1.5 text-white/75 transition hover:bg-white/15 hover:text-white ${FOCUS}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOpenScheduler()}
                className={`flex items-center gap-1.5 rounded-full bg-[#64DC4C] px-4 py-2 text-xs font-bold text-[#12261B] shadow-[0_8px_20px_-8px_rgba(100,220,76,0.7)] transition hover:bg-[#7BE866] active:scale-95 ${FOCUS}`}
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Stats (overlaps header) ---------- */}
        <div className="relative -mt-10 px-5 sm:px-8">
          <div className="flex flex-wrap gap-2.5 rounded-3xl bg-white p-2.5 ring-1 ring-[#12261B]/8 shadow-[0_16px_40px_-20px_rgba(11,26,17,0.35)]">
            <Stat value={stats.checkins} label="Mood check-ins" />
            <Stat value={stats.avg} label="Average mood" />
            <Stat value={stats.planned} label="Events planned" />
            <Stat value={`${stats.done}/${stats.planned}`} label="Events completed" />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5">
          {/* ---------- MONTH ---------- */}
          {viewMode === "month" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#12261B]/65">
                {[
                  ["bg-emerald-500", "Flow (7+)"],
                  ["bg-amber-400", "Steady (5–6)"],
                  ["bg-rose-400", "Burnout (1–4)"],
                ].map(([c, l]) => (
                  <span key={l} className="inline-flex items-center gap-1.5 font-medium">
                    <span className={`h-2 w-5 rounded-full ${c}`} />
                    {l}
                  </span>
                ))}
                {loading && <span className="ml-auto text-[#12261B]/40">Syncing moods…</span>}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-1.5 text-center text-xs font-semibold text-[#12261B]/40">
                    {d}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[76px] sm:min-h-[104px]" />
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
                      className={`group relative flex min-h-[76px] sm:min-h-[104px] flex-col justify-between overflow-hidden rounded-2xl bg-white p-2 text-left ring-1 transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgba(11,26,17,0.4)] ${FOCUS} ${isToday ? "ring-2 ring-[#2F7D4F]" : "ring-[#12261B]/10 hover:ring-[#12261B]/25"
                        }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums ${isToday ? "bg-[#12261B] text-[#9BEA86]" : "text-[#12261B]"
                            }`}
                        >
                          {dayNum}
                        </span>
                        {tone && (
                          <span className={`text-[11px] font-bold tabular-nums ${tone.text}`}>
                            {dataForDay.avg_score}
                          </span>
                        )}
                      </div>

                      <div className="hidden w-full space-y-1 sm:block">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <EventChip key={ev.id} ev={ev} compact />
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="block pl-1 text-[10px] font-semibold text-[#12261B]/45">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Mobile: dots only */}
                      <div className="flex gap-1 sm:hidden">
                        {dayEvents.slice(0, 4).map((ev) => (
                          <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${tagOf(ev.tagId).dot}`} />
                        ))}
                      </div>

                      {tone && <span className={`absolute inset-x-0 bottom-0 h-1 ${tone.bar}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------- WEEK ---------- */}
          {viewMode === "week" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
              {currentWeekDays.map((dObj) => {
                const dateStr = toDateStr(dObj);
                const dayEvents = events
                  .filter((e) => e.date === dateStr)
                  .sort((a, b) => a.hour - b.hour);
                const isToday = todayStr === dateStr;

                return (
                  <div
                    key={dateStr}
                    className={`flex min-h-[340px] flex-col rounded-2xl p-3 ring-1 ${isToday
                        ? "bg-[#12261B]/[0.04] ring-2 ring-[#2F7D4F]"
                        : "bg-white ring-[#12261B]/10"
                      }`}
                  >
                    <div className="flex items-center justify-between pb-2.5">
                      <div>
                        <div className="text-xs font-semibold text-[#12261B]/45">
                          {dObj.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="font-display text-xl font-bold leading-tight text-[#12261B] tabular-nums">
                          {dObj.getDate()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenScheduler(dateStr)}
                        aria-label="Add event to this day"
                        className={`rounded-full p-1.5 text-[#12261B]/55 transition hover:bg-[#12261B]/8 hover:text-[#12261B] ${FOCUS}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {dayEvents.length === 0 ? (
                        <p className="pt-10 text-center text-xs text-[#12261B]/35">Nothing planned</p>
                      ) : (
                        dayEvents.map((ev) => {
                          const tag = tagOf(ev.tagId);
                          return (
                            <div
                              key={ev.id}
                              className={`group rounded-xl p-2.5 ring-1 ${tag.chip} ${ev.completed ? "opacity-55" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold tabular-nums opacity-70">
                                  {formatHourLabel(ev.hour)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  aria-label={`Delete ${ev.title}`}
                                  className={`rounded p-0.5 text-rose-600 opacity-0 transition hover:bg-white/70 group-hover:opacity-100 focus-visible:opacity-100 ${FOCUS}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              <p className={`mt-0.5 truncate text-xs font-bold ${ev.completed ? "line-through" : ""}`}>
                                {ev.title}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduler(dateStr)}
                      className={`mt-2 w-full rounded-xl py-1.5 text-xs font-semibold text-[#12261B]/55 ring-1 ring-dashed ring-[#12261B]/20 transition hover:bg-[#12261B]/[0.04] hover:text-[#12261B] ${FOCUS}`}
                    >
                      Add event
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------- DAY ---------- */}
          {viewMode === "day" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#12261B]/[0.04] px-4 py-3">
                <span className="font-display text-sm font-bold text-[#12261B]">
                  {currentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs font-medium text-[#12261B]/55">
                  {events.filter((e) => e.date === currentDateIso).length} planned
                </span>
              </div>

              <div className="max-h-[560px] overflow-y-auto pr-1">
                {DAY_HOURS.map((hour) => {
                  const hourEvents = events.filter((e) => e.date === currentDateIso && e.hour === hour);
                  const isNow = todayStr === currentDateIso && new Date().getHours() === hour;

                  return (
                    <div key={hour} className="flex gap-4">
                      <div className="w-[72px] shrink-0 pt-3 text-right text-xs font-semibold tabular-nums text-[#12261B]/45">
                        {formatHourLabel(hour)}
                      </div>

                      <div className="relative flex-1 border-l border-[#12261B]/12 pb-1 pl-4">
                        <span
                          className={`absolute -left-[5px] top-[18px] h-2.5 w-2.5 rounded-full ring-4 ring-[#FBFCFA] ${isNow ? "bg-[#2F7D4F]" : "bg-[#12261B]/20"
                            }`}
                        />
                        <div className="space-y-2 py-1.5">
                          {hourEvents.map((ev) => {
                            const tag = tagOf(ev.tagId);
                            return (
                              <div
                                key={ev.id}
                                className={`flex items-center justify-between rounded-2xl p-3 ring-1 ${tag.chip}`}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleEvent(ev.id)}
                                    aria-label={ev.completed ? "Mark as not done" : "Mark as done"}
                                    aria-pressed={ev.completed}
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 transition ${FOCUS} ${ev.completed
                                        ? "bg-[#2F7D4F] ring-[#2F7D4F] text-white"
                                        : "bg-white ring-[#12261B]/30 hover:ring-[#2F7D4F]"
                                      }`}
                                  >
                                    {ev.completed && <Check className="h-3 w-3 stroke-[3]" />}
                                  </button>
                                  <span className={`truncate text-sm font-bold ${ev.completed ? "line-through opacity-55" : ""}`}>
                                    {ev.title}
                                  </span>
                                  <span className="hidden shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold sm:inline">
                                    {tag.label}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  aria-label={`Delete ${ev.title}`}
                                  className={`rounded-full p-1.5 text-[#12261B]/40 transition hover:bg-white/70 hover:text-rose-600 ${FOCUS}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })}

                          {hourEvents.length === 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenScheduler(currentDateIso, hour)}
                              className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#12261B]/30 transition hover:bg-[#12261B]/[0.04] hover:text-[#12261B]/70 ${FOCUS}`}
                            >
                              Schedule something for {formatHourLabel(hour)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Modal: schedule event ---------- */}
      {isEventModalOpen && (
        <Modal title="Schedule event" icon={CalendarIcon} onClose={() => setIsEventModalOpen(false)}>
          <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="evt-title" className="block text-xs font-semibold text-[#12261B]/65">
                Event name
              </label>
              <input
                id="evt-title"
                type="text"
                autoFocus
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. 45-min deep coding session"
                required
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="evt-date" className="block text-xs font-semibold text-[#12261B]/65">
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
                <label htmlFor="evt-hour" className="block text-xs font-semibold text-[#12261B]/65">
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
              <span className="block text-xs font-semibold text-[#12261B]/65">Category</span>
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${FOCUS} ${active
                          ? "bg-[#12261B] text-white shadow-sm"
                          : "bg-white text-[#12261B]/70 ring-1 ring-[#12261B]/15 hover:ring-[#12261B]/35"
                        }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${tag.dot}`} />
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-[#12261B]/65 transition hover:bg-[#12261B]/8 ${FOCUS}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-full bg-[#12261B] px-5 py-2 text-sm font-bold text-[#9BEA86] shadow-[0_10px_24px_-10px_rgba(11,26,17,0.7)] transition hover:bg-[#1B3A28] active:scale-95 ${FOCUS}`}
              >
                Save event
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: day details ---------- */}
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
          {/* Mood */}
          {selectedDayInfo.data ? (
            <div className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-[#12261B]/10">
              <div>
                <div className="text-xs font-semibold text-[#12261B]/50">Average mood</div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold tabular-nums text-[#12261B]">
                    {selectedDayInfo.data.avg_score}
                  </span>
                  <span className="text-sm text-[#12261B]/45">/10</span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-[#12261B]/10 ${moodTone(selectedDayInfo.data.avg_score).text} bg-[#12261B]/[0.04]`}
              >
                {selectedDayInfo.data.dominant_emotion}
              </span>
            </div>
          ) : (
            <p className="rounded-2xl bg-[#12261B]/[0.035] px-4 py-3 text-sm text-[#12261B]/55">
              No mood check-in on this day.
            </p>
          )}

          {/* Events */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#12261B]">
                Events <span className="font-medium text-[#12261B]/45">({(selectedDayInfo.events || []).length})</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  handleOpenScheduler(selectedDayInfo.date);
                  setSelectedDayInfo(null);
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-bold text-[#2F7D4F] transition hover:bg-[#2F7D4F]/10 ${FOCUS}`}
              >
                Add event
              </button>
            </div>

            {(selectedDayInfo.events || []).length === 0 ? (
              <p className="text-sm text-[#12261B]/45">Nothing scheduled for this day.</p>
            ) : (
              selectedDayInfo.events.map((ev) => {
                const tag = tagOf(ev.tagId);
                return (
                  <div key={ev.id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ${tag.chip}`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${tag.dot}`} />
                      <span className="text-xs font-semibold tabular-nums opacity-70">{formatHourLabel(ev.hour)}</span>
                      <span className="truncate text-sm font-bold">{ev.title}</span>
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold">
                      {ev.tagLabel || tag.label}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          {/* Journals */}
          <section className="space-y-2.5 border-t border-[#12261B]/10 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#12261B]">
                Journal <span className="font-medium text-[#12261B]/45">({dayJournals.length})</span>
              </h4>
              {onWriteForDate && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onWriteForDate(selectedDayInfo.date);
                    setSelectedDayInfo(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-[#2F7D4F] transition hover:bg-[#2F7D4F]/10 ${FOCUS}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Write entry
                </button>
              )}
            </div>

            {loadingDayDetails ? (
              <div className="space-y-2" aria-busy="true">
                <div className="h-14 animate-pulse rounded-xl bg-[#12261B]/[0.06]" />
              </div>
            ) : dayJournals.length === 0 ? (
              <div className="rounded-2xl bg-[#12261B]/[0.035] px-4 py-5 text-center">
                <p className="text-sm text-[#12261B]/55">No journal entries for this day.</p>
                {onWriteForDate && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onWriteForDate(selectedDayInfo.date);
                      setSelectedDayInfo(null);
                    }}
                    className={`mt-2 text-sm font-bold text-[#12261B] underline underline-offset-4 ${FOCUS}`}
                  >
                    Write an entry
                  </button>
                )}
              </div>
            ) : (
              dayJournals.map((j) => (
                <div key={j.id} className="rounded-2xl bg-white p-4 text-sm leading-relaxed text-[#12261B]/80 ring-1 ring-[#12261B]/10">
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