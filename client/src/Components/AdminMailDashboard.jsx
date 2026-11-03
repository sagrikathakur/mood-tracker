import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";
import {
  Mail,
  MapPin,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Inbox,
  Globe,
} from "lucide-react";

export const AdminMailDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, latestTime: null, topLocations: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/contact");
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setStats(res.data.stats || { total: 0, unread: 0, latestTime: null, topLocations: [] });
      }
    } catch (err) {
      console.warn("Could not fetch messages from server, using local fallback:", err?.message);
      // Fallback sample data to illustrate the dashboard structure
      const sample = [
        {
          id: 1,
          name: "Alex Rivera",
          email: "alex.rivera@devmail.com",
          topic: "feedback",
          location: "San Francisco, United States",
          message: "Calm Me has completely transformed my late-night debugging routine. The box breathing tool and developer triggers correlation are incredible!",
          status: "unread",
          created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        },
        {
          id: 2,
          name: "Priya Sharma",
          email: "priya.tech@gmail.com",
          topic: "feature",
          location: "Bengaluru, India",
          message: "Would love to see a Slack or IDE webhook integration to trigger micro-breaks after 3 hours of continuous git commits. Great design Sagrika!",
          status: "read",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
      ];
      setMessages(sample);
      setStats({
        total: 2,
        unread: 1,
        latestTime: sample[0].created_at,
        topLocations: [{ location: "San Francisco, United States", count: 1 }, { location: "Bengaluru, India", count: 1 }],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleStatus = async (id, currentStatus) => {
    sounds.playClick();
    const newStatus = currentStatus === "unread" ? "read" : "unread";

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );

    try {
      await api.patch(`/api/contact/${id}/status`, { status: newStatus });
      fetchMessages();
    } catch (err) {
      console.warn("Status update fallback:", err?.message);
    }
  };

  const handleDelete = async (id) => {
    sounds.playPop(380);
    setMessages((prev) => prev.filter((m) => m.id !== id));

    try {
      await api.delete(`/api/contact/${id}`);
      fetchMessages();
    } catch (err) {
      console.warn("Delete message fallback:", err?.message);
    }
  };

  // Filter messages based on search query, status, and topic
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      (msg.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.message || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : msg.status === statusFilter;

    const matchesTopic =
      topicFilter === "all" ? true : msg.topic === topicFilter;

    return matchesSearch && matchesStatus && matchesTopic;
  });

  const formatMessageTime = (isoString) => {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRelativeTime = (isoString) => {
    if (!isoString) return "";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header & Live Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inbound Mails */}
        <div className="p-5 rounded-2xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
              Total Mails
            </p>
            <p className="text-3xl font-black text-[#0a1b10] font-display mt-1">
              {stats.total || messages.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#64DC4C] border-2 border-[#0a1b10] flex items-center justify-center text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Unread Inquiries */}
        <div className="p-5 rounded-2xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
              Unread Notes
            </p>
            <p className="text-3xl font-black text-emerald-800 font-display mt-1">
              {stats.unread}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-[#0a1b10] flex items-center justify-center text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Top Location */}
        <div className="p-5 rounded-2xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
              Top Location
            </p>
            <p className="text-sm font-black text-[#0a1b10] truncate max-w-[140px] mt-1">
              {stats.topLocations?.[0]?.location || "Global Web"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-300 border-2 border-[#0a1b10] flex items-center justify-center text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* Latest Mail Time */}
        <div className="p-5 rounded-2xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono font-extrabold text-slate-600 uppercase tracking-wider">
              Latest Inbound
            </p>
            <p className="text-xs font-black text-[#0a1b10] truncate max-w-[140px] mt-1">
              {stats.latestTime ? getRelativeTime(stats.latestTime) : "Up to date"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-300 border-2 border-[#0a1b10] flex items-center justify-center text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Controls: Search, Topic Filter, Status Filter, Refresh */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[5px_5px_0px_#0a1b10] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sender, email, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-2 border-slate-300 focus:border-[#0a1b10] text-xs font-semibold text-slate-900 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Topics</option>
            <option value="feedback">Product Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Suggestion</option>
            <option value="hello">Saying Hello</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              fetchMessages();
            }}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] text-slate-800 cursor-pointer"
            title="Refresh Inbound Mails"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 3. Messages List View (Sender, Time, Location) */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] space-y-3">
            <Mail className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-900 font-display">
              No inbound messages found
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Any visitor who sends you a note via the Contact page will appear right here with their name, exact time, and location.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUnread = msg.status === "unread";
            return (
              <div
                key={msg.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-200 ${
                  isUnread
                    ? "bg-[#FCFAF4] border-[#0a1b10] shadow-[5px_5px_0px_#0a1b10]"
                    : "bg-white/90 border-slate-300 shadow-[3px_3px_0px_#94a3b8]"
                }`}
              >
                {/* Top Row: Sender Info & Location Badge & Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                  {/* Who Sent The Mail */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0a1b10] text-[#64DC4C] flex items-center justify-center font-black text-sm border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] shrink-0">
                      {msg.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-950 font-display">
                          {msg.name}
                        </h4>
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#64DC4C] text-[#0a1b10] border border-[#0a1b10]">
                            NEW
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {msg.topic}
                        </span>
                      </div>
                      <a
                        href={`mailto:${msg.email}?subject=Re: [Calm Me] Regarding your note`}
                        className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1 mt-0.5 underline"
                      >
                        {msg.email}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Time & Location Indicators */}
                  <div className="flex flex-wrap items-center gap-2 sm:text-right">
                    {/* Location Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-bold shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{msg.location || "Unknown Location"}</span>
                    </div>

                    {/* Timestamp Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{formatMessageTime(msg.created_at)}</span>
                      <span className="text-slate-400">({getRelativeTime(msg.created_at)})</span>
                    </div>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-4">
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(msg.id, msg.status)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isUnread
                          ? "bg-emerald-100 border-emerald-400 text-emerald-950 hover:bg-emerald-200"
                          : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isUnread ? "Mark as Read" : "Mark as Unread"}</span>
                    </button>

                    <a
                      href={`mailto:${msg.email}?subject=Re: [Calm Me] ${encodeURIComponent(msg.topic || "Note")}&body=Hi ${encodeURIComponent(msg.name)},%0A%0AThank you for reaching out to Calm Me!` }
                      onClick={() => sounds.playClick()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a1b10] hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminMailDashboard;

