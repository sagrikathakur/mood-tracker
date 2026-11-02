import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import assets from "../assets/asset";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles, Code2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

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
      navigate("/", { replace: true });
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
          ? "Account created successfully!"
          : "Logged in successfully!"
      );

      setPassword("");
      navigate(from, { replace: true });
    } catch (err) {
      sounds.playPop(120);
      const message =
        err?.response?.data?.message ||
        "Authentication failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Left side - Modern Ambient Aesthetic Banner */}
      <div className="relative flex-1 min-h-[45vh] lg:min-h-screen flex flex-col items-center justify-center p-8 lg:p-16 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 overflow-hidden">
        {/* Soft Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-md w-full text-center flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group cursor-pointer">
            <img
              src={assets.logo}
              alt="Calm Me"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                Calm Me
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">
                by Sagrika · Dev Wellness
              </span>
            </div>
          </Link>

          {/* Aesthetic Calming Visual from asset.js */}
          <div className="w-full max-w-xs h-36 sm:h-44 rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-200/80">
            <img
              src={assets.login_img}
              alt="Calm Sanctuary"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Burnout & Wellness Sanctuary</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-display mb-3">
            Built for developers. Engineered for calm.
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-sm mb-8">
            Decode sprint exhaustion, log debugging triggers, track burnout root causes, and protect your mental bandwidth.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full text-left">
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">01 · TRACKING</span>
              <span className="text-xs font-bold text-slate-800">Burnout & Triggers</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">02 · ANALYTICS</span>
              <span className="text-xs font-bold text-slate-800">Sprint Correlation</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">03 · RECOVERY</span>
              <span className="text-xs font-bold text-slate-800">Paced Breath & Rest</span>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">04 · PRIVACY</span>
              <span className="text-xs font-bold text-slate-800">PIN Sanctuary Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sleek Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="bg-white max-w-md w-full p-8 lg:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-left pb-4 border-b border-slate-100">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-display">
              {isSignUp ? "Create Developer Sanctuary" : "Welcome Back"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {isSignUp
                ? "Join Calm Me to decode your burnout and reclaim mental clarity."
                : "Sign in to access your private journals, burnout logs, and metrics."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <img
              src={assets.google}
              alt="Google logo"
              className="w-4 h-4 object-contain"
            />
            <span>{isSignUp ? "Sign Up with Google" : "Sign In with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Name Field (Sign Up Mode) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Your Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Sagrika"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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

            {/* Remember */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Free Account" : "Sign In to Sanctuary"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="pt-3 text-center border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500">
              {isSignUp ? "Already registered?" : "New to Calm Me?"}{" "}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsSignUp(!isSignUp);
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer ml-1"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;