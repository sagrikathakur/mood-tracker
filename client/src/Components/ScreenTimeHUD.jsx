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
    if (isIdle) {
      return {
        label: "Away / Idle",
        pillClasses: "bg-amber-50 text-amber-800 border border-amber-200/80",
        dotClasses: "bg-amber-500",
      };
    }
    if (screenTimeHours < 4) {
      return {
        label: "Balanced Focus",
        pillClasses: "bg-emerald-50 text-[#1b4332] border border-emerald-200/80",
        dotClasses: "bg-emerald-500 animate-pulse",
      };
    }
    if (screenTimeHours < 7) {
      return {
        label: "Deep Sprint",
        pillClasses: "bg-sky-50 text-sky-800 border border-sky-200/80",
        dotClasses: "bg-sky-500 animate-pulse",
      };
    }
    return {
      label: "Screen Fatigue Alert",
      pillClasses: "bg-rose-50 text-rose-800 border border-rose-200/80",
      dotClasses: "bg-rose-500 animate-ping",
    };
  };

  const status = getStatus();

  return (
    <>
      {/* Top Header Live Badge - Refined, Premium Pill Widget */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setModalOpen(true);
        }}
        title="View Screen Time Telemetry & 20-20-20 Eye Reset"
        className="inline-flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-full border border-stone-200/90 bg-white hover:bg-stone-50 transition-all cursor-pointer shadow-xs hover:border-stone-300 group select-none"
      >
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1b4332] transition-colors shrink-0" />
          <span className="text-xs font-semibold text-slate-800 tracking-tight">
            {formattedScreenTime}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${status.pillClasses}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotClasses}`} />
          <span>{status.label}</span>
        </span>
      </button>

      {/* 20-20-20 Automatic Reminder Modal or Manual Click Modal */}
      {(showEyeResetReminder || modalOpen) && (
        <div
          onClick={() => {
            setModalOpen(false);
            if (showEyeResetReminder) dismissEyeReset();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-stone-200/90 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1b4332]" />
                <h3 className="text-sm font-semibold text-slate-900">
                  20-20-20 Eye Strain Reset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  if (showEyeResetReminder) dismissEyeReset();
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual 20-Second Countdown */}
            <div className="py-2 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50/80 border border-emerald-200 flex items-center justify-center text-[#1b4332] font-semibold text-2xl shadow-xs">
                {countdownActive ? countdown : "20s"}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-900">
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
            <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200/70 grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block">
                  Today's Screen
                </span>
                <span className="text-sm font-semibold text-slate-900">{formattedScreenTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block">
                  Next 20-20-20 In
                </span>
                <span className="text-sm font-semibold text-[#1b4332]">
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
                  className="w-full h-11 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
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
                  className="w-full h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
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

