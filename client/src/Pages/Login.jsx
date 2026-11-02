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
  Sparkles,
  Code2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { PixelFox, PixelOwl, PixelCloud, PixelPineTree } from "../Components/PixelCharacters";
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

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Listen for OAuth callback tokens or errors in URL query params
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
    toast.loading("Redirecting to Google...", { id: "google-auth" });
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
          ? "Welcome to Calm Me! Your sanctuary is ready."
          : "Welcome back! Logged in successfully."
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
    <div className="min-h-screen w-full bg-[#FCFAF4] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Background Decorative Pixel Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-12 opacity-50 hidden sm:block">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-20 right-16 opacity-40 hidden md:block">
          <PixelCloud className="w-32 h-16" />
        </div>
        <div className="absolute -bottom-6 left-8 opacity-25 hidden lg:block">
          <PixelPineTree className="w-14 h-24" />
        </div>
        <div className="absolute -bottom-6 right-10 opacity-25 hidden lg:block">
          <PixelPineTree className="w-14 h-24" />
        </div>
      </div>

      {/* Top Navbar Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <img
            src={assets.logo}
            alt="Calm Me"
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col text-left">
            <span className="text-lg sm:text-xl font-black text-slate-950 font-display leading-none">
              Calm Me
            </span>
            <span className="text-[10px] font-bold text-emerald-800 tracking-wide mt-0.5">
              by Sagrika · Dev Wellness
            </span>
          </div>
        </Link>

        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Centered Authentication Sanctuary Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
          {/* Left Decorative Artwork Card from asset.js (Visible on lg screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4">
            <div className="rounded-3xl overflow-hidden border-2 border-slate-900/10 shadow-lg bg-white p-2">
              <div className="rounded-2xl overflow-hidden relative group">
                <img
                  src={isSignUp ? assets.bed_burrito : assets.social_battery_cat}
                  alt="Calm Me Sanctuary"
                  className="w-full h-80 object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-4 text-white">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    {isSignUp ? "Gentle Decompression" : "Developer Recharge"}
                  </span>
                  <p className="text-xs font-semibold mt-0.5">
                    {isSignUp
                      ? "Wrap yourself in a duvet burrito. No sprint shaming."
                      : "Social battery at 2%? Step inside your quiet sanctuary."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 text-emerald-950 text-xs flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="font-medium">
                Engineered with care by <strong className="font-bold">Sagrika</strong> to help tech workers decode chronic fatigue.
              </p>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-slate-900/10 shadow-xl p-6 sm:p-9 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Mascot Greeting */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-2 mb-2 group cursor-pointer"
              onClick={() => sounds.playPop(500)}
            >
              {isSignUp ? (
                <PixelFox className="w-12 h-12" />
              ) : (
                <PixelOwl className="w-12 h-12" />
              )}
              <div className="bg-[#90D786] border-2 border-slate-900 text-slate-950 text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] text-left animate-bubble-bounce">
                {isSignUp ? "Let's build your sanctuary! 🌿" : "Welcome back, developer! ✨"}
              </div>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-display tracking-tight mt-1">
              {isSignUp ? "Create Developer Sanctuary" : "Sign In to Calm Me"}
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xs mt-1">
              {isSignUp
                ? "Start decoding your burnout and protecting your cognitive bandwidth."
                : "Enter your developer credentials to access your private timeline."}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsSignUp(false);
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSignUp
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
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
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSignUp
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Create Sanctuary
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* One-Click Google Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <img
              src={assets.google}
              alt="Google"
              className="w-4 h-4 object-contain"
            />
            <span>{isSignUp ? "Sign Up with Google" : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-xs font-bold text-slate-700">
                  Your Name / Dev Handle
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Sagrika"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember me on this machine</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md shadow-black/10 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Securing sanctuary...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Developer Sanctuary" : "Sign In to Sanctuary"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Client Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Trackers
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" /> By Sagrika
            </span>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <p>
          &copy; {new Date().getFullYear()} Calm Me · Designed & Developed by Sagrika for Developer Mental Wellness.
        </p>
      </footer>
    </div>
  );
};

export default Login;
