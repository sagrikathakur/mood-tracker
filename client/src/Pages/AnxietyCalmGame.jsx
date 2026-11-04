import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  Heart,
  HeartOff,
  RotateCcw,
  Check,
  Trophy,
  Play,
  Pause,
  Shield,
  Zap,
  Coffee,
  Flame,
  Info,
  Flower2,
  Droplets,
  Leaf,
  Gem,
  Magnet,
  CloudLightning,
  Bug,
  Bomb,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Sun,
  Sunset,
  Moon,
  Lock,
  BookmarkCheck,
  Infinity as InfinityIcon,
  Award,
} from "lucide-react";
import assets from "../assets/asset";
import gameBgImg from "../assets/game-bg.jpg";
import { sounds } from "../utils/soundEffects";
import api from "../utils/api";

// =============================================================================
// COMPANION ROSTER WITH PRODUCTION PERKS & UNLOCKS
// =============================================================================
const PETS = [
  {
    id: "p3",
    name: "Corgi Loaf",
    title: "Agile Leaper",
    perk: "+15% Jump Height & Double Float",
    desc: "Bouncy paws easily glide over high obstacles and reach floating diamonds.",
    img: assets.p3,
    color: "#F59E0B",
    jumpMult: 1.15,
    magnetBonus: 1.0,
    scoreMult: 1.0,
    startShield: false,
    soundFreq: 520,
    locked: false,
  },
  {
    id: "p1",
    name: "Pixel Pup",
    title: "Focus Magnet",
    perk: "+50% Longer Power-Ups & Orb Attraction",
    desc: "Innate curiosity pulls calming items and extends shield / coffee boosts.",
    img: assets.p1,
    color: "#10B981",
    jumpMult: 1.0,
    magnetBonus: 1.6,
    scoreMult: 1.0,
    startShield: false,
    soundFreq: 480,
    locked: false,
  },
  {
    id: "p2",
    name: "Peace Dino",
    title: "Zen Guardian",
    perk: "Starts Every Run with a Zen Shield",
    desc: "Ancient centered mindfulness protects against the first hazard hit.",
    img: assets.p2,
    color: "#06B6D4",
    jumpMult: 1.0,
    magnetBonus: 1.0,
    scoreMult: 1.0,
    startShield: true,
    soundFreq: 440,
    locked: false,
  },
  {
    id: "p4",
    name: "Super Doge",
    title: "Sprint Master",
    perk: "+20% Combo Multiplier Velocity",
    desc: "Much speed! Stacks Zen Streaks rapidly for massive score multipliers.",
    img: assets.p4,
    color: "#EAB308",
    jumpMult: 1.05,
    magnetBonus: 1.15,
    scoreMult: 1.2,
    startShield: false,
    soundFreq: 560,
    locked: false,
  },
  {
    id: "p5",
    name: "Pop Cat",
    title: "Harmony Pop",
    perk: "+25% Bonus Points on All Items",
    desc: "Rhythmic joy amplifies the score of every flower, drop, and tea collected.",
    img: assets.p5,
    color: "#EC4899",
    jumpMult: 1.0,
    magnetBonus: 1.0,
    scoreMult: 1.25,
    startShield: false,
    soundFreq: 600,
    locked: false,
  },
  {
    id: "duck",
    name: "Rubber Duck",
    title: "Debug Guru",
    perk: "Neutralizes 1st Bug Hazard & +20% Magnet",
    desc: "Talks through bugs until they disappear into peaceful code.",
    img: assets.rubberDuck || assets.confusedDuck,
    color: "#FACC15",
    jumpMult: 1.0,
    magnetBonus: 1.3,
    scoreMult: 1.1,
    startShield: true,
    soundFreq: 500,
    unlockCondition: "Score 400+ points in a single run",
    unlockPoints: 400,
    locked: true,
  },
  {
    id: "chillCat",
    name: "Chill Cat",
    title: "Tea Master",
    perk: "2x Espresso Boost lasts 14 Seconds",
    desc: "Sips iced tea in sunglasses with total nonchalance.",
    img: assets.chillCat || assets.teaCat,
    color: "#FB923C",
    jumpMult: 1.08,
    magnetBonus: 1.2,
    scoreMult: 1.2,
    startShield: false,
    soundFreq: 460,
    unlockCondition: "Reach a 10x Zen Combo streak",
    unlockCombo: 10,
    locked: true,
  },
];

// =============================================================================
// VECTOR LUCIDE PATHS FOR CANVAS DRAWING
// =============================================================================
const LUCIDE_PATHS = {
  flower2:
    '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/>',
  droplets:
    '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  coffee:
    '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
  sparkles:
    '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
  leaf:
    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  gem:
    '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  magnet:
    '<path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/><path d="m5 8 4 4"/><path d="m12 15 4 4"/>',
  zap:
    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  cloudLightning:
    '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  bug:
    '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6 13H2"/><path d="M22 13h-4"/>',
  alertTriangle:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  bomb:
    '<circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>',
};

// =============================================================================
// COLLECTIBLES & HAZARDS DEFINITIONS
// =============================================================================
const ITEM_TYPES = {
  // Positive Collectibles
  BLOSSOM: { key: "flower2", icon: Flower2, label: "Blossom", pts: 10, isHazard: false, sound: 523, color: "#fda4af", stroke: "#e11d48" },
  HYDRATION: { key: "droplets", icon: Droplets, label: "Hydration", pts: 15, isHazard: false, sound: 587, color: "#7dd3fc", stroke: "#0284c7" },
  TEA: { key: "coffee", icon: Coffee, label: "Warm Tea", pts: 20, isHazard: false, sound: 659, color: "#fcd34d", stroke: "#d97706" },
  SPARKLE: { key: "sparkles", icon: Sparkles, label: "Sparkle", pts: 30, isHazard: false, sound: 784, color: "#fef08a", stroke: "#ca8a04" },
  MINT: { key: "leaf", icon: Leaf, label: "Fresh Mint", pts: 25, isHazard: false, sound: 880, color: "#6ee7b7", stroke: "#059669" },
  DIAMOND: { key: "gem", icon: Gem, label: "Zen Gem", pts: 50, isHazard: false, sound: 1046, color: "#a5f3fc", stroke: "#0891b2" },

  // Power-Ups
  SHIELD: { key: "shield", icon: Shield, label: "Zen Shield", pts: 25, isPowerUp: "shield", isHazard: false, sound: 880, color: "#38bdf8", stroke: "#0284c7" },
  MAGNET: { key: "magnet", icon: Magnet, label: "Focus Magnet", pts: 25, isPowerUp: "magnet", isHazard: false, sound: 740, color: "#c084fc", stroke: "#9333ea" },
  COFFEE: { key: "zap", icon: Zap, label: "2x Espresso", pts: 25, isPowerUp: "coffee", isHazard: false, sound: 920, color: "#fb923c", stroke: "#ea580c" },
  HEART: { key: "heart", icon: Heart, label: "Health Heart", pts: 35, isPowerUp: "heart", isHazard: false, sound: 987, color: "#f43f5e", stroke: "#e11d48" },

  // Negative Hazards (-Points & -1 Heart in Arcade mode)
  STORM: { key: "cloudLightning", icon: CloudLightning, label: "Storm Cloud", pts: -15, isHazard: true, color: "#a855f7", stroke: "#c084fc", isHigh: true },
  BURNOUT: { key: "flame", icon: Flame, label: "Burnout Flare", pts: -20, isHazard: true, color: "#ef4444", stroke: "#f87171", isGround: true },
  GLITCH: { key: "bug", icon: Bug, label: "Bug Glitch", pts: -15, isHazard: true, color: "#f97316", stroke: "#fb923c" },
  THORN: { key: "alertTriangle", icon: AlertTriangle, label: "Sprint Thorn", pts: -10, isHazard: true, color: "#10b981", stroke: "#34d399", isGround: true },
  BOMB: { key: "bomb", icon: Bomb, label: "Panic Bomb", pts: -25, isHazard: true, color: "#e11d48", stroke: "#fb7185" },
};

const SOOTHING_QUOTES = [
  "Inhale peace, exhale tension. Let your shoulders drop.",
  "You do not need to solve everything today.",
  "Take a slow breath. You are centered and safe.",
  "Your worth as a developer is not measured by lines of code.",
  "Softly relax your jaw and enjoy this gentle meadow breeze.",
  "One line, one step at a time is always enough.",
];

const MAX_LIVES = 3;

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const AnxietyCalmGame = () => {
  const canvasRef = useRef(null);

  // Unlocked companions state
  const [unlockedPets, setUnlockedPets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("calmme_unlocked_pets") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Game Mode: "arcade" | "zen"
  const [gameMode, setGameMode] = useState(() => {
    return localStorage.getItem("calmme_game_mode") || "arcade";
  });

  // React State for HUD & Overlays
  const [selectedPet, setSelectedPet] = useState(PETS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("calmme_game_high_score") || 0);
  });
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loggedToSanctuary, setLoggedToSanctuary] = useState(false);
  const [unlockToast, setUnlockToast] = useState(null);

  // Audio Toggles
  const [muted, setMuted] = useState(sounds.isMuted);
  const [bgmActive, setBgmActive] = useState(() => {
    return localStorage.getItem("calmme_bgm_active") !== "false";
  });

  // Power-up States
  const [activeShield, setActiveShield] = useState(false);
  const [magnetTimer, setMagnetTimer] = useState(0);
  const [coffeeTimer, setCoffeeTimer] = useState(0);
  const [affirmation, setAffirmation] = useState(SOOTHING_QUOTES[0]);

  // Current Biome / Time of Day
  const [timeOfDay, setTimeOfDay] = useState("morning"); // "morning" | "sunset" | "night"

  // Hall of Fame Leaderboard
  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("calmme_game_leaderboard") || "[]");
    } catch {
      return [];
    }
  });

  // Game Stats for Game Over Screen
  const [stats, setStats] = useState({
    orbsCaught: 0,
    hazardsDodged: 0,
    maxCombo: 0,
    distanceMeters: 0,
  });

  // Mutable Game Loop State (Zero-lag ref container)
  const gRef = useRef({
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    maxCombo: 0,
    orbsCaught: 0,
    hazardsDodged: 0,
    distance: 0,
    speed: 4.8,
    isGameOver: false,
    isPaused: false,
    hasShield: false,
    magnetTime: 0,
    coffeeTime: 0,
    shake: 0,
    flashRed: 0,
    gameMode: "arcade",

    // Player Physics
    player: {
      x: 120,
      y: 0,
      w: 64,
      h: 64,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
      isSliding: false,
      slideTimer: 0,
      runFrame: 0,
      rotation: 0,
    },

    // Ambient stars & fireflies for Night Biome
    stars: Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight * 0.6),
      radius: 0.8 + Math.random() * 1.8,
      alpha: 0.3 + Math.random() * 0.7,
      speed: 0.02 + Math.random() * 0.04,
    })),
    fireflies: Array.from({ length: 12 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * 0.4 + Math.random() * (window.innerHeight * 0.4),
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.2,
      radius: 2 + Math.random() * 2.5,
      alpha: Math.random(),
    })),

    // Arrays
    items: [],
    particles: [],
    floatingTexts: [],
    dustPuffs: [],

    // Assets & Timing
    bgX: 0,
    bgImg: null,
    petImages: {},
    iconImages: {},
    lastSpawnTime: 0,
    animId: null,
  });

  // Sync game mode ref
  useEffect(() => {
    gRef.current.gameMode = gameMode;
    localStorage.setItem("calmme_game_mode", gameMode);
  }, [gameMode]);

  // Pre-load pet and background images + React Lucide vector icons
  useEffect(() => {
    const bg = new Image();
    bg.src = gameBgImg || assets.game_bg;
    gRef.current.bgImg = bg;

    PETS.forEach((p) => {
      const img = new Image();
      img.src = p.img;
      gRef.current.petImages[p.id] = img;
    });

    const icons = {};
    Object.values(ITEM_TYPES).forEach((item) => {
      const path = LUCIDE_PATHS[item.key];
      if (path) {
        const stroke = item.stroke || item.color;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
        const img = new Image();
        img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
        icons[item.key] = img;
      }
    });
    gRef.current.iconImages = icons;
  }, []);

  // Starting shield perk
  useEffect(() => {
    if (selectedPet.startShield) {
      gRef.current.hasShield = true;
      setActiveShield(true);
    }
  }, [selectedPet]);

  // Manage Ambient Lo-Fi BGM
  useEffect(() => {
    if (bgmActive && !muted && !isGameOver && !isPaused) {
      sounds.startLoFiBGM();
    } else {
      sounds.stopLoFiBGM();
    }
    return () => sounds.stopLoFiBGM();
  }, [bgmActive, muted, isGameOver, isPaused]);

  const handleToggleBgm = () => {
    const nextState = !bgmActive;
    setBgmActive(nextState);
    localStorage.setItem("calmme_bgm_active", nextState ? "true" : "false");
    if (nextState) {
      sounds.playClick();
      sounds.startLoFiBGM();
    } else {
      sounds.stopLoFiBGM();
    }
  };

  const handleToggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (isNowMuted) {
      sounds.stopLoFiBGM();
    } else if (bgmActive) {
      sounds.startLoFiBGM();
    }
  };

  // Jump Command
  const triggerJump = useCallback(() => {
    const g = gRef.current;
    if (g.isGameOver || g.isPaused) return;

    const p = g.player;
    if (p.isSliding) {
      p.isSliding = false;
      p.h = 64;
    }

    if (p.jumpsLeft > 0) {
      const jumpImpulse = (p.jumpsLeft === 2 ? -14.2 : -12.5) * selectedPet.jumpMult;
      p.vy = jumpImpulse;
      p.isGrounded = false;
      p.jumpsLeft -= 1;

      sounds.playPop(selectedPet.soundFreq + (p.jumpsLeft === 1 ? 0 : 70));

      for (let i = 0; i < 6; i++) {
        g.dustPuffs.push({
          x: p.x + p.w / 2,
          y: p.y + p.h,
          vx: (Math.random() - 0.5) * 3 - 2,
          vy: -Math.random() * 2,
          radius: 3 + Math.random() * 4,
          alpha: 0.8,
        });
      }
    }
  }, [selectedPet]);

  // Slide / Duck Command
  const triggerSlide = useCallback((isDown) => {
    const g = gRef.current;
    if (g.isGameOver || g.isPaused) return;

    const p = g.player;
    if (isDown) {
      if (p.isGrounded && !p.isSliding) {
        p.isSliding = true;
        p.h = 36;
        p.slideTimer = 35;
        sounds.playClick();
      } else if (!p.isGrounded) {
        p.vy = Math.max(p.vy, 14);
      }
    } else {
      if (p.isSliding) {
        p.isSliding = false;
        p.h = 64;
      }
    }
  }, []);

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (gRef.current.isGameOver) {
          handleRestart();
        } else {
          triggerJump();
        }
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        triggerSlide(true);
      } else if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        togglePause();
      } else if (e.code === "KeyM") {
        handleToggleSound();
      } else if (e.code === "KeyB") {
        handleToggleBgm();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        triggerSlide(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerJump, triggerSlide, bgmActive, muted]);

  const togglePause = () => {
    sounds.playClick();
    gRef.current.isPaused = !gRef.current.isPaused;
    setIsPaused(gRef.current.isPaused);
  };

  // Restart / Play Again
  const handleRestart = () => {
    sounds.playSuccess();
    const g = gRef.current;

    g.score = 0;
    g.lives = MAX_LIVES;
    g.combo = 0;
    g.maxCombo = 0;
    g.orbsCaught = 0;
    g.hazardsDodged = 0;
    g.distance = 0;
    g.speed = 4.8;
    g.isGameOver = false;
    g.isPaused = false;
    g.hasShield = selectedPet.startShield;
    g.magnetTime = 0;
    g.coffeeTime = 0;
    g.shake = 0;
    g.flashRed = 0;

    g.player.y = 0;
    g.player.vy = 0;
    g.player.isGrounded = true;
    g.player.jumpsLeft = 2;
    g.player.isSliding = false;
    g.player.h = 64;

    g.items = [];
    g.particles = [];
    g.floatingTexts = [];
    g.dustPuffs = [];

    setScore(0);
    setLives(MAX_LIVES);
    setCombo(0);
    setActiveShield(selectedPet.startShield);
    setMagnetTimer(0);
    setCoffeeTimer(0);
    setIsGameOver(false);
    setIsPaused(false);
    setLoggedToSanctuary(false);
  };

  // Log Mindful Session to Sanctuary Dashboard
  const handleLogToSanctuary = async () => {
    sounds.playSuccess();
    const duration = Math.max(3, Math.round(stats.distanceMeters / 120));
    try {
      const existing = JSON.parse(localStorage.getItem("calmme_wellness_log") || "[]");
      const newEntry = {
        id: `sess-${Date.now()}`,
        date: new Date().toISOString(),
        score,
        durationMinutes: duration,
        pet: selectedPet.name,
        mode: gameMode,
      };
      localStorage.setItem("calmme_wellness_log", JSON.stringify([newEntry, ...existing.slice(0, 30)]));

      // Boost streak
      const currentStreak = Number(localStorage.getItem("calmme_recovery_streak") || "0");
      localStorage.setItem("calmme_recovery_streak", String(currentStreak + 1));

      // Dispatch to Sanctuary backend API
      api.post("/api/game/recovery", { minutes: duration }).catch(() => {});

      setLoggedToSanctuary(true);
    } catch {
      setLoggedToSanctuary(true);
    }
  };

  // Check & Unlock Companions
  const checkCompanionUnlocks = useCallback(
    (currentScore, currentCombo) => {
      const newlyUnlocked = [];

      PETS.forEach((p) => {
        if (p.locked && !unlockedPets.includes(p.id)) {
          if (p.unlockPoints && currentScore >= p.unlockPoints) {
            newlyUnlocked.push(p);
          } else if (p.unlockCombo && currentCombo >= p.unlockCombo) {
            newlyUnlocked.push(p);
          }
        }
      });

      if (newlyUnlocked.length > 0) {
        sounds.playCelebration();
        const updated = [...unlockedPets, ...newlyUnlocked.map((p) => p.id)];
        setUnlockedPets(updated);
        localStorage.setItem("calmme_unlocked_pets", JSON.stringify(updated));
        setUnlockToast(`🎉 Companion Unlocked: ${newlyUnlocked[0].name}!`);
        setTimeout(() => setUnlockToast(null), 4000);
      }
    },
    [unlockedPets]
  );

  // Save Leaderboard Entry (Persists locally and syncs to backend Hall of Fame)
  const saveLeaderboardEntry = (finalScore, finalStats) => {
    try {
      const entry = {
        id: `lead-${Date.now()}`,
        score: finalScore,
        pet: selectedPet.name,
        petImg: selectedPet.img,
        distance: finalStats.distanceMeters,
        combo: finalStats.maxCombo,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      const existing = JSON.parse(localStorage.getItem("calmme_game_leaderboard") || "[]");
      const updated = [entry, ...existing].sort((a, b) => b.score - a.score).slice(0, 5);
      localStorage.setItem("calmme_game_leaderboard", JSON.stringify(updated));
      setLeaderboard(updated);

      // Async sync to server database
      api.post("/api/game/score", {
        playerName: selectedPet.name,
        mode: gameMode,
        score: finalScore,
        distance: finalStats.distanceMeters,
        maxCombo: finalStats.maxCombo,
        starsCollected: finalStats.orbsCaught,
      }).catch(() => {});
    } catch {}
  };

  // Fetch real-time Hall of Fame when leaderboard modal opens
  useEffect(() => {
    if (showLeaderboard) {
      api.get(`/api/game/leaderboard?mode=${gameMode}`)
        .then((res) => {
          if (res.data?.leaderboard && res.data.leaderboard.length > 0) {
            const mapped = res.data.leaderboard.map((r) => ({
              id: r.id,
              score: r.score,
              pet: r.player_name || "Zen Runner",
              distance: r.distance,
              combo: r.max_combo,
              date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            }));
            setLeaderboard(mapped);
          }
        })
        .catch(() => {});
    }
  }, [showLeaderboard, gameMode]);

  // =============================================================================
  // MAIN 60 FPS HTML5 CANVAS ENGINE
  // =============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = performance.now();
    let syncThrottle = 0;

    const gameLoop = (now) => {
      const dt = Math.min(32, now - lastTime) / 16.66;
      lastTime = now;

      const g = gRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const groundY = Math.floor(height * 0.81);

      if (!g.isPaused && !g.isGameOver) {
        // 1. Advance Distance & Speed
        g.distance += g.speed * dt * 0.1;
        g.speed = Math.min(9.5, 4.8 + g.distance * 0.0018);

        // Update Day / Sunset / Night Biome
        if (g.distance >= 600) {
          setTimeOfDay("night");
        } else if (g.distance >= 250) {
          setTimeOfDay("sunset");
        } else {
          setTimeOfDay("morning");
        }

        // 2. Power-Up Timers
        if (g.magnetTime > 0) {
          g.magnetTime -= dt;
          if (g.magnetTime <= 0) g.magnetTime = 0;
        }
        if (g.coffeeTime > 0) {
          g.coffeeTime -= dt;
          if (g.coffeeTime <= 0) g.coffeeTime = 0;
        }

        // 3. Player Physics
        const p = g.player;
        p.vy += 0.65 * dt;
        p.y += p.vy * dt;

        if (p.y >= groundY - p.h) {
          p.y = groundY - p.h;
          p.vy = 0;
          if (!p.isGrounded) {
            p.isGrounded = true;
            p.jumpsLeft = 2;
            for (let i = 0; i < 4; i++) {
              g.dustPuffs.push({
                x: p.x + p.w / 2,
                y: groundY,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 1.5,
                radius: 3 + Math.random() * 3,
                alpha: 0.7,
              });
            }
          }
        }

        if (p.isSliding) {
          p.slideTimer -= dt;
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.h = 64;
          }
        }

        // Running dust emitter
        p.runFrame += dt;
        if (p.isGrounded && Math.floor(p.runFrame) % 7 === 0) {
          g.dustPuffs.push({
            x: p.x + (p.isSliding ? 10 : 15),
            y: groundY - 2,
            vx: -g.speed * 0.5 - Math.random() * 1.5,
            vy: -Math.random() * 1.2,
            radius: 2.5 + Math.random() * 3,
            alpha: 0.6,
          });
        }

        // 4. Parallax Background Scroll
        g.bgX -= g.speed * 0.45 * dt;
        if (g.bgX <= -width) g.bgX = 0;

        // 5. Spawn Item Waves
        if (now - g.lastSpawnTime > Math.max(650, 1500 - g.distance * 0.6)) {
          g.lastSpawnTime = now;

          const isPowerUpRoll = Math.random() < 0.13;
          // In Zen Mode, hazards are 0%
          const isHazardRoll = g.gameMode === "zen" ? false : Math.random() < 0.35;

          let chosenItem;
          if (isPowerUpRoll) {
            const powerKeys = [ITEM_TYPES.SHIELD, ITEM_TYPES.MAGNET, ITEM_TYPES.COFFEE, ITEM_TYPES.HEART];
            chosenItem = powerKeys[Math.floor(Math.random() * powerKeys.length)];
          } else if (isHazardRoll) {
            const hazardKeys = [ITEM_TYPES.STORM, ITEM_TYPES.BURNOUT, ITEM_TYPES.GLITCH, ITEM_TYPES.THORN, ITEM_TYPES.BOMB];
            chosenItem = hazardKeys[Math.floor(Math.random() * hazardKeys.length)];
          } else {
            const posKeys = [ITEM_TYPES.BLOSSOM, ITEM_TYPES.HYDRATION, ITEM_TYPES.TEA, ITEM_TYPES.SPARKLE, ITEM_TYPES.MINT, ITEM_TYPES.DIAMOND];
            chosenItem = posKeys[Math.floor(Math.random() * posKeys.length)];
          }

          let spawnY = groundY - 50;
          if (chosenItem.isHigh) {
            spawnY = groundY - 150;
          } else if (chosenItem.isGround) {
            spawnY = groundY - 45;
          } else {
            spawnY = groundY - (40 + Math.random() * 120);
          }

          g.items.push({
            id: `item-${now}-${Math.random()}`,
            data: chosenItem,
            x: width + 50,
            y: spawnY,
            size: chosenItem.isPowerUp ? 44 : 38,
            bobOffset: Math.random() * Math.PI * 2,
            collected: false,
          });
        }

        // 6. Update Items & Handle Collisions
        const playerBox = {
          x: p.x + 8,
          y: p.y + 8,
          w: p.w - 16,
          h: p.h - 12,
        };

        const remainingItems = [];
        for (const item of g.items) {
          item.x -= g.speed * dt;

          // Magnet Attraction
          if (g.magnetTime > 0 && !item.data.isHazard) {
            const dx = p.x + p.w / 2 - item.x;
            const dy = p.y + p.h / 2 - item.y;
            const dist = Math.hypot(dx, dy);
            const magnetRadius = 280 * selectedPet.magnetBonus;

            if (dist < magnetRadius) {
              item.x += (dx / dist) * (10 + (1 - dist / magnetRadius) * 12) * dt;
              item.y += (dy / dist) * (10 + (1 - dist / magnetRadius) * 12) * dt;
            }
          }

          const itemBox = {
            x: item.x - item.size / 2,
            y: item.y - item.size / 2,
            w: item.size,
            h: item.size,
          };

          const isColliding =
            playerBox.x < itemBox.x + itemBox.w &&
            playerBox.x + playerBox.w > itemBox.x &&
            playerBox.y < itemBox.y + itemBox.h &&
            playerBox.y + playerBox.h > itemBox.y;

          if (isColliding && !item.collected) {
            item.collected = true;

            if (item.data.isHazard) {
              // HAZARD HIT (Arcade Mode Only)
              if (navigator.vibrate) navigator.vibrate([40, 25, 40]);

              if (g.hasShield) {
                g.hasShield = false;
                setActiveShield(false);
                sounds.playPop(300);
                g.shake = 8;

                for (let i = 0; i < 18; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 2 + Math.random() * 5;
                  g.particles.push({
                    x: p.x + p.w / 2,
                    y: p.y + p.h / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: "#38BDF8",
                    alpha: 1,
                    size: 3 + Math.random() * 3,
                  });
                }

                g.floatingTexts.push({
                  x: p.x + p.w / 2,
                  y: p.y - 10,
                  text: "SHIELD BLOCKED!",
                  color: "#38bdf8",
                  alpha: 1,
                });
              } else {
                sounds.playHazard();
                g.shake = 16;
                g.flashRed = 1;
                g.combo = 0;

                const ptsLost = item.data.pts;
                g.score = Math.max(0, g.score + ptsLost);
                g.lives -= 1;

                for (let i = 0; i < 20; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 3 + Math.random() * 6;
                  g.particles.push({
                    x: item.x,
                    y: item.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: item.data.color,
                    alpha: 1,
                    size: 4 + Math.random() * 4,
                  });
                }

                g.floatingTexts.push({
                  x: item.x,
                  y: item.y - 20,
                  text: `${ptsLost} ${item.data.label}`,
                  color: "#ef4444",
                  alpha: 1,
                });

                if (g.lives <= 0) {
                  g.isGameOver = true;
                  sounds.playGameOver();

                  const finalStats = {
                    orbsCaught: g.orbsCaught,
                    hazardsDodged: g.hazardsDodged,
                    maxCombo: g.maxCombo,
                    distanceMeters: Math.floor(g.distance),
                  };
                  setStats(finalStats);

                  setHighScore((prevHigh) => {
                    const newHigh = Math.max(prevHigh, g.score);
                    localStorage.setItem("calmme_game_high_score", String(newHigh));
                    return newHigh;
                  });

                  saveLeaderboardEntry(g.score, finalStats);
                  setIsGameOver(true);
                }
              }
            } else {
              // POSITIVE ITEM / POWER-UP
              if (navigator.vibrate) navigator.vibrate(15);
              sounds.playPop(item.data.sound);
              g.orbsCaught += 1;

              g.combo += 1;
              if (g.combo > g.maxCombo) g.maxCombo = g.combo;

              // Check companion unlock triggers
              checkCompanionUnlocks(g.score, g.combo);

              let comboMult = 1.0;
              if (g.combo >= 20) comboMult = 3.0;
              else if (g.combo >= 10) comboMult = 2.0;
              else if (g.combo >= 5) comboMult = 1.5;

              const coffeeMult = g.coffeeTime > 0 ? 2.0 : 1.0;
              const petMult = selectedPet.scoreMult;
              const finalPts = Math.round(item.data.pts * comboMult * coffeeMult * petMult);

              g.score += finalPts;

              if (item.data.isPowerUp === "shield") {
                g.hasShield = true;
                setActiveShield(true);
                sounds.playSuccess();
              } else if (item.data.isPowerUp === "magnet") {
                g.magnetTime = 480;
                sounds.playCelebration();
              } else if (item.data.isPowerUp === "coffee") {
                // Chill Cat bonus duration: 14s vs 7s
                g.coffeeTime = selectedPet.id === "chillCat" ? 840 : 420;
                sounds.playCelebration();
              } else if (item.data.isPowerUp === "heart") {
                if (g.lives < MAX_LIVES) {
                  g.lives += 1;
                  sounds.playSuccess();
                }
              }

              for (let i = 0; i < 14; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 4.5;
                g.particles.push({
                  x: item.x,
                  y: item.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  color: item.data.color,
                  alpha: 1,
                  size: 3 + Math.random() * 3,
                });
              }

              g.floatingTexts.push({
                x: item.x,
                y: item.y - 15,
                text: `+${finalPts} ${item.data.label}`,
                color: item.data.color,
                alpha: 1,
              });

              if (g.combo % 7 === 0) {
                sounds.playSuccess();
                setAffirmation(SOOTHING_QUOTES[Math.floor(Math.random() * SOOTHING_QUOTES.length)]);
              }
            }
          } else if (item.x > -60) {
            remainingItems.push(item);
          } else if (item.data.isHazard && !item.collected) {
            g.hazardsDodged += 1;
          }
        }
        g.items = remainingItems;

        // 7. Update Particles
        g.particles = g.particles.filter((pt) => {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 0.12 * dt;
          pt.alpha -= 0.024 * dt;
          return pt.alpha > 0;
        });

        g.dustPuffs = g.dustPuffs.filter((d) => {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.radius += 0.2 * dt;
          d.alpha -= 0.03 * dt;
          return d.alpha > 0;
        });

        g.floatingTexts = g.floatingTexts.filter((t) => {
          t.y -= 1.2 * dt;
          t.alpha -= 0.02 * dt;
          return t.alpha > 0;
        });

        if (g.shake > 0) g.shake *= 0.88;
        if (g.flashRed > 0) g.flashRed -= 0.04 * dt;

        syncThrottle += dt;
        if (syncThrottle >= 4) {
          syncThrottle = 0;
          setScore(g.score);
          setLives(g.lives);
          setCombo(g.combo);
          setActiveShield(g.hasShield);
          setMagnetTimer(Math.ceil(g.magnetTime / 60));
          setCoffeeTimer(Math.ceil(g.coffeeTime / 60));
        }
      }

      // =======================================================================
      // CANVAS RENDERING PASS
      // =======================================================================
      ctx.save();

      if (g.shake > 0.5) {
        const sx = (Math.random() - 0.5) * g.shake;
        const sy = (Math.random() - 0.5) * g.shake;
        ctx.translate(sx, sy);
      }

      ctx.clearRect(0, 0, width, height);

      // A. Parallax Endless Meadow Background
      if (g.bgImg && g.bgImg.complete) {
        const bgW = width;
        ctx.drawImage(g.bgImg, g.bgX, 0, bgW, height);
        ctx.drawImage(g.bgImg, g.bgX + bgW - 1, 0, bgW, height);
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, "#BAE6FD");
        skyGrad.addColorStop(0.7, "#DCFCE7");
        skyGrad.addColorStop(1, "#86EFAC");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // B. Day / Sunset / Night Atmospheric Gradient Overlays
      if (g.distance >= 600) {
        // Deep Night Indigo with Stars & Fireflies
        ctx.fillStyle = "rgba(15, 23, 42, 0.62)";
        ctx.fillRect(0, 0, width, height);

        // Twinkling Canvas Stars
        for (const st of g.stars) {
          st.alpha += Math.sin(now * st.speed) * 0.01;
          ctx.save();
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.2, Math.min(1, st.alpha))})`;
          ctx.shadowColor = "#fef08a";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        }

        // Glowing Fireflies around pet
        for (const ff of g.fireflies) {
          ff.x += ff.vx;
          ff.y += ff.vy;
          if (ff.x < 0) ff.x = width;
          if (ff.x > width) ff.x = 0;
          if (ff.y < height * 0.3) ff.y = height * 0.75;
          if (ff.y > height * 0.8) ff.y = height * 0.4;

          ctx.save();
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 243, 208, ${0.4 + Math.sin(now * 0.004) * 0.35})`;
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      } else if (g.distance >= 250) {
        // Warm Sunset Peach / Golden Glow
        const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
        sunsetGrad.addColorStop(0, "rgba(249, 115, 22, 0.28)");
        sunsetGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.2)");
        sunsetGrad.addColorStop(1, "rgba(245, 158, 11, 0.15)");
        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // C. Red Damage Flash
      if (g.flashRed > 0.05) {
        ctx.fillStyle = `rgba(239, 68, 68, ${g.flashRed * 0.35})`;
        ctx.fillRect(0, 0, width, height);
      }

      // D. Dust Puffs behind running paws
      for (const d of g.dustPuffs) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.7})`;
        ctx.fill();
        ctx.restore();
      }

      // E. Draw Floating Items & Hazards using Vector Lucide Icons
      for (const it of g.items) {
        const bob = Math.sin(now / 200 + it.bobOffset) * 4;
        const itemY = it.y + bob;

        ctx.save();
        ctx.translate(it.x, itemY);

        ctx.beginPath();
        ctx.arc(0, 0, it.size / 2, 0, Math.PI * 2);

        if (it.data.isHazard) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
          ctx.shadowColor = it.data.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = it.data.color;
          ctx.stroke();
        } else if (it.data.isPowerUp) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.shadowColor = it.data.color;
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = it.data.color;
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
          ctx.shadowColor = it.data.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = it.data.color;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
        const iconImg = g.iconImages[it.data.key];
        if (iconImg && iconImg.complete) {
          const iconSize = Math.floor(it.size * 0.6);
          ctx.drawImage(iconImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        }

        ctx.restore();
      }

      // F. Draw Player Companion Pet
      const p = g.player;
      const petImg = g.petImages[selectedPet.id];

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

      if (p.isSliding) {
        ctx.scale(1.2, 0.6);
      } else if (!p.isGrounded) {
        const rot = Math.min(0.25, Math.max(-0.25, p.vy * 0.02));
        ctx.rotate(rot);
      } else {
        const runBob = Math.sin(now / 70) * 2;
        ctx.translate(0, runBob);
      }

      if (g.hasShield) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 44, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
        ctx.fill();
        ctx.restore();
      }

      if (petImg && petImg.complete) {
        ctx.drawImage(petImg, -p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.fillStyle = selectedPet.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // G. Particles
      for (const pt of g.particles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fill();
        ctx.restore();
      }

      // H. Floating Badges
      for (const ft of g.floatingTexts) {
        ctx.save();
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = ft.color;
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();

      g.animId = requestAnimationFrame(gameLoop);
    };

    gRef.current.animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(gRef.current.animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [selectedPet, checkCompanionUnlocks]);

  const getRank = (finalScore) => {
    if (finalScore >= 1200)
      return { letter: "S", title: "NIRVANA MASTER", color: "text-amber-500", bg: "bg-amber-100 border-amber-300" };
    if (finalScore >= 700)
      return { letter: "A", title: "ZEN ARCHITECT", color: "text-emerald-600", bg: "bg-emerald-100 border-emerald-300" };
    if (finalScore >= 350)
      return { letter: "B", title: "MINDFUL CODER", color: "text-sky-600", bg: "bg-sky-100 border-sky-300" };
    return { letter: "C", title: "DEEP BREATHER", color: "text-slate-600", bg: "bg-slate-100 border-slate-300" };
  };

  const rank = getRank(score);

  return (
    <div
      onClick={triggerJump}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none cursor-pointer flex flex-col justify-between"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Unlock Celebration Toast */}
      {unlockToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-xl border-2 border-emerald-300 font-bold text-sm flex items-center gap-2 animate-bounce">
          <Award className="w-5 h-5 text-amber-300" />
          <span>{unlockToast}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP PRODUCTION HUD
         ========================================================================= */}
      <header
        onClick={(e) => e.stopPropagation()}
        className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-auto"
      >
        {/* Left: Sanctuary Return + Mode Toggle + Time of Day */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            to="/dashboard"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sanctuary</span>
          </Link>

          {/* Mode Switcher: Arcade vs Zen */}
          <div className="flex items-center bg-white/90 backdrop-blur-md border border-white/80 p-0.5 rounded-2xl shadow-xs text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setGameMode("arcade");
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                gameMode === "arcade"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ARCADE
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playSuccess();
                setGameMode("zen");
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                gameMode === "zen"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5" />
              <span>ZEN</span>
            </button>
          </div>

          {/* Dynamic Sky Shift Indicator */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-white/80 px-2.5 py-1.5 rounded-2xl text-[11px] font-bold text-slate-600">
            {timeOfDay === "morning" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {timeOfDay === "sunset" && <Sunset className="w-3.5 h-3.5 text-orange-500" />}
            {timeOfDay === "night" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="capitalize">{timeOfDay}</span>
          </div>
        </div>

        {/* Center: Active Multiplier & Power-Ups */}
        <div className="flex items-center gap-2">
          {combo >= 5 && (
            <div className="flex items-center gap-1.5 bg-amber-500/90 text-white backdrop-blur-md border border-amber-300 shadow-sm px-3 py-1.5 rounded-2xl text-xs font-black font-mono animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              <span>{combo >= 20 ? "3.0x NIRVANA" : combo >= 10 ? "2.0x SUPER" : "1.5x ZEN"}</span>
            </div>
          )}

          {activeShield && (
            <div className="flex items-center gap-1 bg-sky-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xs animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>SHIELD</span>
            </div>
          )}

          {magnetTimer > 0 && (
            <div className="flex items-center gap-1 bg-purple-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xs">
              <Magnet className="w-3.5 h-3.5" />
              <span>{magnetTimer}s</span>
            </div>
          )}

          {coffeeTimer > 0 && (
            <div className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>2X {coffeeTimer}s</span>
            </div>
          )}
        </div>

        {/* Right: Hearts / Zen, Points, Leaderboard, Audio */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {gameMode === "arcade" ? (
            <div
              className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-white/80 shadow-xs px-3 py-1.5 rounded-2xl"
              title={`${lives} of ${MAX_LIVES} Hearts`}
            >
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-transform ${
                    i < lives
                      ? "fill-rose-500 text-rose-500 scale-105"
                      : "fill-slate-300 text-slate-300 scale-90"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-2xl text-xs font-bold font-mono">
              <InfinityIcon className="w-4 h-4 text-teal-600" />
              <span>PEACE FLOW</span>
            </div>
          )}

          {/* Points */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-white/80 shadow-xs px-3.5 py-1.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden sm:inline">
              Points
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-800">
              {score}
            </span>
          </div>

          {/* Leaderboard Trophy Button */}
          <button
            type="button"
            onClick={() => setShowLeaderboard(true)}
            title="Hall of Fame Leaderboard"
            className="p-2 rounded-2xl bg-white/90 hover:bg-white border border-white/80 shadow-xs text-amber-600 hover:text-amber-700 transition-all cursor-pointer flex items-center gap-1"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black font-mono hidden sm:inline">{highScore}</span>
          </button>

          {/* Lo-Fi Ambient BGM Toggle */}
          <button
            type="button"
            onClick={handleToggleBgm}
            title={bgmActive ? "Mute Lo-Fi Ambient Music (B)" : "Play Lo-Fi Ambient Music (B)"}
            className={`p-2 rounded-2xl border shadow-xs transition-all cursor-pointer ${
              bgmActive
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white/90 border-white/80 text-slate-400"
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* SFX Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={muted ? "Unmute Sound FX (M)" : "Mute Sound FX (M)"}
            className="p-2 rounded-2xl bg-white/90 hover:bg-white border border-white/80 shadow-xs text-slate-600 hover:text-emerald-700 transition-all cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Pause */}
          <button
            type="button"
            onClick={togglePause}
            title={isPaused ? "Resume Game (P)" : "Pause Game (P)"}
            className="p-2 rounded-2xl bg-white/90 hover:bg-white border border-white/80 shadow-xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. BOTTOM TOOLBAR & PET SELECTOR
         ========================================================================= */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className="relative z-30 w-full px-4 sm:px-8 pb-5 pt-3 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto"
      >
        <div className="bg-white/90 backdrop-blur-md border border-white/80 shadow-xs px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 text-[10px]">
              SPACE / TAP
            </span>
            <span>Jump &amp; Double Jump</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 text-[10px]">
              DOWN / S
            </span>
            <span>Duck &amp; Slide</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={() => setShowHowTo(!showHowTo)}
            className="hidden sm:flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
        </div>

        {/* Companion Selector with Unlock status */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-white/80 shadow-xs p-1.5 rounded-2xl max-w-full overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 hidden sm:block">
            Pet:
          </span>
          {PETS.map((pet) => {
            const isUnlocked = !pet.locked || unlockedPets.includes(pet.id);
            const isSelected = selectedPet.id === pet.id;

            return (
              <button
                key={pet.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playPop(pet.soundFreq);
                    setSelectedPet(pet);
                  }
                }}
                title={
                  isUnlocked
                    ? `${pet.name} — ${pet.perk}`
                    : `Locked: ${pet.unlockCondition}`
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs cursor-pointer"
                    : isUnlocked
                    ? "text-slate-700 hover:bg-slate-100 cursor-pointer"
                    : "opacity-45 bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <img src={pet.img} alt={pet.name} className="w-5 h-5 object-contain" />
                <span>{pet.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </footer>

      {/* Mobile Touch Action Controls (Left Slide, Right Jump) */}
      <div className="md:hidden fixed bottom-24 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            triggerSlide(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            triggerSlide(false);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            triggerSlide(true);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            triggerSlide(false);
          }}
          className="pointer-events-auto w-16 h-16 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-white/40 text-white font-mono font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-95 active:bg-slate-900/80 cursor-pointer gap-0.5"
        >
          <ArrowDown className="w-5 h-5 text-white" />
          <span className="text-[9px] tracking-wider">SLIDE</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            triggerJump();
          }}
          onClick={(e) => {
            e.stopPropagation();
            triggerJump();
          }}
          className="pointer-events-auto w-18 h-18 rounded-full bg-emerald-600/85 backdrop-blur-md border-2 border-emerald-300 text-white font-mono font-bold text-xs flex flex-col items-center justify-center shadow-xl active:scale-95 active:bg-emerald-600 cursor-pointer gap-0.5"
        >
          <ArrowUp className="w-6 h-6 text-white" />
          <span className="text-[9px] tracking-wider">JUMP</span>
        </button>
      </div>

      {/* =========================================================================
          3. HOW TO PLAY & PERKS MODAL
         ========================================================================= */}
      {showHowTo && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Meadow Sprint Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHowTo(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Flower2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calming Orbs (+Points &amp; Multipliers)</span>
                </h4>
                <p>
                  Gather flowers, drops, tea and sparkles to increase your score and build <strong>Zen Combos</strong> (up to 3.0x multiplier!).
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl space-y-1.5">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                  <CloudLightning className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Burnout Hazards (-Points &amp; -1 Heart in Arcade)</span>
                </h4>
                <p>
                  <strong>Jump</strong> over ground flames and thorns. <strong>Duck/Slide</strong> under high-flying storm clouds!
                </p>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-200/60 rounded-xl space-y-1.5">
                <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Power-Ups</span>
                </h4>
                <p>
                  <strong>Zen Shield</strong> blocks 1 hit, <strong>Magnet</strong> draws orbs towards you, <strong>Espresso</strong> doubles all points!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHowTo(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Ready to Sprint!
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. LEADERBOARD / HALL OF FAME MODAL
         ========================================================================= */}
      {showLeaderboard && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">Hall of Fame (Top 5)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboard(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">
                No runs recorded yet! Complete an Arcade sprint to etch your name in the Hall of Fame.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black font-mono text-sm text-slate-400">
                        #{idx + 1}
                      </span>
                      {item.petImg && (
                        <img src={item.petImg} alt={item.pet} className="w-7 h-7 object-contain" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{item.pet}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.distance}m · {item.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-800 block">
                        {item.score}
                      </span>
                      <span className="text-[10px] text-amber-600 font-mono font-bold">
                        {item.combo}x Combo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowLeaderboard(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. PAUSE MENU OVERLAY
         ========================================================================= */}
      {isPaused && !isGameOver && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Pause className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 font-display">GAME PAUSED</h3>
              <p className="text-xs text-slate-500">Catch your breath, roll your shoulders, and sip some water.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={togglePause}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume (P)</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Run</span>
              </button>

              <Link
                to="/dashboard"
                onClick={() => sounds.playClick()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-slate-500 hover:text-slate-800 font-semibold text-xs transition-all block"
              >
                <span>Return to Sanctuary</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. PRODUCTION LEVEL GAME OVER SCREEN
         ========================================================================= */}
      {isGameOver && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Rank Badge Header */}
            <div className="flex items-center justify-center gap-3">
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-3xl font-mono border-2 shadow-sm ${rank.bg} ${rank.color}`}
              >
                {rank.letter}
              </div>
              <div className="text-left space-y-0.5">
                <span className={`text-[11px] font-bold tracking-widest uppercase font-mono ${rank.color}`}>
                  {rank.title}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                  RUN COMPLETE
                </h2>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-rose-500 bg-rose-50 border border-rose-200/80 rounded-2xl py-2 px-3 text-xs font-bold font-mono">
              <HeartOff className="w-4 h-4 text-rose-500" />
              <span>OUT OF HEARTS</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Even in crunch sprints, every rest counts. You stayed mindful and responsive!
            </p>

            {/* Production Stats Matrix */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    FINAL SCORE
                  </span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {score}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    BEST HIGH SCORE
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-700 flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    {highScore}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-center">
                <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-mono block">ORBS</span>
                  <span className="font-bold font-mono text-xs text-slate-800">{stats.orbsCaught}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-mono block">DODGED</span>
                  <span className="font-bold font-mono text-xs text-slate-800">{stats.hazardsDodged}</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-mono block">MAX COMBO</span>
                  <span className="font-bold font-mono text-xs text-amber-600 font-mono">{stats.maxCombo}x</span>
                </div>
              </div>
            </div>

            {/* Log to Sanctuary Button */}
            <button
              type="button"
              onClick={handleLogToSanctuary}
              disabled={loggedToSanctuary}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                loggedToSanctuary
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90"
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {loggedToSanctuary ? "Session Logged to Sanctuary! 🌿" : "Log 5-Min Recovery to Sanctuary"}
              </span>
            </button>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (Space)</span>
              </button>

              <Link
                to="/dashboard"
                onClick={() => sounds.playClick()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sanctuary</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnxietyCalmGame;
