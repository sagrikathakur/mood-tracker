import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import assets from "../assets/asset";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";
import { PixelOwl, PixelHeart, PixelStar } from "../Components/PixelIcons";

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
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#18181B] flex flex-col lg:flex-row font-sans">
      {/* Left side - Pixel Aesthetic Art Banner */}
      <div className="relative flex-1 min-h-[40vh] lg:min-h-screen flex flex-col items-center justify-center p-8 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-[#18181B] bg-[#FFFDF9]">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl border-3 border-[#18181B] bg-[#FFEAA7] flex items-center justify-center shadow-[4px_4px_0px_#18181B] mb-5">
            <PixelOwl className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#55EFC4] text-[#18181B] text-xs font-['Silkscreen'] mb-3">
            <PixelHeart className="w-3.5 h-3.5 text-[#E74C3C]" />
            <span>MINDFULNESS RPG</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque'] mb-2">
            MindSpace Sanctuary
          </h1>

          <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed font-medium max-w-sm mb-6">
            Track your emotional baseline, unlock correlation insights, build mindful habits, and preserve your thoughts in a private vault.
          </p>

          <div className="grid grid-cols-2 gap-2.5 w-full text-left">
            <div className="bg-white p-3 rounded-lg border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              <span className="text-[10px] font-['Silkscreen'] text-[#00B894] block">FEATURE 01</span>
              <span className="text-xs font-bold text-[#18181B]">Pixel Mood Tracker</span>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              <span className="text-[10px] font-['Silkscreen'] text-[#0984E3] block">FEATURE 02</span>
              <span className="text-xs font-bold text-[#18181B]">Correlation Engine</span>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              <span className="text-[10px] font-['Silkscreen'] text-[#F1C40F] block">FEATURE 03</span>
              <span className="text-xs font-bold text-[#18181B]">Micro-Ritual Streaks</span>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              <span className="text-[10px] font-['Silkscreen'] text-[#6C5CE7] block">FEATURE 04</span>
              <span className="text-xs font-bold text-[#18181B]">PIN Sanctuary Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="pixel-card bg-white max-w-md w-full p-8 lg:p-10 space-y-6">
          {/* Header */}
          <div className="text-left pb-3 border-b-2 border-[#18181B]/15">
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#74B9FF] text-[#18181B] text-[10px] font-['Silkscreen'] mb-2">
              PORTAL LOGIN
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              {isSignUp ? "Create Sanctuary" : "Welcome Back"}
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-0.5 font-normal">
              {isSignUp
                ? "Embark on your personal wellness journey"
                : "Enter credentials to unlock your private records"}
            </p>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FF7675]/20 border-2 border-[#FF7675] text-[#D63031] text-xs font-bold font-['Silkscreen']">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="pixel-btn w-full flex items-center justify-center gap-3 py-3 text-xs font-['Silkscreen'] cursor-pointer"
          >
            <img
              src={assets.google}
              alt="Google logo"
              className="w-4 h-4 object-contain"
            />
            <span>{isSignUp ? "SIGN UP WITH GOOGLE" : "SIGN IN WITH GOOGLE"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t-2 border-[#18181B]/15 w-full" />
            <span className="bg-white px-3 text-[10px] font-['Silkscreen'] text-[#18181B]/50 uppercase tracking-wider absolute">
              OR WITH EMAIL
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
                <label className="block text-[10px] font-['Silkscreen'] text-[#18181B] uppercase tracking-wider">
                  SANCTUARY NAME / NICKNAME
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#18181B]/40 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Maya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-[#18181B] bg-[#FAF8F5] text-xs sm:text-sm font-medium focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-['Silkscreen'] text-[#18181B] uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#18181B]/40 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-[#18181B] bg-[#FAF8F5] text-xs sm:text-sm font-medium focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-['Silkscreen'] text-[#18181B] uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#18181B]/40 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border-2 border-[#18181B] bg-[#FAF8F5] text-xs sm:text-sm font-medium focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#18181B]/50 hover:text-[#18181B] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none font-['Silkscreen'] text-[10px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#18181B] text-[#18181B]"
                  />
                  <span>REMEMBER ME</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="pixel-btn pixel-btn-green w-full py-3 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "INITIALIZE ACCOUNT" : "UNLOCK SANCTUARY"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="pt-3 text-center border-t-2 border-[#18181B]/15">
            <p className="text-xs font-medium text-[#18181B]/70">
              {isSignUp ? "Already registered?" : "New to MindSpace?"}{" "}
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsSignUp(!isSignUp);
                }}
                className="font-black font-['Silkscreen'] text-[#0984E3] underline cursor-pointer ml-1"
              >
                {isSignUp ? "SIGN IN" : "CREATE FREE ACCOUNT"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
