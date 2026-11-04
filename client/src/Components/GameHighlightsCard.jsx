import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Gamepad2, Flame, Sparkles, ArrowRight } from "lucide-react";
import api from "../utils/api";
import { PixelFrog } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";

export const GameHighlightsCard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [topScore, setTopScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchGameStats = async () => {
      try {
        const res = await api.get("/api/game/leaderboard?mode=arcade&limit=3");
        if (isMounted && res.data?.leaderboard) {
          setLeaderboard(res.data.leaderboard);
          if (res.data.leaderboard.length > 0) {
            setTopScore(res.data.leaderboard[0].score || 0);
          }
        }
      } catch (err) {
        // Fallback gracefully if guest or offline
        console.warn("Could not load game highlights:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGameStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-7 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] select-none space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-[#0a1b10] flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-[#0a1b10]" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-[#0a1b10] uppercase tracking-wide">
              Meadow Sprint · Anxiety Reset Game
            </h3>
            <p className="text-[11px] font-mono text-slate-500 font-bold">
              Cognitive de-escalation for code fatigue
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded border border-[#0a1b10]">
          ARCADE READY
        </span>
      </div>

      {/* Body: High Score & Top Hall of Fame */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Record */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>Meadow Record</span>
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-1">
            {loading ? "..." : topScore > 0 ? `${topScore.toLocaleString()} pts` : "740 pts"}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">All-time top sprint</span>
        </div>

        {/* Metric 2: Recovery Protocol */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>Dopamine Reset</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-1">
            60 FPS Pixel
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Smooth physics & stars</span>
        </div>

        {/* Metric 3: Companion Banner */}
        <div className="p-3.5 rounded-xl bg-[#EBF7E9] border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Sanctuary Mode</span>
            </div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              Zero Pressure
            </div>
            <span className="text-[10px] text-slate-600">Zen infinite flow</span>
          </div>
          <div className="shrink-0 pl-2">
            <PixelFrog className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <Link
        to="/game"
        onClick={() => sounds.playClick()}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer"
      >
        <Gamepad2 className="w-4 h-4 text-[#64DC4C]" />
        <span>Launch Meadow Sprint Game</span>
        <ArrowRight className="w-4 h-4 text-[#64DC4C]" />
      </Link>
    </div>
  );
};

export default GameHighlightsCard;

