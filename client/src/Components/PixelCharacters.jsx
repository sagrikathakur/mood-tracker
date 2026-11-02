import React from "react";
import { motion } from "../utils/motion";

/**
 * PixelCharacters: Animated 8-bit SVG pixel art companions.
 * Features live SVG sub-layer animations:
 * - Fox tail wagging & ear twitching
 * - Owl floating & realistic eye blinking
 * - Penguin waddling from side to side
 * - Frog hopping with squash & stretch
 * - Cloud drifting
 */

// 1. Pixel Fox (Tail wagging, ear twitching, breathing)
export const PixelFox = ({ className = "w-16 h-16", animated = true, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.12, y: -4 }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={`inline-block select-none ${animated ? "animate-pet-breathe" : ""} cursor-pointer`}
  >
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ shapeRendering: "crispEdges" }}
    >
      {/* Animated Ears */}
      <g className={animated ? "animate-pet-ears" : ""}>
        <rect x="5" y="2" width="4" height="4" fill="#E26527" />
        <rect x="6" y="3" width="2" height="2" fill="#FFFFFF" />
        <rect x="15" y="2" width="4" height="4" fill="#E26527" />
        <rect x="16" y="3" width="2" height="2" fill="#FFFFFF" />
      </g>

      {/* Head Base */}
      <rect x="5" y="6" width="14" height="9" fill="#E26527" />
      <rect x="4" y="8" width="16" height="5" fill="#E26527" />

      {/* Cheeks / White Mask */}
      <rect x="4" y="10" width="4" height="5" fill="#FFFFFF" />
      <rect x="16" y="10" width="4" height="5" fill="#FFFFFF" />
      <rect x="8" y="12" width="8" height="3" fill="#FFFFFF" />

      {/* Eyes */}
      <rect x="8" y="8" width="2" height="3" fill="#1C1917" />
      <rect x="14" y="8" width="2" height="3" fill="#1C1917" />

      {/* Nose */}
      <rect x="11" y="11" width="2" height="2" fill="#1C1917" />

      {/* Body */}
      <rect x="7" y="15" width="10" height="6" fill="#E26527" />
      <rect x="9" y="15" width="6" height="5" fill="#FFFFFF" />

      {/* Paws */}
      <rect x="7" y="21" width="3" height="2" fill="#1C1917" />
      <rect x="14" y="21" width="3" height="2" fill="#1C1917" />

      {/* Animated Wagging Tail */}
      <g className={animated ? "animate-pet-tail" : ""}>
        <rect x="16" y="17" width="4" height="4" fill="#E26527" />
        <rect x="18" y="16" width="3" height="3" fill="#FFFFFF" />
      </g>
    </svg>
  </motion.div>
);

// 2. Pixel Owl (Floating, blinking eyes, flapping wings)
export const PixelOwl = ({ className = "w-16 h-16", animated = true, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.12, y: -4 }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={`inline-block select-none ${animated ? "animate-pet-float" : ""} cursor-pointer`}
  >
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ shapeRendering: "crispEdges" }}
    >
      {/* Ear Tufts */}
      <rect x="5" y="2" width="3" height="3" fill="#2E8652" />
      <rect x="16" y="2" width="3" height="3" fill="#2E8652" />

      {/* Head & Body */}
      <rect x="5" y="4" width="14" height="15" fill="#38A169" />
      <rect x="4" y="6" width="16" height="11" fill="#38A169" />

      {/* Eyeglasses Rings */}
      <rect x="6" y="6" width="5" height="5" fill="#FFFFFF" />
      <rect x="13" y="6" width="5" height="5" fill="#FFFFFF" />

      {/* Animated Blinking Pupils */}
      <g className={animated ? "animate-pet-blink" : ""}>
        <rect x="8" y="8" width="2" height="2" fill="#1C1917" />
        <rect x="14" y="8" width="2" height="2" fill="#1C1917" />
      </g>

      {/* Beak */}
      <rect x="11" y="10" width="2" height="2" fill="#F59E0B" />
      <rect x="11" y="12" width="2" height="1" fill="#D97706" />

      {/* Belly Feathers */}
      <rect x="8" y="13" width="8" height="5" fill="#E6F4EA" />
      <rect x="10" y="14" width="1" height="1" fill="#38A169" />
      <rect x="13" y="14" width="1" height="1" fill="#38A169" />
      <rect x="11" y="16" width="2" height="1" fill="#38A169" />

      {/* Animated Wings */}
      <g className={animated ? "animate-pet-wings" : ""}>
        <rect x="3" y="9" width="2" height="7" fill="#276749" />
        <rect x="19" y="9" width="2" height="7" fill="#276749" />
      </g>

      {/* Feet */}
      <rect x="7" y="19" width="3" height="2" fill="#F59E0B" />
      <rect x="14" y="19" width="3" height="2" fill="#F59E0B" />
    </svg>
  </motion.div>
);

// 3. Pixel Penguin (Waddling sway)
export const PixelPenguin = ({ className = "w-12 h-12", animated = true }) => (
  <motion.div
    whileHover={{ scale: 1.15, y: -3 }}
    className={`inline-block select-none ${animated ? "animate-pet-waddle" : ""} cursor-pointer`}
  >
    <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
      <rect x="7" y="4" width="10" height="15" fill="#1F2937" />
      <rect x="6" y="8" width="12" height="9" fill="#1F2937" />
      <rect x="9" y="7" width="2" height="3" fill="#FFFFFF" />
      <rect x="13" y="7" width="2" height="3" fill="#FFFFFF" />
      {/* Blinking eyes */}
      <g className={animated ? "animate-pet-blink" : ""}>
        <rect x="10" y="8" width="1" height="2" fill="#111827" />
        <rect x="14" y="8" width="1" height="2" fill="#111827" />
      </g>
      <rect x="11" y="10" width="2" height="2" fill="#F59E0B" />
      <rect x="9" y="12" width="6" height="6" fill="#F9FAFB" />
      <rect x="7" y="19" width="3" height="2" fill="#F59E0B" />
      <rect x="14" y="19" width="3" height="2" fill="#F59E0B" />
    </svg>
  </motion.div>
);

// 4. Pixel Frog (Hopping animation)
export const PixelFrog = ({ className = "w-12 h-12", animated = true }) => (
  <motion.div
    whileHover={{ scale: 1.15, y: -4 }}
    className={`inline-block select-none ${animated ? "animate-pet-hop" : ""} cursor-pointer`}
  >
    <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
      <rect x="5" y="4" width="4" height="4" fill="#22C55E" />
      <rect x="15" y="4" width="4" height="4" fill="#22C55E" />
      <rect x="6" y="5" width="2" height="2" fill="#FFFFFF" />
      <rect x="16" y="5" width="2" height="2" fill="#FFFFFF" />
      <g className={animated ? "animate-pet-blink" : ""}>
        <rect x="7" y="6" width="1" height="1" fill="#052E16" />
        <rect x="17" y="6" width="1" height="1" fill="#052E16" />
      </g>
      <rect x="4" y="8" width="16" height="9" fill="#16A34A" />
      <rect x="8" y="12" width="8" height="2" fill="#14532D" />
      <rect x="4" y="17" width="4" height="3" fill="#15803D" />
      <rect x="16" y="17" width="4" height="3" fill="#15803D" />
    </svg>
  </motion.div>
);

// 5. Pixel Cat (Twitching ears & tail)
export const PixelCat = ({ className = "w-12 h-12", animated = true }) => (
  <motion.div
    whileHover={{ scale: 1.15, y: -3 }}
    className={`inline-block select-none ${animated ? "animate-pet-breathe" : ""} cursor-pointer`}
  >
    <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
      <g className={animated ? "animate-pet-ears" : ""}>
        <rect x="5" y="3" width="3" height="3" fill="#D97706" />
        <rect x="16" y="3" width="3" height="3" fill="#D97706" />
      </g>
      <rect x="6" y="5" width="12" height="12" fill="#F59E0B" />
      <g className={animated ? "animate-pet-blink" : ""}>
        <rect x="8" y="8" width="2" height="2" fill="#10B981" />
        <rect x="14" y="8" width="2" height="2" fill="#10B981" />
      </g>
      <rect x="11" y="11" width="2" height="1" fill="#EC4899" />
      <rect x="7" y="17" width="10" height="3" fill="#D97706" />
    </svg>
  </motion.div>
);

// 6. Pixel Bear (Cozy breathing)
export const PixelBear = ({ className = "w-12 h-12", animated = true }) => (
  <motion.div
    whileHover={{ scale: 1.15, y: -3 }}
    className={`inline-block select-none ${animated ? "animate-pet-breathe" : ""} cursor-pointer`}
  >
    <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
      <rect x="5" y="3" width="3" height="3" fill="#8B5A2B" />
      <rect x="16" y="3" width="3" height="3" fill="#8B5A2B" />
      <rect x="5" y="5" width="14" height="13" fill="#9C6B37" />
      <g className={animated ? "animate-pet-blink" : ""}>
        <rect x="8" y="8" width="2" height="2" fill="#1C1917" />
        <rect x="14" y="8" width="2" height="2" fill="#1C1917" />
      </g>
      <rect x="9" y="11" width="6" height="4" fill="#D2B48C" />
      <rect x="11" y="11" width="2" height="2" fill="#1C1917" />
      <rect x="6" y="18" width="4" height="3" fill="#8B5A2B" />
      <rect x="14" y="18" width="4" height="3" fill="#8B5A2B" />
    </svg>
  </motion.div>
);

// 7. Pixel Pine Tree (Slight wind sway)
export const PixelPineTree = ({ className = "w-10 h-16", shadow = true }) => (
  <svg viewBox="0 0 20 32" className={className} style={{ shapeRendering: "crispEdges" }}>
    {shadow && <rect x="3" y="29" width="14" height="2" fill="#6AAF64" opacity="0.6" />}
    <rect x="9" y="24" width="2" height="6" fill="#6B4226" />
    <rect x="8" y="28" width="4" height="2" fill="#52321C" />
    <rect x="3" y="19" width="14" height="5" fill="#1E4D2B" />
    <rect x="5" y="17" width="10" height="2" fill="#28693B" />
    <rect x="5" y="12" width="10" height="5" fill="#235D33" />
    <rect x="7" y="10" width="6" height="2" fill="#32824A" />
    <rect x="7" y="6" width="6" height="4" fill="#28693B" />
    <rect x="9" y="2" width="2" height="4" fill="#3FA35D" />
    <rect x="8" y="4" width="4" height="2" fill="#3FA35D" />
  </svg>
);

// 8. Pixel Cloud (Continuous drift)
export const PixelCloud = ({ className = "w-24 h-12", speed = "slow" }) => (
  <div className={speed === "fast" ? "animate-cloud-drift-fast" : "animate-cloud-drift-slow"}>
    <svg viewBox="0 0 48 24" className={className} style={{ shapeRendering: "crispEdges" }}>
      <rect x="12" y="4" width="24" height="4" fill="#FFFFFF" opacity="0.95" />
      <rect x="8" y="8" width="32" height="6" fill="#FFFFFF" opacity="0.95" />
      <rect x="4" y="14" width="40" height="6" fill="#FFFFFF" opacity="0.95" />
      <rect x="8" y="20" width="32" height="2" fill="#E2F2E4" opacity="0.75" />
    </svg>
  </div>
);

// 9. Pixel Blade of Grass
export const PixelGrassTuft = ({ className = "w-4 h-4 text-emerald-800" }) => (
  <svg viewBox="0 0 12 12" className={className} style={{ shapeRendering: "crispEdges" }}>
    <rect x="2" y="4" width="2" height="6" fill="currentColor" />
    <rect x="5" y="2" width="2" height="8" fill="currentColor" />
    <rect x="8" y="5" width="2" height="5" fill="currentColor" />
  </svg>
);
