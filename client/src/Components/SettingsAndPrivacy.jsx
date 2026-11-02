import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Lock,
  Download,
  Moon,
  Sun,
  Trash2,
  PhoneCall,
  HeartHandshake,
  AlertTriangle,
  Sparkles,
  Check,
  Code2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";

const SettingsAndPrivacy = ({ onLockActivated }) => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindspace_dark_mode") === "true";
  });
  const [pin, setPin] = useState(() => {
    return localStorage.getItem("mindspace_pin") || "";
  });
  const [newPinInput, setNewPinInput] = useState("");
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mindspace_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mindspace_dark_mode", "false");
    }
  }, [darkMode]);

  const handleSavePin = (e) => {
    e.preventDefault();
    sounds.playClick();
    if (newPinInput.length !== 4 || isNaN(newPinInput)) {
      toast.error("Please enter a 4-digit numeric PIN.");
      return;
    }
    localStorage.setItem("mindspace_pin", newPinInput);
    setPin(newPinInput);
    setNewPinInput("");
    sounds.playSuccess();
    toast.success("Privacy PIN established! Dev sanctuary protected.", { icon: "🔒" });
  };

  const handleRemovePin = () => {
    sounds.playPop();
    localStorage.removeItem("mindspace_pin");
    setPin("");
    toast.success("PIN lock removed.");
  };

  const handleLockNow = () => {
    if (!pin) {
      toast.error("Please set a 4-digit PIN first.");
      return;
    }
    sounds.playClick();
    if (onLockActivated) onLockActivated();
  };

  const handleExportData = async () => {
    sounds.playClick();
    setExporting(true);
    try {
      const res = await api.get("/api/export/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `calm-me-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      sounds.playSuccess();
      toast.success("Personal wellness archive downloaded successfully!", { icon: "📥" });
    } catch (err) {
      toast.error("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const handlePurgeAccount = async () => {
    sounds.playPop();
    const confirmation = window.prompt(
      'Type "DELETE MY DATA" to permanently erase your account, all journals, mood records, and analytics. This action CANNOT be undone.'
    );
    if (confirmation !== "DELETE MY DATA") {
      toast("Purge cancelled.");
      return;
    }

    setPurging(true);
    try {
      await api.delete("/api/export/purge");
      sounds.playSuccess();
      toast.success("Account and all personal records permanently deleted.");
      logout();
    } catch (err) {
      toast.error("Failed to purge account.");
    } finally {
      setPurging(false);
    }
  };

  return (
    <div id="settings" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24 space-y-6">
      {/* 1. CRISIS SUPPORT PATHWAY HERO BANNER */}
      <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 mb-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Immediate Support Network</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              Crisis & Mental Health Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
              If you or a colleague is facing severe burnout, depression, or distress, free and confidential support is accessible 24/7.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowCrisisModal(true);
            }}
            className="px-5 py-3 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Crisis Support Lines</span>
          </button>
        </div>
      </div>

      {/* 2. PRIVACY LOCK & PIN PROTECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 font-display">
              Sanctuary Privacy Lock (PIN Protection)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lock your engineering journals and reflections behind a 4-digit PIN when away from your workstation.
            </p>
          </div>
        </div>

        {pin ? (
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>PIN Lock Active & Protected</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLockNow}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer shadow-sm"
              >
                Lock Screen Now
              </button>
              <button
                type="button"
                onClick={handleRemovePin}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Disable PIN
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSavePin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              maxLength="4"
              placeholder="4-digit PIN (e.g. 1234)"
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 w-full sm:w-64 font-mono font-bold"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer shadow-sm"
            >
              Set Privacy PIN
            </button>
          </form>
        )}
      </div>

      {/* 3. APPEARANCE & THEME */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-2xs">
              {darkMode ? (
                <Moon className="w-5 h-5 text-indigo-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Night Mode Palette
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Comfortable dim styling for late evening developer debriefs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setDarkMode(!darkMode);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
              darkMode
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {darkMode ? "Dark Active" : "Light Active"}
          </button>
        </div>
      </div>

      {/* 4. DATA EXPORT & GDPR PURGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 font-display">
            Data Portability & GDPR Controls
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            You own your data completely. Download your complete encrypted archive or permanently erase your account at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Download Export */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">
                JSON Data Archive
              </span>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Export all journal reflections, burnout check-ins, micro-habits, and sleep correlation metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? "Preparing Backup..." : "Download Backup Archive"}</span>
            </button>
          </div>

          {/* Purge Account */}
          <div className="p-5 rounded-2xl border border-rose-200/80 bg-rose-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-rose-700 block mb-1">
                Permanent Purge
              </span>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Irrevocably erase your account and all associated mental wellness records from our database.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePurgeAccount}
              disabled={purging}
              className="w-full py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>{purging ? "Purging Data..." : "Delete Account & Data"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CRISIS SUPPORT MODAL */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Immediate Confidential Support</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCrisisModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-black font-display text-slate-900 mb-2">
              You Deserve Support Right Now
            </h3>
            <p className="text-xs text-slate-500 mb-5 font-medium">
              If you or someone you care about is experiencing overwhelming distress or burnout, compassionate professionals are ready to listen without judgment.
            </p>

            <div className="space-y-3 mb-6">
              {/* Resource 1: 988 Lifeline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  988 Suicide & Crisis Lifeline (US / CA)
                </span>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Call or text <strong>988</strong> anytime 24/7. Free, confidential, and caring.
                </p>
                <a
                  href="tel:988"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call 988 Now
                </a>
              </div>

              {/* Resource 2: Crisis Text Line */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Crisis Text Line (US, UK, CA)
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Text <strong>HOME</strong> to <strong>741741</strong> to message with a crisis counselor 24/7.
                </p>
              </div>

              {/* Resource 3: International Support */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  International Helplines Directory
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Worldwide directory of emotional support hotlines:{" "}
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 underline font-bold"
                  >
                    findahelpline.com
                  </a>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setShowCrisisModal(false);
              }}
              className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAndPrivacy;
