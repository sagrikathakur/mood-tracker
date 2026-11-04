import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Smile,
  Calendar as CalendarIcon,
  Wind,
  Target,
  Mail,
  Lock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Volume2,
  VolumeX,
  Gamepad2,
} from "lucide-react";
import assets from "../assets/asset";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { sounds } from "../utils/soundEffects";

export const TRACKER_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    badge: "01",
  },
  {
    id: "journal",
    label: "Dev Journal",
    path: "/journal",
    icon: BookOpen,
    badge: "02",
  },
  {
    id: "mood",
    label: "Mood Check-in",
    path: "/mood",
    icon: Smile,
    badge: "03",
  },
  {
    id: "calendar",
    label: "Mood Calendar",
    path: "/calendar",
    icon: CalendarIcon,
    badge: "04",
  },
  {
    id: "wellness",
    label: "Micro-Recovery (60s)",
    path: "/wellness",
    icon: Wind,
    badge: "05",
  },
  {
    id: "habits",
    label: "Habits & Boundaries",
    path: "/habits",
    icon: Target,
    badge: "06",
  },
];

export const ADMIN_NAV_ITEM = {
  id: "admin-mails",
  label: "Admin Mailbox",
  path: "/admin-mails",
  icon: Mail,
  badge: "08",
};

const TrackerSidebar = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [muted, setMuted] = useState(sounds.isMuted);
  const { user, logout } = useAuth();
  const { setIsLocked } = useWellness();
  const navigate = useNavigate();

  // Admin visibility guard: strictly ONLY authenticated users with role "admin" can see the Admin Mailbox
  const isAdmin = Boolean(user && user.role === "admin");

  const visibleNavItems = isAdmin
    ? [...TRACKER_NAV_ITEMS, ADMIN_NAV_ITEM]
    : TRACKER_NAV_ITEMS;

  const handleTabClick = (tabId) => {
    sounds.playClick();
    onSelectTab(tabId);
    setMobileOpen(false);
  };

  const handleLockClick = () => {
    sounds.playClick();
    setIsLocked(true);
    setMobileOpen(false);
  };

  const handleToggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sounds.playClick();
    }
  };

  const handleLogout = () => {
    sounds.playClick();
    logout();
    navigate("/");
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#FCFAF7] border-r border-slate-200/90 text-slate-800 select-none p-5 overflow-y-auto scrollbar-none">
      {/* 1. Header & Brand */}
      <div className="space-y-4">
        {/* Brand Link to Home */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200/90 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs">
              <img
                src={assets.logo}
                alt="Calm Me"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-slate-900 font-display tracking-tight leading-none">
                  Calm Me
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-mono">
                  Pro
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium tracking-tight mt-1">
                by Sagrika · Sanctuary
              </span>
            </div>
          </Link>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={muted ? "Unmute Sound FX" : "Mute Sound FX"}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors cursor-pointer shadow-2xs"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>
        </div>

        {/* Security / Vault Status Badge (Clean soft pill, no harsh black) */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="tracking-wide">Private &amp; Encrypted Vault</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>

        {/* Workspace Navigation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Sanctuary Tools
            </span>
            <span className="text-[10px] font-medium text-slate-400 font-mono">
              {visibleNavItems.length} MODULES
            </span>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-emerald-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-700"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-emerald-800 transition-colors">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Play Games Link */}
        <div className="pt-2 border-t border-slate-200/80">
          <Link
            to="/game"
            onClick={() => sounds.playClick()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-emerald-50/80 transition-colors duration-150 group"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Play Games</span>
          </Link>
        </div>
      </div>

      {/* 2. User Profile & Controls */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "S"}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-slate-800 truncate">
                {user?.name || "Sagrika Thakur"}
              </span>
              <span className="text-[10px] text-slate-500 truncate font-mono">
                {user?.email || "developer@calmme.app"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLockClick}
            title="Lock Vault with PIN"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Vertical Sidebar (Spacious w-72 width) */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-72 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (< md) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#FCFAF7] border-b border-slate-200/90 z-40 px-4 flex items-center justify-between shadow-2xs">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <img src={assets.logo} alt="Calm Me" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-base font-bold text-slate-900 font-display">Calm Me</span>
        </Link>

        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full uppercase font-mono">
          {activeTab}
        </span>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setMobileOpen(!mobileOpen);
          }}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          aria-label="Toggle vertical navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[#FCFAF7] z-50 shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default TrackerSidebar;
