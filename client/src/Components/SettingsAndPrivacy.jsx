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
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sounds } from "../utils/soundEffects";
import { PixelHeart, PixelFlame, PixelStar, PixelOwl } from "./PixelIcons";

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
    toast.success("Privacy PIN established! Sanctuary protected.", { icon: "🔒" });
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
      link.setAttribute("download", `mindspace-backup-${new Date().toISOString().slice(0, 10)}.json`);
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
    <div id="settings" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24 space-y-8">
      {/* 1. CRISIS SUPPORT PATHWAY HERO BANNER */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5] relative overflow-hidden border-2 border-[#18181B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#FF7675] text-white text-[11px] mb-1 font-['Silkscreen']">
              <HeartHandshake className="w-3.5 h-3.5" />
              CARE NETWORK
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Immediate Crisis & Mental Health Resources
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 max-w-xl">
              If you are in acute distress or need immediate human connection, free and confidential support is available 24/7.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setShowCrisisModal(true);
            }}
            className="pixel-btn pixel-btn-coral px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4" />
            <span>CRISIS SUPPORT</span>
          </button>
        </div>
      </div>

      {/* 2. PRIVACY LOCK & PIN PROTECTION */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-[#18181B]/15">
          <div className="w-10 h-10 rounded-lg border-2 border-[#18181B] bg-[#FFEAA7] flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
            <Lock className="w-5 h-5 text-[#18181B]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#18181B] font-['Bricolage_Grotesque']">
              Sanctuary Privacy Lock (PIN Protection)
            </h3>
            <p className="text-xs text-[#18181B]/70">
              Lock your thoughts behind a 4-digit PIN when leaving your screen.
            </p>
          </div>
        </div>

        {pin ? (
          <div className="p-4 rounded-xl bg-white border-2 border-[#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center gap-2 text-xs font-['Silkscreen'] text-[#00B894]">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>PIN LOCK ACTIVE (CONFIGURED)</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLockNow}
                className="pixel-btn pixel-btn-yellow px-4 py-2 text-xs font-black uppercase cursor-pointer"
              >
                LOCK SCREEN NOW
              </button>
              <button
                onClick={handleRemovePin}
                className="pixel-btn px-3 py-2 text-xs font-black uppercase cursor-pointer"
              >
                DISABLE PIN
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
              className="px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm font-['Press_Start_2P'] tracking-widest focus:outline-none bg-white shadow-[2px_2px_0px_#18181B] w-full sm:w-64"
            />
            <button
              type="submit"
              className="pixel-btn pixel-btn-green px-5 py-2 text-xs font-black uppercase cursor-pointer"
            >
              SET PRIVACY PIN
            </button>
          </form>
        )}
      </div>

      {/* 3. APPEARANCE & THEME */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-[#18181B] bg-white flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              {darkMode ? (
                <Moon className="w-5 h-5 text-[#6C5CE7]" />
              ) : (
                <Sun className="w-5 h-5 text-[#F1C40F]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-['Silkscreen'] text-[#18181B] uppercase tracking-wider">
                NIGHT MODE PALETTE
              </h3>
              <p className="text-xs text-[#18181B]/70 mt-0.5">
                Comfortable dim styling for gentle evening journaling.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setDarkMode(!darkMode);
            }}
            className={`pixel-btn px-4 py-2 text-xs font-['Silkscreen'] cursor-pointer ${
              darkMode ? "bg-[#18181B] text-white" : "bg-white text-[#18181B]"
            }`}
          >
            {darkMode ? "DARK ACTIVE" : "LIGHT ACTIVE"}
          </button>
        </div>
      </div>

      {/* 4. DATA EXPORT & GDPR PURGE */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5] space-y-6">
        <div className="pb-3 border-b-2 border-[#18181B]/15">
          <h3 className="text-base font-black text-[#18181B] font-['Bricolage_Grotesque']">
            Data Portability & GDPR Controls
          </h3>
          <p className="text-xs text-[#18181B]/70 mt-0.5">
            You own your thoughts. Download your full data archive or permanently delete your account at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Download Export */}
          <div className="p-4 rounded-xl border-2 border-[#18181B] bg-white flex flex-col justify-between shadow-[3px_3px_0px_#18181B]">
            <div>
              <span className="text-xs font-['Silkscreen'] text-[#18181B] block mb-1">
                JSON DATA ARCHIVE
              </span>
              <p className="text-xs text-[#18181B]/70 mb-4">
                Export all journal reflections, mood check-ins, habits, and wellness statistics.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="pixel-btn pixel-btn-yellow w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? "PACKING DATA..." : "DOWNLOAD BACKUP"}</span>
            </button>
          </div>

          {/* Purge Account */}
          <div className="p-4 rounded-xl border-2 border-[#18181B] bg-white flex flex-col justify-between shadow-[3px_3px_0px_#18181B]">
            <div>
              <span className="text-xs font-['Silkscreen'] text-[#D63031] block mb-1">
                PERMANENT PURGE
              </span>
              <p className="text-xs text-[#18181B]/70 mb-4">
                Irrevocably erase your account and all associated mental health records.
              </p>
            </div>
            <button
              onClick={handlePurgeAccount}
              disabled={purging}
              className="pixel-btn pixel-btn-coral w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{purging ? "PURGING..." : "DELETE ACCOUNT & DATA"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CRISIS SUPPORT MODAL */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/70 backdrop-blur-xs">
          <div className="pixel-card bg-[#FAF8F5] max-w-lg w-full p-6 sm:p-7 shadow-[6px_6px_0px_#18181B] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-[#D63031] font-['Silkscreen'] text-xs mb-1">
              <AlertTriangle className="w-4 h-4" /> IMMEDIATE CONFIDENTIAL SUPPORT
            </div>
            <h3 className="text-xl font-black font-['Bricolage_Grotesque'] text-[#18181B] mb-2">
              You Deserve Support Right Now
            </h3>
            <p className="text-xs text-[#18181B]/70 mb-5">
              If you or someone you care about is experiencing crisis, compassionate professionals are ready to listen without judgment.
            </p>

            <div className="space-y-3 mb-6">
              {/* Resource 1: 988 Lifeline */}
              <div className="p-3.5 rounded-lg bg-white border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <span className="text-xs font-['Silkscreen'] text-[#18181B] block mb-1">
                  988 SUICIDE & CRISIS LIFELINE (US / CA)
                </span>
                <p className="text-xs text-[#18181B]/70 mb-2">
                  Call or text <strong>988</strong> anytime 24/7. Free, confidential, and caring.
                </p>
                <a
                  href="tel:988"
                  className="pixel-btn pixel-btn-green inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> CALL 988 NOW
                </a>
              </div>

              {/* Resource 2: Crisis Text Line */}
              <div className="p-3.5 rounded-lg bg-white border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <span className="text-xs font-['Silkscreen'] text-[#18181B] block mb-1">
                  CRISIS TEXT LINE (US, UK, CA)
                </span>
                <p className="text-xs text-[#18181B]/70">
                  Text <strong>HOME</strong> to <strong>741741</strong> to message with a crisis counselor 24/7.
                </p>
              </div>

              {/* Resource 3: International Support */}
              <div className="p-3.5 rounded-lg bg-white border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <span className="text-xs font-['Silkscreen'] text-[#18181B] block mb-1">
                  INTERNATIONAL HELPLINES
                </span>
                <p className="text-xs text-[#18181B]/70">
                  Worldwide directory of emotional support hotlines:{" "}
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0984E3] underline font-bold"
                  >
                    findahelpline.com
                  </a>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                setShowCrisisModal(false);
              }}
              className="w-full pixel-btn py-2.5 text-xs font-black uppercase cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAndPrivacy;
