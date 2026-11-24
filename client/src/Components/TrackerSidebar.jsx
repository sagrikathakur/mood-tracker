import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/asset";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { sounds } from "../utils/soundEffects";

export const TRACKER_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "journal", label: "Journal & Tasks", path: "/journal" },
  { id: "wellness", label: "Micro-Recovery", path: "/wellness" },
  { id: "habits", label: "Habits & Boundaries", path: "/habits" },
  { id: "settings", label: "Settings & Vault", path: "/settings" },
];

const TrackerSidebar = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [muted, setMuted] = useState(sounds.isMuted);
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

  const handleLogout = () => {
    sounds.playClick();
    logout();
    navigate("/");
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#FBF9F5] border-r border-stone-200/80 text-stone-800 select-none p-5 overflow-y-auto scrollbar-none font-sans">
      <div className="space-y-6">
        {/* Top Header: Brand & Sound Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/70">
          <Link
            to="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-900/10 border border-emerald-900/15 flex items-center justify-center shrink-0">
              <img
                src={assets.logo}
                alt="CalmTREE"
                className="w-4 h-4 object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold tracking-tight text-stone-900 font-display leading-tight">
                CalmTREE
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                Sanctuary Workspace
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleToggleSound}
            title={muted ? "Unmute sounds" : "Mute sounds"}
            className="text-[11px] font-medium text-stone-400 hover:text-stone-800 transition-colors px-2 py-1 rounded hover:bg-stone-200/50 cursor-pointer"
          >
            {muted ? "Muted" : "Sound on"}
          </button>
        </div>

        {/* Section 1: Core Sanctuary Modules */}
        <div className="space-y-1.5">
          <span className="px-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
            Sanctuary
          </span>

          <nav className="space-y-0.5">
            {TRACKER_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/50"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Interactive Spaces */}
        <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
          <span className="px-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
            Spaces
          </span>

          <nav className="space-y-0.5">
            <Link
              to="/game"
              onClick={() => sounds.playClick()}
              className="w-full block px-2.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
            >
              Calming Games
            </Link>

            <Link
              to="/chatafriend"
              onClick={() => sounds.playClick()}
              className="w-full block px-2.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
            >
              Chat a Friend
            </Link>

            <Link
              to="/meet"
              onClick={() => sounds.playClick()}
              className="w-full block px-2.5 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 transition-colors"
            >
              Zen Rooms
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Profile / Account Area */}
      <div className="pt-4 border-t border-stone-200/70 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold text-stone-800 truncate">
                {user?.name || "Sanctuary User"}
              </span>
              <span className="text-[10px] text-stone-400 truncate">
                {user?.email || "Personal Sanctuary"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLockClick}
            title="Lock sanctuary"
            className="text-[11px] font-medium text-stone-500 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-200/50 transition cursor-pointer"
          >
            Lock
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-rose-700 hover:bg-rose-50/50 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-64 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#FBF9F5] border-b border-stone-200/80 z-40 px-4 flex items-center justify-between shadow-2xs">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2"
        >
          <img src={assets.logo} alt="CalmTREE" className="w-5 h-5 object-contain" />
          <span className="text-sm font-bold text-stone-900 font-display">CalmTREE</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stone-500 capitalize">
            {activeTab}
          </span>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMobileOpen(!mobileOpen);
            }}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#FBF9F5] z-50 shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default TrackerSidebar;
