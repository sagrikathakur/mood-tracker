import React, { useState } from "react";
import { Lock, Sparkles, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";
import { PixelOwl, PixelHeart } from "./PixelIcons";

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
          sounds.playPop(120); // low error buzz
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
    <div className="fixed inset-0 z-50 bg-[#18181B]/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="pixel-card bg-[#FAF8F5] max-w-xs w-full p-6 flex flex-col items-center text-center shadow-[6px_6px_0px_#18181B]">
        {/* Retro Lock Icon / Mascot */}
        <div className="w-14 h-14 rounded-xl border-3 border-[#18181B] bg-[#FFEAA7] flex items-center justify-center mb-3 shadow-[3px_3px_0px_#18181B]">
          <Lock className="w-7 h-7 text-[#18181B]" />
        </div>

        <h2 className="text-xl font-black font-['Bricolage_Grotesque'] tracking-tight text-[#18181B] mb-0.5">
          Sanctuary Locked
        </h2>
        <p className="text-[11px] font-['Silkscreen'] text-[#18181B]/60 mb-5">
          ENTER 4-DIGIT PASSCODE
        </p>

        {/* PIN Slot Boxes */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-9 h-9 rounded-lg border-2 border-[#18181B] flex items-center justify-center transition-all shadow-[2px_2px_0px_#18181B] ${
                pinInput.length > idx
                  ? "bg-[#55EFC4] text-sm font-['Press_Start_2P']"
                  : "bg-white"
              }`}
            >
              {pinInput.length > idx ? "●" : ""}
            </div>
          ))}
        </div>

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n.toString())}
              className="pixel-btn h-12 text-sm font-black font-['Press_Start_2P'] text-[#18181B] flex items-center justify-center cursor-pointer"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="pixel-btn h-12 text-[10px] font-['Silkscreen'] text-[#D63031] flex items-center justify-center cursor-pointer"
          >
            CLR
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="pixel-btn h-12 text-sm font-black font-['Press_Start_2P'] text-[#18181B] flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <div className="h-12 flex items-center justify-center text-[10px] font-['Silkscreen'] text-[#18181B]/50">
            SAFE
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinLockOverlay;
