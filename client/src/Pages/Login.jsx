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
  KeyRound,
  X,
  CheckCircle2,
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

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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

    if (!accessToken && !oauthError) return;

    if (oauthError) {
      setError(oauthError);
      toast.error(oauthError);
      navigate("/login", { replace: true });
    } else if (accessToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
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
    toast.loading("Opening Google portal...", { id: "google-auth" });
    window.location.href = "/api/auth/google";
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

      // Resilient connection: tries Vite dev proxy, then direct localhost:3000
      let response;
      const targets = [
        endpoint,
        ...(typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? [`http://localhost:3000${endpoint}`]
          : []),
      ];

      let lastErr = null;
      for (const targetUrl of targets) {
        try {
          response = await axios.post(targetUrl, payload, {
            withCredentials: true,
            timeout: 8000,
          });
          if (response?.data) break;
        } catch (err) {
          lastErr = err;
          // If the server answered with an authentic 4xx status (e.g. 400, 401), stop immediately
          if (err.response && err.response.status < 500) {
            throw err;
          }
        }
      }

      if (!response && lastErr) {
        throw lastErr;
      }

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
        (err?.code === "ERR_NETWORK"
          ? "Cannot reach backend. Please ensure the backend server is running on port 3000."
          : err?.message || "Authentication failed. Please verify your credentials.");

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", {
        email: forgotEmail.trim().toLowerCase(),
      });
      sounds.playSuccess();
      toast.success(res.data?.message || "Reset token generated! Enter it below.");
      setForgotStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to initiate recovery.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return;
    setForgotLoading(true);
    try {
      const res = await axios.post("/api/auth/reset-password", {
        token: resetToken.trim(),
        password: newPassword,
      });
      sounds.playSuccess();
      toast.success(res.data?.message || "Password updated! Please log in.");
      setShowForgotModal(false);
      setForgotStep(1);
      setResetToken("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password. Check token.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#90D786] text-slate-900 flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-emerald-200 selection:text-emerald-950"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-8 left-10 opacity-80">
          <PixelCloud className="w-24 h-12" />
        </div>
        <div className="absolute top-16 right-12 opacity-75 hidden sm:block">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-36 left-1/4 opacity-60 hidden md:block">
          <PixelCloud className="w-20 h-10" />
        </div>

        <div className="absolute bottom-16 left-6 flex items-end gap-2 opacity-90 hidden sm:flex">
          <PixelPineTree className="w-10 h-18" />
          <PixelPineTree className="w-8 h-14" />
        </div>
        <div className="absolute bottom-16 right-6 flex items-end gap-2 opacity-90 hidden sm:flex">
          <PixelPineTree className="w-8 h-14" />
          <PixelPineTree className="w-12 h-20" />
        </div>

        <div className="absolute bottom-12 left-1/3 opacity-30">
          <PixelGrassTuft className="w-5 h-5 text-emerald-950" />
        </div>
        <div className="absolute bottom-14 right-1/3 opacity-30">
          <PixelGrassTuft className="w-5 h-5 text-emerald-950" />
        </div>
      </div>

      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2.5 group cursor-pointer bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-emerald-950/15 backdrop-blur-md shadow-xs transition-colors"
        >
          <img
            src={assets.logo}
            alt="CalmTREE"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-bold text-slate-900 font-display leading-none">
              CalmTREE
            </span>
            <span className="text-[9px] font-semibold text-emerald-800 tracking-wide">
              Dev Sanctuary
            </span>
          </div>
        </Link>

        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-slate-800 border border-emerald-950/15 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-900" />
          <span>Return Home</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pt-4 sm:pt-8 md:pt-10 pb-12">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center mb-4">
            <div
              onClick={() => sounds.playPop(520)}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              {isSignUp ? (
                <PixelFox className="w-10 h-10" animated={false} />
              ) : (
                <PixelOwl className="w-10 h-10" animated={false} />
              )}
              <div className="bg-white/90 backdrop-blur-xs border border-emerald-950/15 text-slate-800 text-xs font-semibold py-1.5 px-3.5 rounded-full shadow-xs text-left">
                {isSignUp
                  ? "New sanctuary ready 🌱"
                  : "Welcome back, developer 🌿"}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-950/15 shadow-xl sm:shadow-2xl p-7 sm:p-9 space-y-4">
            <div className="text-center pb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {isSignUp ? "Create your sanctuary" : "Welcome back"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp
                  ? "Start tracking your dev burnout & mood in peace."
                  : "Sign in to access your developer journals and stats."}
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-100 border border-stone-200/70">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsSignUp(false);
                  setError("");
                }}
                className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center border ${
                  !isSignUp
                    ? "bg-white text-slate-900 border-stone-200/60 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40 border-transparent"
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
                className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center border ${
                  isSignUp
                    ? "bg-white text-slate-900 border-stone-200/60 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40 border-transparent"
                }`}
              >
                Create Account
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-200/90 text-xs font-semibold shadow-xs hover:border-stone-300 transition-colors cursor-pointer"
            >
              <img
                src={assets.google}
                alt="Google"
                className="w-4 h-4 object-contain"
              />
              <span>{isSignUp ? "Continue with Google" : "Sign in with Google"}</span>
            </button>

            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 absolute">
                or with email
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="truncate">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
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

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="min-h-[58px] flex flex-col justify-center">
                  {isSignUp ? (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <label className="text-xs font-medium text-slate-700 block">
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
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs py-2 animate-in fade-in duration-150">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 text-xs">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-stone-300 text-[#1b4332] focus:ring-[#1b4332]/20"
                        />
                        <span>Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setShowForgotModal(true);
                          setForgotEmail(email);
                        }}
                        className="text-xs font-medium text-[#1b4332] hover:text-[#2d6a4f] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" /> Client Encrypted
              </span>
              <span>•</span>
              <span>Zero Tracking</span>
              <span>•</span>
              <span className="text-[#2d6a4f]">By Sagrika</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 px-4 text-center text-xs font-medium text-emerald-950/80">
        <p>
          &copy; {new Date().getFullYear()} Calm Me · Developer Burnout Sanctuary engineered by Sagrika Thakur.
        </p>
      </footer>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2d6a4f]" />
                <h3 className="font-semibold text-sm text-slate-900">
                  {forgotStep === 1 ? "Recover Password" : "Reset Password"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowForgotModal(false);
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-slate-500 hover:text-slate-800 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotStep === 1 ? (
              /* Step 1: Request Token Form */
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Enter your registered developer email address. We will verify your account and issue a recovery token.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="developer@example.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(2)}
                    className="text-xs font-medium text-[#1b4332] hover:text-[#2d6a4f] hover:underline cursor-pointer"
                  >
                    Already have a token?
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="h-10 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Generate Token</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Set New Password Form */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Enter your recovery token and choose a fresh private password for your sanctuary.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    Recovery Token
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your 64-character token"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="h-10 px-4 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
