import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Shield,
  ShieldCheck,
  Activity,
  FileText,
  Smile,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { PixelFox, PixelOwl } from "../Components/PixelCharacters";

export const AdminDashboard = () => {
  const { user } = useAuth();

  // Active Tab: "overview" | "users" | "inquiries" | "system"
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [stats, setStats] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  // Users Directory State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Inbound Messages State
  const [inquiries, setInquiries] = useState([]);

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Admin Overview
  const fetchOverview = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await api.get("/api/admin/overview");
      if (res.data?.success) {
        setStats(res.data.stats);
        setTelemetry(res.data.telemetry);
        setRecentUsers(res.data.recentUsers || []);
        setRecentMessages(res.data.recentMessages || []);
        if (showToast) toast.success("Telemetry refreshed! ⚡");
      }
    } catch (err) {
      console.warn("Error loading admin overview:", err);
      toast.error("Failed to load admin telemetry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch Users Directory
  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/admin/users?search=${encodeURIComponent(userSearch)}&role=${roleFilter}`);
      if (res.data?.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.warn("Error loading admin users:", err);
    }
  };

  // Fetch Inbound Contact Messages
  const fetchInquiries = async () => {
    try {
      const res = await api.get("/api/contact");
      if (res.data?.success) {
        setInquiries(res.data.messages || []);
      }
    } catch (err) {
      console.warn("Error loading contact inquiries:", err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "inquiries") {
      fetchInquiries();
    }
  }, [activeTab, roleFilter]);

  // Debounced user search
  useEffect(() => {
    if (activeTab !== "users") return;
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  // Action: Toggle User Role
  const handleToggleRole = async (targetUser) => {
    sounds.playClick();
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    setActionLoadingId(targetUser.id);

    try {
      const res = await api.patch(`/api/admin/users/${targetUser.id}/role`, { role: newRole });
      if (res.data?.success) {
        sounds.playSuccess();
        toast.success(`Updated ${targetUser.name}'s role to ${newRole.toUpperCase()}`);
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Toggle User Suspension / Active Status
  const handleToggleStatus = async (targetUser) => {
    sounds.playClick();
    const newStatus = !targetUser.is_active;
    setActionLoadingId(targetUser.id);

    try {
      const res = await api.patch(`/api/admin/users/${targetUser.id}/status`, { is_active: newStatus });
      if (res.data?.success) {
        toast.success(newStatus ? `Activated ${targetUser.name}'s account.` : `Suspended ${targetUser.name}'s account.`);
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Delete User
  const handleDeleteUser = async (targetUser) => {
    sounds.playClick();
    if (!window.confirm(`Are you sure you want to permanently delete ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const res = await api.delete(`/api/admin/users/${targetUser.id}`);
      if (res.data?.success) {
        toast.success(`User deleted successfully.`);
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Update Contact Message Status
  const handleUpdateMessageStatus = async (msgId, status) => {
    sounds.playClick();
    try {
      const res = await api.patch(`/api/contact/${msgId}/status`, { status });
      if (res.data?.success) {
        toast.success(`Message marked as ${status}`);
        fetchInquiries();
        fetchOverview();
      }
    } catch (err) {
      toast.error("Failed updating message status");
    }
  };

  // Action: Delete Contact Message
  const handleDeleteMessage = async (msgId) => {
    sounds.playClick();
    try {
      const res = await api.delete(`/api/contact/${msgId}`);
      if (res.data?.success) {
        toast.success("Message removed");
        fetchInquiries();
        fetchOverview();
      }
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-slate-900 flex flex-col font-sans selection:bg-[#0a1b10] selection:text-[#64DC4C]">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FCFAF7] border-b-2 border-[#0a1b10]/20 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/tracker"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sanctuary</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0a1b10] text-[#64DC4C] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-950 font-display flex items-center gap-2">
                <span>Admin Command Center</span>
                <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded border border-[#0a1b10]">
                  SYSTEM v2.0
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              fetchOverview(true);
              if (activeTab === "users") fetchUsers();
              if (activeTab === "inquiries") fetchInquiries();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-100/80 border border-emerald-400 text-emerald-900 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Admin: {user?.name || "Sagrika"}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b-2 border-[#0a1b10]/15 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("overview");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 ${
                activeTab === "overview"
                  ? "bg-[#0a1b10] text-[#64DC4C] border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-transparent"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("users");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 ${
                activeTab === "users"
                  ? "bg-[#0a1b10] text-[#64DC4C] border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-transparent"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory</span>
              {stats?.totalUsers && (
                <span className="bg-[#64DC4C] text-[#0a1b10] px-1.5 py-0.2 rounded-full text-[10px]">
                  {stats.totalUsers}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("inquiries");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 ${
                activeTab === "inquiries"
                  ? "bg-[#0a1b10] text-[#64DC4C] border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-transparent"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Inbound Inquiries</span>
              {stats?.totalInquiries > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                  {stats.totalInquiries}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("system");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 ${
                activeTab === "system"
                  ? "bg-[#0a1b10] text-[#64DC4C] border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-transparent"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>System & Infra</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
            <span>Uptime: {telemetry ? formatUptime(telemetry.uptimeSeconds) : "..."}</span>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & TELEMETRY
           ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Users */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-5 shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                    Total Users
                  </span>
                  <div className="text-3xl font-black font-display text-slate-950">
                    {stats?.totalUsers ?? "..."}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>+{stats?.newUsersThisWeek ?? 0} this week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-[#0a1b10] flex items-center justify-center text-emerald-800">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Journal Entries */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-5 shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                    Journal Entries
                  </span>
                  <div className="text-3xl font-black font-display text-slate-950">
                    {stats?.totalJournals ?? "..."}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    User reflections & thoughts
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border-2 border-[#0a1b10] flex items-center justify-center text-indigo-800">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Mood Logs */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-5 shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                    Mood Logs
                  </span>
                  <div className="text-3xl font-black font-display text-slate-950">
                    {stats?.totalMoodLogs ?? "..."}
                  </div>
                  <div className="text-[11px] font-bold text-amber-700">
                    Emotional check-ins
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-[#0a1b10] flex items-center justify-center text-amber-800">
                  <Smile className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Inbound Inquiries */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-5 shadow-[4px_4px_0px_#0a1b10] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                    Contact Messages
                  </span>
                  <div className="text-3xl font-black font-display text-slate-950">
                    {stats?.totalInquiries ?? "..."}
                  </div>
                  <div className="text-[11px] font-bold text-rose-700">
                    Inbound support & notes
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-[#0a1b10] flex items-center justify-center text-rose-800">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Infrastructure Health Status Strip */}
            <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#0a1b10]" />
                  <h3 className="font-display font-black text-sm uppercase text-slate-900 tracking-wide">
                    Live Infrastructure Health & Microservices
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2.5 py-1 rounded-full border border-[#0a1b10]">
                  ALL SYSTEMS NOMINAL 🟢
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {/* Postgres DB */}
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span>PostgreSQL Neon</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Pool Total: <strong>{telemetry?.dbPool?.totalCount || 1}</strong> | Idle: <strong>{telemetry?.dbPool?.idleCount || 1}</strong>
                  </p>
                </div>

                {/* Kafka Engine */}
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-orange-600" />
                      <span>Apache Kafka</span>
                    </span>
                    <span className={`w-2 h-2 rounded-full ${telemetry?.kafkaActive ? "bg-emerald-500" : "bg-amber-400"}`} />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    {telemetry?.kafkaActive ? "Connected to Broker (9092)" : "Resilient In-Memory Mode"}
                  </p>
                </div>

                {/* Socket.IO / WebRTC */}
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Socket.IO & WebRTC</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Signaling Server Port 3000 Active
                  </p>
                </div>

                {/* Memory Usage */}
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Node Memory</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Heap: <strong>{telemetry?.memoryHeapUsedMB || 0} MB</strong> / {telemetry?.memoryHeapTotalMB || 0} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Split Bottom Columns: Recent Users & Inbound Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users Box */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase text-slate-900 tracking-wide flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0a1b10]" />
                    <span>Recent Registrations</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="text-xs font-bold text-emerald-800 hover:text-black flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {recentUsers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No recent users found.</p>
                  ) : (
                    recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-2xl bg-[#FCFAF7] border border-[#0a1b10]/15 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{u.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            u.role === "admin"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Messages Box */}
              <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase text-slate-900 tracking-wide flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0a1b10]" />
                    <span>Recent Support Inquiries</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("inquiries")}
                    className="text-xs font-bold text-emerald-800 hover:text-black flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {recentMessages.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No inbound messages yet.</p>
                  ) : (
                    recentMessages.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-[#FCFAF7] border border-[#0a1b10]/15 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900">{m.name} ({m.email})</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase">Topic: {m.topic}</div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            m.status === "unread"
                              ? "bg-rose-100 text-rose-900 border-rose-300"
                              : "bg-emerald-100 text-emerald-900 border-emerald-300"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: USER DIRECTORY & MODERATION
           ========================================================================= */}
        {activeTab === "users" && (
          <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black font-display text-slate-950">
                  User Directory & Permissions
                </h2>
                <p className="text-xs text-slate-500">
                  Manage registered users, assign administrator privileges, or moderate accounts.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#0a1b10]/20 text-xs font-bold focus:outline-none focus:border-[#64DC4C] focus:bg-white"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-[#0a1b10]/20 text-xs font-bold bg-[#FCFAF7]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Standard Users</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-[#0a1b10]/15">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFAF7] border-b-2 border-[#0a1b10]/15 text-[11px] font-mono font-black uppercase text-slate-500">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Journals</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => {
                      const isSelf = u.id === user?.id;
                      const isRowLoading = actionLoadingId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* User info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#64DC4C] font-black text-xs flex items-center justify-center shrink-0">
                                {u.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1 rounded">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                                u.role === "admin"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {u.role === "admin" && <Shield className="w-2.5 h-2.5 text-emerald-700" />}
                              <span>{u.role.toUpperCase()}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                u.is_active
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-rose-50 text-rose-800 border-rose-300"
                              }`}
                            >
                              {u.is_active ? "Active" : "Suspended"}
                            </span>
                          </td>

                          {/* Stats */}
                          <td className="p-3.5 font-mono text-slate-600">
                            {u.journal_count || 0} entries
                          </td>

                          {/* Joined */}
                          <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right space-x-2">
                            {/* Toggle Role Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              disabled={isSelf || isRowLoading}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                              title={u.role === "admin" ? "Demote to standard user" : "Grant administrator role"}
                            >
                              {u.role === "admin" ? "Demote to User" : "Make Admin"}
                            </button>

                            {/* Toggle Suspend Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={isSelf || isRowLoading}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-40 ${
                                u.is_active
                                  ? "text-rose-700 border-rose-200 hover:bg-rose-50"
                                  : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              }`}
                            >
                              {u.is_active ? "Suspend" : "Activate"}
                            </button>

                            {/* Delete User */}
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isRowLoading}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: INBOUND CONTACT INQUIRIES
           ========================================================================= */}
        {activeTab === "inquiries" && (
          <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-6">
            <div>
              <h2 className="text-lg font-black font-display text-slate-950">
                Inbound Contact Inquiries
              </h2>
              <p className="text-xs text-slate-500">
                Messages submitted by developers and visitors via the contact page.
              </p>
            </div>

            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No contact messages received yet.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/15 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-950">{inq.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({inq.email})</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase">
                          {inq.topic}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(inq.created_at).toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            inq.status === "unread"
                              ? "bg-rose-100 text-rose-900 border-rose-300"
                              : inq.status === "resolved"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-blue-100 text-blue-900 border-blue-300"
                          }`}
                        >
                          {inq.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] font-mono text-slate-400">
                        Location: {inq.location || "Web"}
                      </span>

                      <div className="flex items-center gap-2">
                        {inq.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateMessageStatus(inq.id, "resolved")}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}

                        {inq.status === "unread" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateMessageStatus(inq.id, "read")}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(inq.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SYSTEM & INFRA DIAGNOSTICS
           ========================================================================= */}
        {activeTab === "system" && (
          <div className="bg-white border-3 border-[#0a1b10] rounded-3xl p-6 shadow-[4px_4px_0px_#0a1b10] space-y-6">
            <div>
              <h2 className="text-lg font-black font-display text-slate-950">
                System Architecture & Runtime Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Live configuration and infrastructure diagnostics for Calm Me developer platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Runtime Specifications */}
              <div className="p-5 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/15 space-y-3 font-mono text-xs">
                <h4 className="font-sans font-black text-sm uppercase text-slate-900">
                  Node.js Runtime & Memory
                </h4>
                <div className="space-y-1.5 divide-y divide-slate-200/80">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Node Engine:</span>
                    <span className="font-bold">{telemetry?.nodeVersion || process.version}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Platform:</span>
                    <span className="font-bold">Windows (x64)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Server Uptime:</span>
                    <span className="font-bold">{telemetry ? formatUptime(telemetry.uptimeSeconds) : "..."}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Heap Used:</span>
                    <span className="font-bold text-emerald-700">{telemetry?.memoryHeapUsedMB || 0} MB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Heap Total:</span>
                    <span className="font-bold">{telemetry?.memoryHeapTotalMB || 0} MB</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Database & Services */}
              <div className="p-5 rounded-2xl bg-[#FCFAF7] border-2 border-[#0a1b10]/15 space-y-3 font-mono text-xs">
                <h4 className="font-sans font-black text-sm uppercase text-slate-900">
                  Database & Messaging Services
                </h4>
                <div className="space-y-1.5 divide-y divide-slate-200/80">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Database Engine:</span>
                    <span className="font-bold text-blue-700">Neon Serverless PostgreSQL</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">SSL Encryption:</span>
                    <span className="font-bold text-emerald-700">TLS Required (AWS us-east-2)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Socket.IO:</span>
                    <span className="font-bold text-emerald-700">Port 3000 (WebSocket & Polling)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Kafka Event Stream:</span>
                    <span className="font-bold text-amber-700">
                      {telemetry?.kafkaActive ? "Broker Connected" : "In-Memory Bus Ready"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">WebRTC STUN:</span>
                    <span className="font-bold">stun:stun.l.google.com:19302</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

