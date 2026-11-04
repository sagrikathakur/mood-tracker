import React, { useState } from "react";
import { Monitor, Eye, Sparkles, X, Check, Clock, RefreshCw } from "lucide-react";
import { sounds } from "../utils/soundEffects";

export const ScreenTimeHUD = ({
  formattedScreenTime,
  screenTimeHours,
  isIdle,
  eyeResetSecondsLeft,
  showEyeResetReminder,
  dismissEyeReset,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);

  const startCountdown = () => {
    sounds.playClick();
    setCountdown(20);
    setCountdownActive(true);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCountdownActive(false);
          sounds.playSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getStatus = () => {
    if (isIdle) return { label: "Away / Idle", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (screenTimeHours < 4) return { label: "Balanced Focus", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (screenTimeHours < 7) return { label: "Deep Sprint", color: "text-sky-700 bg-sky-50 border-sky-200" };
    return { label: "Screen Fatigue Alert", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const status = getStatus();

  return (
    <>
      {/* Top Header Live Badge */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setModalOpen(true);
        }}
        title="View Screen Time Telemetry & 20-20-20 Eye Reset"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs group"
      >
        <Monitor className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition" />
        <span className="text-xs font-bold font-mono text-slate-800">
          {formattedScreenTime}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${status.color}`}
        >
          {status.label}
        </span>
      </button>

      {/* 20-20-20 Automatic Reminder Modal or Manual Click Modal */}
      {(showEyeResetReminder || modalOpen) && (
        <div
          onClick={() => {
            setModalOpen(false);
            if (showEyeResetReminder) dismissEyeReset();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border-2 border-[#0a1b10] shadow-[6px_6px_0px_#0a1b10] text-center space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 font-display">
                  20-20-20 Eye Strain Reset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  if (showEyeResetReminder) dismissEyeReset();
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual 20-Second Countdown */}
            <div className="py-2 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-900 font-mono font-black text-2xl shadow-inner">
                {countdownActive ? countdown : "20s"}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {countdown === 0
                    ? "✨ Eyes Refreshed! Great job."
                    : countdownActive
                    ? "Looking at an object 20 feet away..."
                    : "Give your ciliary muscles a break"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Every 20 minutes, look at an object at least 20 feet (6m) away for 20 seconds.
                  Blink gently to re-hydrate your tear film.
                </p>
              </div>
            </div>

            {/* Quick Screen Stats */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">TODAY'S SCREEN</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{formattedScreenTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">NEXT 20-20-20 IN</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {Math.floor(eyeResetSecondsLeft / 60)}m {eyeResetSecondsLeft % 60}s
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {!countdownActive && countdown !== 0 ? (
                <button
                  type="button"
                  onClick={startCountdown}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Start 20-Second Eye Reset
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    if (showEyeResetReminder) dismissEyeReset();
                  }}
                  className="w-full py-3 rounded-2xl bg-[#0a1b10] text-[#64DC4C] font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Resume Coding →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenTimeHUD;

