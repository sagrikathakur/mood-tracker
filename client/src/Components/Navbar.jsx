import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  LayoutDashboard,
  BookOpen,
  Smile,
  Calendar as CalendarIcon,
  TrendingUp,
  Wind,
  Target,
  Settings,
} from "lucide-react";
import assets from "../assets/asset";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";

const APP_TABS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "journal", label: "My Journal", path: "/journal", icon: BookOpen },
  { id: "mood", label: "Mood Tracker", path: "/mood", icon: Smile },
  { id: "calendar", label: "Mood Calendar", path: "/calendar", icon: CalendarIcon },
  { id: "analytics", label: "Correlation & AI", path: "/analytics", icon: TrendingUp },
  { id: "wellness", label: "Wellness Tools", path: "/wellness", icon: Wind },
  { id: "habits", label: "Habits & Goals", path: "/habits", icon: Target },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    sounds.playClick();
  };

  const isHome = location.pathname === "/";
  const currentPath = location.pathname.toLowerCase();

  const landingLinks = [
    { href: "#about", label: "About Calm Me" },
    { href: "#features", label: "Features" },
    { href: "#practices", label: "Practices" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-2.5 sm:py-3"
          : "bg-transparent py-3 sm:py-4"
      }`}
    >
      {/* 100% Full-Width Container (No max-w-7xl restriction) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <img
            src={assets.logo}
            alt="Calm Me Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tight text-slate-900 font-display leading-none">
              Calm Me
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 tracking-wide mt-0.5">
              by Sagrika · Dev Wellness
            </span>
          </div>
        </Link>

        {/* Center: THE ONLY NAVBAR MENU */}
        {isHome ? (
          /* Landing Page Navigation */
          <div className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            <a
              href="#"
              onClick={handleNavClick}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-900 bg-slate-100/80 transition-all duration-200"
            >
              Home
            </a>
            {landingLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : (
          /* Tracker / App Pages: Single Unified Top Menu (Replaces redundant second navbar) */
          <div className="hidden md:flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/80 max-w-2xl lg:max-w-3xl scrollbar-none">
            <Link
              to="/"
              onClick={handleNavClick}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition whitespace-nowrap"
            >
              ← Home
            </Link>
            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
            {APP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                currentPath === tab.path ||
                (tab.id === "dashboard" && currentPath === "/tracker");
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    navigate(tab.path);
                  }}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Actions / Auth status */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isHome && (
                <Link
                  to="/tracker"
                  onClick={handleNavClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 shadow-sm transition-all duration-200"
                >
                  <span>Open Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/70">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.name || "Sagrika"}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  logout();
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                onClick={handleNavClick}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 shadow-sm transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 shadow-xs cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200">
          {isHome ? (
            <>
              <Link
                to="/"
                onClick={() => {
                  handleNavClick();
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-semibold text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                Home
              </Link>
              {landingLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    handleNavClick();
                    setMobileMenuOpen(false);
                  }}
                  className="block text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}
            </>
          ) : (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                Calm Me Navigation
              </span>
              {APP_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  currentPath === tab.path ||
                  (tab.id === "dashboard" && currentPath === "/tracker");
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      setMobileMenuOpen(false);
                      navigate(tab.path);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs cursor-pointer"
              >
                Sign Out ({user?.name || "Sagrika"})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => {
                  handleNavClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;