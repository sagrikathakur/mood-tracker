import React from "react";

// Pixel art SVG rendered with crispEdges for authentic 8-bit aesthetic

export const PixelOwl = ({ className = "w-16 h-16", mood = "happy" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={`${className} select-none transition-transform hover:scale-110`}
  >
    {/* Body base (Sage Green) */}
    <rect x="5" y="4" width="14" height="16" fill="#4ADE80" />
    <rect x="7" y="2" width="10" height="2" fill="#4ADE80" />
    <rect x="4" y="6" width="1" height="12" fill="#4ADE80" />
    <rect x="19" y="6" width="1" height="12" fill="#4ADE80" />

    {/* Outline (Hard Black #18181B) */}
    <rect x="7" y="1" width="10" height="1" fill="#18181B" />
    <rect x="4" y="2" width="3" height="1" fill="#18181B" />
    <rect x="17" y="2" width="3" height="1" fill="#18181B" />
    <rect x="3" y="3" width="1" height="3" fill="#18181B" />
    <rect x="20" y="3" width="1" height="3" fill="#18181B" />
    <rect x="3" y="6" width="1" height="12" fill="#18181B" />
    <rect x="20" y="6" width="1" height="12" fill="#18181B" />
    <rect x="4" y="18" width="1" height="2" fill="#18181B" />
    <rect x="19" y="18" width="1" height="2" fill="#18181B" />
    <rect x="5" y="20" width="14" height="1" fill="#18181B" />

    {/* Ear Tufts (Yellow/Ochre) */}
    <rect x="4" y="3" width="2" height="2" fill="#FACC15" />
    <rect x="18" y="3" width="2" height="2" fill="#FACC15" />

    {/* Belly (Cream #FFFBEB) */}
    <rect x="8" y="11" width="8" height="8" fill="#FFFBEB" />
    <rect x="9" y="10" width="6" height="1" fill="#FFFBEB" />
    {/* Belly feather markings */}
    <rect x="10" y="13" width="1" height="1" fill="#CA8A04" />
    <rect x="13" y="13" width="1" height="1" fill="#CA8A04" />
    <rect x="11" y="15" width="2" height="1" fill="#CA8A04" />

    {/* Big Eyes */}
    <rect x="6" y="6" width="4" height="4" fill="#FFFFFF" />
    <rect x="14" y="6" width="4" height="4" fill="#FFFFFF" />
    <rect x="6" y="5" width="4" height="1" fill="#18181B" />
    <rect x="14" y="5" width="4" height="1" fill="#18181B" />

    {/* Pupils (Black with highlight) */}
    {mood === "happy" ? (
      <>
        <rect x="8" y="7" width="2" height="3" fill="#18181B" />
        <rect x="14" y="7" width="2" height="3" fill="#18181B" />
        <rect x="8" y="7" width="1" height="1" fill="#FFFFFF" />
        <rect x="14" y="7" width="1" height="1" fill="#FFFFFF" />
      </>
    ) : (
      <>
        <rect x="7" y="7" width="2" height="2" fill="#18181B" />
        <rect x="15" y="7" width="2" height="2" fill="#18181B" />
      </>
    )}

    {/* Cute Pink Cheeks */}
    <rect x="5" y="9" width="1" height="1" fill="#FB7185" />
    <rect x="18" y="9" width="1" height="1" fill="#FB7185" />

    {/* Beak */}
    <rect x="11" y="8" width="2" height="2" fill="#EA580C" />
    <rect x="11" y="10" width="2" height="1" fill="#C2410C" />

    {/* Feet (Orange) */}
    <rect x="8" y="21" width="3" height="1" fill="#EA580C" />
    <rect x="13" y="21" width="3" height="1" fill="#EA580C" />
  </svg>
);

export const PixelHeart = ({ className = "w-5 h-5", fill = "#FB7185" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={className}
  >
    <rect x="2" y="3" width="4" height="6" fill={fill} />
    <rect x="10" y="3" width="4" height="6" fill={fill} />
    <rect x="3" y="2" width="2" height="1" fill={fill} />
    <rect x="11" y="2" width="2" height="1" fill={fill} />
    <rect x="1" y="4" width="14" height="4" fill={fill} />
    <rect x="2" y="8" width="12" height="2" fill={fill} />
    <rect x="4" y="10" width="8" height="2" fill={fill} />
    <rect x="6" y="12" width="4" height="2" fill={fill} />
    <rect x="7" y="14" width="2" height="1" fill={fill} />
    {/* Highlight */}
    <rect x="3" y="4" width="1" height="2" fill="#FFFFFF" opacity="0.6" />
    {/* Outline */}
    <path
      d="M3 1h2v1H3V1zm8 0h2v1h-2V1zM1 3h2v1H1V3zm12 0h2v1h-2V3zM0 4h1v5H0V4zm15 0h1v5h-1V4zM1 9h1v1H1V9zm13 0h1v1h-1V9zm-2 2h2v1h-2v-1zM2 11h2v1H2v-1zm2 1h2v1H4v-1zm6 0h2v1h-2v-1zm-4 2h4v1H6v-1z"
      fill="#18181B"
    />
  </svg>
);

export const PixelFlame = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={className}
  >
    <rect x="5" y="2" width="2" height="2" fill="#F97316" />
    <rect x="4" y="4" width="6" height="9" fill="#EA580C" />
    <rect x="2" y="7" width="12" height="6" fill="#F97316" />
    <rect x="6" y="8" width="4" height="5" fill="#FDE047" />
    <rect x="7" y="10" width="2" height="3" fill="#FFFFFF" />
    {/* Outline */}
    <path
      d="M6 1h1v1H6V1zm2 1h1v2H8V2zM4 4h1v3H4V4zm7 1h1v2h-1V5zM2 7h1v5H2V7zm11 0h1v5h-1V7zM3 12h1v2H3v-2zm9 0h1v2h-1v-2zm-7 2h6v1H5v-1z"
      fill="#18181B"
    />
  </svg>
);

export const PixelStar = ({ className = "w-5 h-5", fill = "#FACC15" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="crispEdges"
    className={className}
  >
    <rect x="7" y="1" width="2" height="14" fill={fill} />
    <rect x="1" y="7" width="14" height="2" fill={fill} />
    <rect x="4" y="4" width="8" height="8" fill={fill} />
    <rect x="6" y="3" width="4" height="10" fill={fill} />
    <rect x="3" y="6" width="10" height="4" fill={fill} />
    {/* Eyes */}
    <rect x="5" y="7" width="1" height="2" fill="#18181B" />
    <rect x="10" y="7" width="1" height="2" fill="#18181B" />
    <rect x="7" y="9" width="2" height="1" fill="#18181B" />
  </svg>
);

// Dynamic Interactive Pixel Emotion Face based on 1-10 slider
export const PixelEmotionFace = ({ score = 7, className = "w-14 h-14" }) => {
  let faceColor = "#4ADE80"; // green
  let mouthType = "smile";

  if (score <= 3) {
    faceColor = "#FB7185"; // rose
    mouthType = "sad";
  } else if (score <= 6) {
    faceColor = "#FACC15"; // yellow
    mouthType = "neutral";
  } else {
    faceColor = "#4ADE80"; // green
    mouthType = "smile";
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`${className} transition-transform duration-200 hover:rotate-6`}
    >
      {/* Face Box */}
      <rect x="3" y="3" width="14" height="14" fill={faceColor} />
      <rect x="2" y="5" width="16" height="10" fill={faceColor} />
      <rect x="5" y="2" width="10" height="16" fill={faceColor} />

      {/* Pixel Outline */}
      <rect x="5" y="1" width="10" height="1" fill="#18181B" />
      <rect x="3" y="2" width="2" height="1" fill="#18181B" />
      <rect x="15" y="2" width="2" height="1" fill="#18181B" />
      <rect x="2" y="3" width="1" height="2" fill="#18181B" />
      <rect x="17" y="3" width="1" height="2" fill="#18181B" />
      <rect x="1" y="5" width="1" height="10" fill="#18181B" />
      <rect x="18" y="5" width="1" height="10" fill="#18181B" />
      <rect x="2" y="15" width="1" height="2" fill="#18181B" />
      <rect x="17" y="15" width="1" height="2" fill="#18181B" />
      <rect x="3" y="17" width="2" height="1" fill="#18181B" />
      <rect x="15" y="17" width="2" height="1" fill="#18181B" />
      <rect x="5" y="18" width="10" height="1" fill="#18181B" />

      {/* Eyes */}
      {score >= 8 ? (
        // Star / Happy Eyes
        <>
          <rect x="5" y="6" width="3" height="1" fill="#18181B" />
          <rect x="6" y="5" width="1" height="3" fill="#18181B" />
          <rect x="12" y="6" width="3" height="1" fill="#18181B" />
          <rect x="13" y="5" width="1" height="3" fill="#18181B" />
        </>
      ) : score <= 3 ? (
        // Pouting / Teardrop Eyes
        <>
          <rect x="5" y="7" width="3" height="2" fill="#18181B" />
          <rect x="12" y="7" width="3" height="2" fill="#18181B" />
          <rect x="4" y="10" width="1" height="2" fill="#38BDF8" />
        </>
      ) : (
        // Standard Eyes
        <>
          <rect x="5" y="6" width="2" height="3" fill="#18181B" />
          <rect x="13" y="6" width="2" height="3" fill="#18181B" />
          <rect x="5" y="6" width="1" height="1" fill="#FFFFFF" />
          <rect x="13" y="6" width="1" height="1" fill="#FFFFFF" />
        </>
      )}

      {/* Cheeks */}
      <rect x="3" y="10" width="2" height="1" fill="#F43F5E" opacity="0.7" />
      <rect x="15" y="10" width="2" height="1" fill="#F43F5E" opacity="0.7" />

      {/* Mouth */}
      {mouthType === "smile" && (
        <>
          <rect x="7" y="13" width="6" height="1" fill="#18181B" />
          <rect x="6" y="12" width="1" height="1" fill="#18181B" />
          <rect x="13" y="12" width="1" height="1" fill="#18181B" />
        </>
      )}
      {mouthType === "neutral" && (
        <rect x="7" y="13" width="6" height="1" fill="#18181B" />
      )}
      {mouthType === "sad" && (
        <>
          <rect x="7" y="12" width="6" height="1" fill="#18181B" />
          <rect x="6" y="13" width="1" height="1" fill="#18181B" />
          <rect x="13" y="13" width="1" height="1" fill="#18181B" />
        </>
      )}
    </svg>
  );
};

