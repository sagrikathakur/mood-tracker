import React from "react";

/**
 * PixelDither: Creates the exact authentic 8-bit checkerboard dithering
 * transition between sections seen in the reference video (Frames 00:02, 00:04, 00:11).
 */
export const PixelDither = ({
  topColor = "#98D88E",
  bottomColor = "#091b10",
  height = 24,
  reverse = false,
}) => {
  const cTop = reverse ? bottomColor : topColor;
  const cBot = reverse ? topColor : bottomColor;

  return (
    <div
      className="w-full overflow-hidden select-none pointer-events-none leading-none block -my-[1px] relative z-20"
      style={{ height: `${height}px`, backgroundColor: cTop }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 16"
        preserveAspectRatio="none"
        className="w-full h-full block"
        style={{ shapeRendering: "crispEdges" }}
      >
        {/* Row 1 (top): 25% bottomColor dots */}
        <rect x="0" y="0" width="2" height="4" fill={cBot} />
        <rect x="8" y="0" width="2" height="4" fill={cBot} />
        <rect x="16" y="0" width="2" height="4" fill={cBot} />
        <rect x="24" y="0" width="2" height="4" fill={cBot} />

        {/* Row 2: 50% checkerboard */}
        <rect x="0" y="4" width="4" height="4" fill={cBot} />
        <rect x="8" y="4" width="4" height="4" fill={cBot} />
        <rect x="16" y="4" width="4" height="4" fill={cBot} />
        <rect x="24" y="4" width="4" height="4" fill={cBot} />
        <rect x="4" y="8" width="4" height="4" fill={cBot} />
        <rect x="12" y="8" width="4" height="4" fill={cBot} />
        <rect x="20" y="8" width="4" height="4" fill={cBot} />
        <rect x="28" y="8" width="4" height="4" fill={cBot} />

        {/* Row 3: 75% bottomColor (25% topColor holes) */}
        <rect x="0" y="12" width="32" height="4" fill={cBot} />
        <rect x="4" y="12" width="2" height="4" fill={cTop} />
        <rect x="12" y="12" width="2" height="4" fill={cTop} />
        <rect x="20" y="12" width="2" height="4" fill={cTop} />
        <rect x="28" y="12" width="2" height="4" fill={cTop} />
      </svg>
    </div>
  );
};

export default PixelDither;

