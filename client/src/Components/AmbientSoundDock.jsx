import React, { useState, useEffect } from "react";
import {
  CloudRain,
  Waves,
  Headphones,
  Music,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import ambientSound from "../utils/ambientSoundscapes";
import { sounds } from "../utils/soundEffects";

const SOUND_TRACKS = [
  {
    id: "rain",
    label: "Gentle Rain",
    icon: CloudRain,
    color: "text-sky-500",
    bgActive: "bg-sky-50 border-sky-300 text-sky-900",
  },
  {
    id: "waves",
    label: "Ocean Swell",
    icon: Waves,
    color: "text-teal-500",
    bgActive: "bg-teal-50 border-teal-300 text-teal-900",
  },
  {
    id: "brown",
    label: "Brown Noise (ADHD Focus)",
    icon: Headphones,
    color: "text-amber-600",
    bgActive: "bg-amber-50 border-amber-300 text-amber-900",
  },
  {
    id: "lofi",
    label: "Lo-Fi Piano Chords",
    icon: Music,
    color: "text-purple-500",
    bgActive: "bg-purple-50 border-purple-300 text-purple-900",
  },
];

export const AmbientSoundDock = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTracks, setActiveTracks] = useState({
    rain: false,
    waves: false,
    brown: false,
    lofi: false,
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("calmme_ambient_volume");
    return saved ? parseFloat(saved) : 0.4;
  });
  const [isMasterMuted, setIsMasterMuted] = useState(false);

  // Sync volume to localStorage
  useEffect(() => {
    localStorage.setItem("calmme_ambient_volume", String(volume));
  }, [volume]);

  // Clean up sounds when component unmounts
  useEffect(() => {
    return () => {
      ambientSound.stopAll();
    };
  }, []);

  const toggleTrack = (trackId) => {
    sounds.playClick();
    setActiveTracks((prev) => {
      const nextState = !prev[trackId];
      const updated = { ...prev, [trackId]: nextState };

      const effectiveVol = isMasterMuted ? 0 : volume;

      if (trackId === "rain") {
        nextState ? ambientSound.startRain(effectiveVol) : ambientSound.stopRain();
      } else if (trackId === "waves") {
        nextState ? ambientSound.startWaves(effectiveVol) : ambientSound.stopWaves();
      } else if (trackId === "brown") {
        nextState ? ambientSound.startBrownNoise(effectiveVol) : ambientSound.stopBrownNoise();
      } else if (trackId === "lofi") {
        nextState ? ambientSound.startLoFi(effectiveVol) : ambientSound.stopLoFi();
      }

      return updated;
    });
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (!isMasterMuted) {
      if (activeTracks.rain) ambientSound.startRain(newVol);
      if (activeTracks.waves) ambientSound.startWaves(newVol);
      if (activeTracks.brown) ambientSound.startBrownNoise(newVol);
      if (activeTracks.lofi) ambientSound.startLoFi(newVol);
    }
  };

  const toggleMasterMute = () => {
    sounds.playClick();
    setIsMasterMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        ambientSound.stopAll();
      } else {
        if (activeTracks.rain) ambientSound.startRain(volume);
        if (activeTracks.waves) ambientSound.startWaves(volume);
        if (activeTracks.brown) ambientSound.startBrownNoise(volume);
        if (activeTracks.lofi) ambientSound.startLoFi(volume);
      }
      return nextMuted;
    });
  };

  const isAnyPlaying = Object.values(activeTracks).some(Boolean);

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Expanded Soundboard Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white/95 backdrop-blur-md rounded-3xl p-5 border-2 border-[#0a1b10] shadow-[6px_6px_0px_#0a1b10] animate-in slide-in-from-bottom-3 duration-150 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 font-display">
                  Developer Focus Station
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">Ambient Audio Layers</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMasterMute}
              title={isMasterMuted ? "Unmute Soundscapes" : "Mute Soundscapes"}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            >
              {isMasterMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            </button>
          </div>

          {/* Sound Channels Grid */}
          <div className="grid grid-cols-2 gap-2">
            {SOUND_TRACKS.map((track) => {
              const Icon = track.icon;
              const isActive = activeTracks[track.id] && !isMasterMuted;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  className={`p-2.5 rounded-2xl border-2 text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    isActive
                      ? `${track.bgActive} shadow-[2px_2px_0px_#0a1b10]`
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-4 h-4 ${isActive ? track.color : "text-slate-400"}`} />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold leading-tight block">{track.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
              <span>Master Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#0a1b10] text-xs font-black shadow-[4px_4px_0px_#0a1b10] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer ${
          isAnyPlaying && !isMasterMuted
            ? "bg-[#0a1b10] text-[#64DC4C]"
            : "bg-white text-slate-900 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Headphones className="w-4 h-4 shrink-0" />
          <span className="font-mono">
            {isAnyPlaying && !isMasterMuted ? "Lo-Fi Focus ON" : "Ambient Sounds"}
          </span>
          {isAnyPlaying && !isMasterMuted && (
            <span className="w-2 h-2 rounded-full bg-[#64DC4C] animate-ping" />
          )}
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default AmbientSoundDock;

