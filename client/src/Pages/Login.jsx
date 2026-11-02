import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import assets from "../assets/asset";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import {
  PixelFox,
  PixelOwl,
  PixelCloud,
  PixelPineTree,
  PixelGrassTuft,
} from "../Components/PixelCharacters";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";
import { motion } from "../utils/motion";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/tracker";

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hpField, setHpField] = useState("");

  const [searchParams] = useSearchParams();

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // OAuth token listener
  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userName = searchParams.get("name");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(oauthError);
      toast.error(oauthError);
      navigate("/login", { replace: true });
    } else if (accessToken) {
      login({ name: userName || "Friend" }, accessToken, refreshToken);
      sounds.playSuccess();
      toast.success(
        userName
          ? `Welcome back, ${userName}!`
          : "Signed in with Google successfully!"
      );
      navigate("/tracker", { replace: true });
    }
  }, [searchParams, navigate, login]);

  const handleGoogleAuth = () => {
    sounds.playClick();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    toast.loading("Opening Google portal...", { id: "google-auth" });
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    sounds.playClick();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...(isSignUp && { name: name.trim(), hp_field: hpField }),
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      };

      const endpoint = isSignUp
        ? "/api/auth/register"
        : "/api/auth/login";

      const response = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      if (response.data?.accessToken) {
        sounds.playSuccess();
        login(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      }

      toast.success(
        isSignUp
          ? "Welcome to Calm Me! Save point established."
          : "Welcome back! Level loaded successfully."
      );

      setPassword("");
      navigate(from, { replace: true });
    } catch (err) {
      sounds.playPop(120);
      const message =
        err?.response?.data?.message ||
        "Authentication failed. Please verify your credentials.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#90D786] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Atmospheric Pixel Meadow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Pixel Floating Clouds */}
        <div className="absolute top-8 left-10 opacity-80 animate-pulse duration-1000">
          <PixelCloud className="w-24 h-12" />
        </div>
        <div className="absolute top-16 right-12 opacity-75 hidden sm:block">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-36 left-1/4 opacity-60 hidden md:block">
          <PixelCloud className="w-20 h-10" />
        </div>

        {/* Pixel Pine Trees along Meadow Sides */}
        <div className="absolute bottom-16 left-6 flex items-end gap-2 opacity-90 hidden sm:flex">
          <PixelPineTree className="w-10 h-18" />
          <PixelPineTree className="w-8 h-14" />
        </div>
        <div className="absolute bottom-16 right-6 flex items-end gap-2 opacity-90 hidden sm:flex">
          <PixelPineTree className="w-8 h-14" />
          <PixelPineTree className="w-12 h-20" />
        </div>

        {/* Grass Tufts */}
        <div className="absolute bottom-12 left-1/3 opacity-30">
          <PixelGrassTuft className="w-5 h-5 text-emerald-950" />
        </div>
        <div className="absolute bottom-14 right-1/3 opacity-30">
          <PixelGrassTuft className="w-5 h-5 text-emerald-950" />
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5 group cursor-pointer bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-emerald-950/20 backdrop-blur-md shadow-2xs transition-all"
        >
          <img
            src={assets.logo}
            alt="Calm Me"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-black text-slate-950 font-display leading-none">
              Calm Me
            </span>
            <span className="text-[9px] font-bold text-emerald-900 tracking-wide">
              Dev Sanctuary
            </span>
          </div>
        </Link>

        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-black text-slate-900 border border-emerald-950/20 shadow-2xs transition-all cursor-pointer hover:scale-102"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-900" />
          <span>Return Home</span>
        </Link>
      </header>

      {/* 3. Centered Retro Pixel Game Cartridge */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md mx-auto">
          {/* Pixel Mascot Greeting Header */}
          <div className="flex flex-col items-center text-center mb-3">
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sounds.playPop(520)}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              {isSignUp ? (
                <PixelFox className="w-12 h-12" />
              ) : (
                <PixelOwl className="w-12 h-12" />
              )}
              <div className="bg-white border-2 border-[#0a1b10] text-slate-950 text-xs font-extrabold py-1.5 px-3.5 rounded-2xl shadow-[3px_3px_0px_#0a1b10] text-left">
                {isSignUp
                  ? "New save slot ready! 🌿"
                  : "Welcome back, developer! ✨"}
              </div>
            </motion.div>
          </div>

          {/* Main 8-Bit Cartridge Card */}
          <div className="rounded-3xl bg-[#FCFAF4] border-3 border-[#0a1b10] shadow-[7px_7px_0px_#0a1b10] p-6 sm:p-8 space-y-5">
            {/* Cartridge Top Bar Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0a1b10] animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0a1b10] font-display">
                  {isSignUp ? "PLAYER CREATE // NEW GAME" : "PLAYER LOGIN // CONTINUE"}
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md border border-[#0a1b10]/30">
                100% PRIVATE
              </span>
            </div>

            {/* Arcade Mode Selector Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-200/60 border-2 border-[#0a1b10]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsSignUp(false);
                  setError("");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                  !isSignUp
                    ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#000]"
                    : "text-slate-700 hover:text-black hover:bg-white/50"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsSignUp(true);
                  setError("");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                  isSignUp
                    ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#000]"
                    : "text-slate-700 hover:text-black hover:bg-white/50"
                }`}
              >
                New Sanctuary
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#b91c1c]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{error}</span>
              </div>
            )}

            {/* One-Click Google Arcade Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-[#0a1b10] text-xs font-black shadow-[3px_3px_0px_#0a1b10] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer"
            >
              <img
                src={assets.google}
                alt="Google"
                className="w-4 h-4 object-contain"
              />
              <span>{isSignUp ? "Continue with Google" : "Instant Google Sign In"}</span>
            </button>

            {/* Retro Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t-2 border-[#0a1b10]/20 w-full" />
              <span className="bg-[#FCFAF4] px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest absolute">
                or email
              </span>
            </div>

            {/* Login / Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Honeypot field for bot protection */}
              <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
                <input
                  type="text"
                  name="hp_field"
                  value={hpField}
                  onChange={(e) => setHpField(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                    Developer Handle / Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Sagrika"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:shadow-[3px_3px_0px_#0a1b10] transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="developer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:shadow-[3px_3px_0px_#0a1b10] transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                  Sanctuary Key / Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:shadow-[3px_3px_0px_#0a1b10] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-900 cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              {!isSignUp && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold text-[11px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-2 border-[#0a1b10] text-[#0a1b10] focus:ring-0"
                    />
                    <span>Remember on this machine</span>
                  </label>
                </div>
              )}

              {/* Arcade Enter Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] text-xs sm:text-sm font-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#64DC4C]" />
                    <span>Loading Sanctuary...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "► CREATE DEVELOPER SANCTUARY" : "► ENTER SANCTUARY"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Cartridge Bottom Specs Bar */}
            <div className="pt-3 border-t-2 border-[#0a1b10]/20 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Client Encrypted
              </span>
              <span>•</span>
              <span className="text-slate-700">Zero Corporate Data</span>
              <span>•</span>
              <span className="text-emerald-900">By Sagrika</span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Minimalist Bottom Footer */}
      <footer className="relative z-10 w-full py-3 px-4 text-center text-[11px] font-bold text-emerald-950">
        <p>
          &copy; {new Date().getFullYear()} Calm Me · Developer Burnout Sanctuary engineered by Sagrika Thakur.
        </p>
      </footer>
    </div>
  );
};

export default Login;
