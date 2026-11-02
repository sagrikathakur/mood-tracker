import React, { useState } from "react";
import { Lock, Sparkles, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";

const PinLockOverlay = ({ onUnlock }) => {
  const [pinInput, setPinInput] = useState("");
  const storedPin = localStorage.getItem("mindspace_pin") || "1234";

  const handleKeyPress = (num) => {
    if (pinInput.length < 4) {
      sounds.playBlip(450 + pinInput.length * 50);
      const next = pinInput + num;
      setPinInput(next);
      if (next.length === 4) {
        if (next === storedPin) {
          sounds.playSuccess();
          toast.success("Sanctuary Unlocked!", { icon: "🌿" });
          onUnlock();
        } else {
          sounds.playPop(120);
          toast.error("Incorrect PIN. Please try again.");
          setTimeout(() => setPinInput(""), 350);
        }
      }
    }
  };

  const handleClear = () => {
    sounds.playPop();
    setPinInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl border border-slate-200/80">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mb-3 text-amber-600 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-black font-display tracking-tight text-slate-900 mb-0.5">
          Sanctuary Locked
        </h2>
        <p className="text-xs font-semibold text-slate-400 mb-6">
          Enter your 4-digit privacy PIN
        </p>

        {/* PIN Slot Dots */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${
                pinInput.length > idx
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {pinInput.length > idx && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>
          ))}
        </div>

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleKeyPress(n.toString())}
              className="h-12 rounded-2xl bg-slate-50 border border-slate-200/80 text-base font-bold text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer flex items-center justify-center font-display"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-12 rounded-2xl bg-slate-50 border border-slate-200/80 text-base font-bold text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer flex items-center justify-center font-display"
          >
            0
          </button>
          <div className="h-12 flex items-center justify-center text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinLockOverlay;
