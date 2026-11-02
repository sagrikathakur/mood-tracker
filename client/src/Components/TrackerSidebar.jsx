import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Smile,
  Calendar as CalendarIcon,
  TrendingUp,
  Wind,
  Target,
  Settings,
  Home,
  Sparkles,
  Lock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import assets from "../assets/asset";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { sounds } from "../utils/soundEffects";
import { PixelPenguin, PixelFrog, PixelPineTree } from "./PixelCharacters";

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
    id: "analytics",
    label: "Burnout Analytics",
    path: "/analytics",
    icon: TrendingUp,
    badge: "05",
  },
  {
    id: "wellness",
    label: "Micro-Recovery (60s)",
    path: "/wellness",
    icon: Wind,
    badge: "06",
  },
  {
    id: "habits",
    label: "Habits & Boundaries",
    path: "/habits",
    icon: Target,
    badge: "07",
  },
];

const TrackerSidebar = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [muted, setMuted] = useState(sounds.isMuted);
  const [petMessage, setPetMessage] = useState("Ribbit! Hydrate & rest your eyes 🌿");
  const { user, logout } = useAuth();
  const { setIsLocked } = useWellness();
  const navigate = useNavigate();

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

  const handlePetClick = () => {
    sounds.playPop(520);
    const msgs = [
      "Inhale slowly for 4 seconds... 🌬️",
      "Drink a warm cup of water! 💧",
      "Step away from the screen for 2 min. 🌲",
      "You wrote clean code today! 💚",
      "Ribbit! Let sprint tension go. 🐸",
    ];
    setPetMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  };

  const handleLogout = () => {
    sounds.playClick();
    logout();
    navigate("/");
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#FCFAF4] border-r-2 border-[#0a1b10] text-slate-900 select-none p-5 overflow-y-auto scrollbar-none shadow-[4px_0px_0px_0px_#0a1b10]">
      {/* 1. Header & Brand */}
      <div className="space-y-5">
        {/* Brand Link to Home */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#0a1b10]/20">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl bg-[#90D786] border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-center shrink-0 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#0a1b10] transition-all">
              <img
                src={assets.logo}
                alt="Calm Me"
                className="w-8 h-8 object-contain brightness-105"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#0a1b10] font-display tracking-tight leading-none">
                  Calm Me
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#0a1b10] text-[#64DC4C] border border-[#0a1b10] font-mono shadow-[1px_1px_0px_#64DC4C]">
                  8-BIT PRO
                </span>
              </div>
              <span className="text-xs text-slate-600 font-bold tracking-tight mt-1">
                by Sagrika · Sanctuary
              </span>
            </div>
          </Link>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={muted ? "Unmute Sound FX" : "Mute Sound FX"}
            className="p-2 rounded-xl border-2 border-[#0a1b10] bg-white text-[#0a1b10] hover:bg-[#90D786] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#0a1b10]" />}
          </button>
        </div>

        {/* Security / Vault Status Badge (Retro Pixel Terminal Box) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] shadow-[3px_3px_0px_#64DC4C] font-mono text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#64DC4C] animate-pulse rounded-xs" />
            <span className="tracking-wider">VAULT // AES-256</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-[#64DC4C]" />
        </div>

        {/* Workspace Navigation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0a1b10] font-mono">
              [ SANCTUARY TOOLS ]
            </span>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              7 MODULES
            </span>
          </div>

          <nav className="space-y-1.5">
            {TRACKER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${isActive
                      ? "bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] shadow-[3px_3px_0px_#64DC4C] translate-x-1"
                      : "bg-white/80 text-slate-900 border-2 border-transparent hover:border-[#0a1b10] hover:bg-[#EBF7E9] hover:shadow-[2px_2px_0px_#0a1b10]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${isActive ? "text-[#64DC4C]" : "text-emerald-800"
                        }`}
                    />
                    <span className="font-extrabold">{item.label}</span>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-sm bg-[#64DC4C] text-[#0a1b10]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & External Links */}
        <div className="space-y-2 pt-3 border-t-2 border-[#0a1b10]/15">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0a1b10] font-mono px-2 block">
            [ SYSTEM CONFIG ]
          </span>

          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleTabClick("settings")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${activeTab === "settings"
                  ? "bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] shadow-[3px_3px_0px_#64DC4C] translate-x-1"
                  : "bg-white/80 text-slate-900 border-2 border-transparent hover:border-[#0a1b10] hover:bg-[#EBF7E9] hover:shadow-[2px_2px_0px_#0a1b10]"
                }`}
            >
              <div className="flex items-center gap-3">
                <Settings
                  className={`w-5 h-5 shrink-0 ${activeTab === "settings" ? "text-[#64DC4C]" : "text-emerald-800"
                    }`}
                />
                <span className="font-extrabold">Security &amp; PIN</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">08</span>
            </button>

            <Link
              to="/"
              onClick={() => sounds.playClick()}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-[#EBF7E9] border-2 border-transparent hover:border-[#0a1b10] hover:shadow-[2px_2px_0px_#0a1b10] transition-all"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>← Return to Home Meadow</span>
            </Link>

            <Link
              to="/about"
              onClick={() => sounds.playClick()}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-[#EBF7E9] border-2 border-transparent hover:border-[#0a1b10] hover:shadow-[2px_2px_0px_#0a1b10] transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>About Sagrika Thakur</span>
            </Link>
          </nav>
        </div>

        {/* Adorable Mini Pixel Sanctuary Companion Box */}
        <div
          onClick={handlePetClick}
          className="bg-white border-2 border-[#0a1b10] rounded-2xl p-3 shadow-[3px_3px_0px_#0a1b10] hover:shadow-[4px_4px_0px_#0a1b10] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
          title="Click the companion for a gentle reminder!"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-black text-emerald-900 uppercase">
              SANCTUARY PET · HOPPY
            </span>
            <span className="text-[10px] font-black text-[#64DC4C] bg-[#0a1b10] px-1.5 py-0.5 rounded-sm font-mono">
              LVL 99
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <PixelFrog className="w-10 h-10" />
            </div>
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {petMessage}
            </p>
          </div>
        </div>
      </div>

      {/* 2. User Profile & Controls */}
      <div className="pt-4 border-t-2 border-[#0a1b10]/20 space-y-2.5">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#90D786] border-2 border-[#0a1b10] text-[#0a1b10] flex items-center justify-center font-black text-sm shrink-0 shadow-[1px_1px_0px_#0a1b10]">
              {user?.name ? user.name[0].toUpperCase() : "S"}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-black text-slate-950 truncate">
                {user?.name || "Sagrika Thakur"}
              </span>
              <span className="text-[10px] font-mono text-slate-600 truncate font-semibold">
                {user?.email || "developer@calmme.app"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLockClick}
            title="Lock Vault with PIN"
            className="p-1.5 rounded-lg border-2 border-[#0a1b10] bg-white hover:bg-rose-50 text-[#0a1b10] shadow-[1px_1px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black text-rose-950 bg-rose-50 hover:bg-rose-100 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-800" />
          <span>SIGN OUT SANCTUARY</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Vertical Sidebar (Spacious w-72 width) */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-72 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header (< md) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#FCFAF4] border-b-2 border-[#0a1b10] z-40 px-4 flex items-center justify-between shadow-[0_2px_0px_#0a1b10]">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-[#90D786] border-2 border-[#0a1b10] shadow-[1px_1px_0px_#0a1b10] flex items-center justify-center">
            <img src={assets.logo} alt="Calm Me" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-base font-black text-slate-950 font-display">Calm Me</span>
        </Link>

        <span className="text-xs font-black text-[#64DC4C] bg-[#0a1b10] border-2 border-[#0a1b10] px-3 py-1 rounded-lg uppercase font-mono shadow-[2px_2px_0px_#64DC4C]">
          {activeTab}
        </span>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setMobileOpen(!mobileOpen);
          }}
          className="p-2 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] text-slate-900 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
          aria-label="Toggle vertical navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[#FCFAF4] z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default TrackerSidebar;
