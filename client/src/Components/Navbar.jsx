import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  ArrowRight,
  LayoutDashboard,
  BookOpen,
  Smile,
  Calendar as CalendarIcon,
  Wind,
  Target,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import assets from "../assets/asset";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";

const APP_TABS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "journal", label: "My Journal", path: "/journal", icon: BookOpen },
  { id: "mood", label: "Mood Tracker", path: "/mood", icon: Smile },
  { id: "calendar", label: "Mood Calendar", path: "/calendar", icon: CalendarIcon },
  { id: "wellness", label: "Wellness Tools", path: "/wellness", icon: Wind },
  { id: "habits", label: "Habits & Goals", path: "/habits", icon: Target },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initial = (user?.name || "Sagrika").trim().charAt(0).toUpperCase() || "S";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (to) => {
    sounds.playClick();
    if (to === "/" && isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAnchorClick = (e, href) => {
    sounds.playClick();
    if (href.startsWith("#") || href.startsWith("/#")) {
      const id = href.replace(/^\/?#/, "");
      const elem = document.getElementById(id);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: "smooth" });
      } else {
        e.preventDefault();
        navigate(`/#${id}`);
      }
    }
  };

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";
  const isContact = location.pathname === "/contact";
  const isChatFriend = location.pathname === "/chatafriend" || location.pathname === "/chat-friend";
  const isMeet = location.pathname.startsWith("/meet") || location.pathname.startsWith("/googlemeet");
  const isLandingOrAbout = isHome || isAbout || isContact || isChatFriend || isMeet;
  const currentPath = location.pathname.toLowerCase();

  const landingNavItems = [
    { to: "/", label: "Home", isRoute: true },
    { to: "/about", label: "About Calm Me", isRoute: true },
    { to: "/contact", label: "Contact Us", isRoute: true },
    { to: "/chatafriend", label: "Chat a Friend", isRoute: true },
    { to: "/meet", label: "Google Meet", isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled || !isHome
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs py-2.5 sm:py-3 text-slate-900"
          : "bg-transparent py-3 sm:py-4 text-slate-950"
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
            <span className="text-xl font-black tracking-tight text-slate-950 font-display leading-none">
              Calm Me
            </span>
           
          </div>
        </Link>

        {/* Center: THE ONLY NAVBAR MENU (Transparent Menu) */}
        {isLandingOrAbout ? (
          /* Landing & About Page Navigation */
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${scrolled || isAbout || isContact
                ? "bg-slate-100/70 backdrop-blur-md border border-slate-200/80 shadow-xs"
                : "bg-transparent hover:bg-white/10 backdrop-blur-xs border border-emerald-950/25 shadow-2xs"
              }`}
          >
            {landingNavItems.map((item) => {
              const isActive =
                (item.to === "/" && isHome) ||
                (item.to === "/about" && isAbout) ||
                (item.to === "/contact" && isContact) ||
                (item.to === "/chatafriend" && isChatFriend) ||
                (item.to === "/meet" && isMeet);

              if (item.isRoute) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      isActive
                        ? "font-extrabold text-slate-950 bg-emerald-950/15 border border-emerald-950/20 shadow-2xs"
                        : "font-semibold text-slate-900 hover:text-slate-950 hover:bg-white/35"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-slate-900 hover:text-slate-950 hover:bg-white/35 transition-all duration-200"
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        ) : (
          /* Tracker / App Pages: Single Unified Top Menu (Replaces redundant second navbar) */
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-slate-200/80 max-w-2xl lg:max-w-3xl scrollbar-none">
            <Link
              to="/"
              onClick={handleNavClick}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-950 transition whitespace-nowrap"
            >
              ← Home
            </Link>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
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
                  className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
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
        <div className="hidden md:flex items-center gap-3 shrink-0 relative" ref={dropdownRef}>
          {isAuthenticated ? (
            <div className="relative">
              {/* Single Avatar Circle with First Letter of Name */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setProfileOpen(!profileOpen);
                }}
                className="w-10 h-10 rounded-full bg-[#0a1b10] hover:bg-black text-white font-black text-sm flex items-center justify-center border-2 border-emerald-950/20 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                title={`${user?.name || "Sagrika"} (Click for account menu)`}
                aria-label="User account menu"
              >
                <span>{initial}</span>
              </button>

              {/* Profile Dropdown Popover */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-[#0a1b10] text-white font-black text-sm flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || "Sagrika"}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {user?.email || "sagrikathakur68@gmail.com"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/tracker"
                      onClick={() => {
                        sounds.playClick();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Sanctuary Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {(user?.role === "admin" || user?.email === "sagrikathakur68@gmail.com") && (
                      <Link
                        to="/admin"
                        onClick={() => {
                          sounds.playClick();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Admin Command Center</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-1.5 py-0.2 rounded">
                          ADMIN
                        </span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-900 hover:text-black hover:bg-white/60 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                onClick={handleNavClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer min-w-[155px] tracking-wide"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
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
          {isLandingOrAbout ? (
            <>
              {landingNavItems.map((item) => {
                if (item.isRoute) {
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        handleNavClick(item.to);
                        setMobileMenuOpen(false);
                      }}
                      className="block text-sm font-semibold text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      handleAnchorClick(e, item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="block text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    {item.label}
                  </a>
                );
              })}
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
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer ${isActive
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
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0a1b10] text-white font-black text-xs flex items-center justify-center">
                      {initial}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900">{user?.name || "Sagrika"}</span>
                      <span className="text-[10px] text-slate-500">{user?.email || "sagrikathakur68@gmail.com"}</span>
                    </div>
                  </div>
                  <Link
                    to="/tracker"
                    onClick={() => {
                      sounds.playClick();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-950"
                    title="Open Tracker"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {(user?.role === "admin" || user?.email === "sagrikathakur68@gmail.com") && (
                  <Link
                    to="/admin"
                    onClick={() => {
                      sounds.playClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs cursor-pointer flex items-center justify-center gap-2 border border-emerald-400"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Admin Command Center</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
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