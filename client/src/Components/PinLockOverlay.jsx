import React, { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";

const PinLockOverlay = ({ onUnlock }) => {
  const [pinInput, setPinInput] = useState("");
  const storedPin =
    localStorage.getItem("calmme_pin") ||
    localStorage.getItem("mindspace_pin") ||
    "1234";

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FCFAF4] rounded-2xl max-w-xs w-full p-6 sm:p-7 flex flex-col items-center text-center border-2 border-[#0a1b10] shadow-[6px_6px_0px_0px_#0a1b10]">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-xl bg-amber-200 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-center mb-3 text-[#0a1b10]">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0a1b10] text-[#64DC4C] font-mono text-[10px] font-black uppercase mb-1 shadow-[1px_1px_0px_#64DC4C]">
          [ VAULT SEALED ]
        </div>

        <h2 className="text-xl font-black font-display tracking-tight text-[#0a1b10] mb-0.5">
          Sanctuary Locked
        </h2>
        <p className="text-xs font-mono font-bold text-slate-700 mb-6">
          Enter 4-digit privacy PIN
        </p>

        {/* PIN Slot Dots */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-xl border-2 border-[#0a1b10] flex items-center justify-center transition-all ${
                pinInput.length > idx
                  ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C]"
                  : "bg-white shadow-[2px_2px_0px_#0a1b10]"
              }`}
            >
              {pinInput.length > idx && (
                <div className="w-3 h-3 bg-[#64DC4C]" />
              )}
            </div>
          ))}
        </div>

        {/* Numpad Grid (Retro Arcade Buttons) */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleKeyPress(n.toString())}
              className="h-12 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-black text-[#0a1b10] hover:bg-[#90D786] transition-all cursor-pointer flex items-center justify-center font-mono"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-rose-100 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-mono font-black text-rose-900 hover:bg-rose-200 transition-all cursor-pointer flex items-center justify-center"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-12 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-black text-[#0a1b10] hover:bg-[#90D786] transition-all cursor-pointer flex items-center justify-center font-mono"
          >
            0
          </button>
          <div className="h-12 rounded-xl border-2 border-[#0a1b10] bg-[#0a1b10] text-[#64DC4C] flex items-center justify-center shadow-[2px_2px_0px_#64DC4C]">
            <ShieldCheck className="w-5 h-5 text-[#64DC4C]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinLockOverlay;
