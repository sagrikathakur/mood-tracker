import React from "react";
import Navbar from "../Components/Navbar";
import MeadowHero from "../Components/MeadowHero";
import PatternShowcase from "../Components/PatternShowcase";
import PatternControlGrid from "../Components/PatternControlGrid";
import AboutSagrikaStory from "../Components/AboutSagrikaStory";
import PatternChecklist from "../Components/PatternChecklist";
import PatternPrivateCards from "../Components/PatternPrivateCards";
import PatternFAQ from "../Components/PatternFAQ";
import PatternLimeCTA from "../Components/PatternLimeCTA";
import PatternFooter from "../Components/PatternFooter";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      {/* 1. Transparent Full-Width Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 2. 100vh Pixel Meadow Hero (Frame 00:00: Pixel Clouds, Trees, Fox & Owl, 4 Ticker Columns) */}
        <MeadowHero />

        {/* 3. Dark Section (Frame 00:01: "It doesn't judge. It listens.", Interactive Simulator Card) */}
        <div id="features">
          <PatternShowcase />
        </div>

        {/* 4. Dark Emerald Section (Frame 00:02 - 00:03: "You're in charge. Without hovering.", 2x2 Grid) */}
        <PatternControlGrid />

        {/* 5. Creator & Mission Story (Calm Me by Developer & Designer Sagrika) */}
        <AboutSagrikaStory />

        {/* 6. Cream Section (Frame 00:04: "Sustainable practices", 4 Checklist Cards with Green Checkmarks) */}
        <div id="practices">
          <PatternChecklist />
        </div>

        {/* 7. Cream Section (Frame 00:05 - 00:06: 4 Vertical Feature Cards, "Private by design") */}
        <PatternPrivateCards />

        {/* 8. Cream FAQ (Frame 00:07 - 00:08: "The things developers ask first", Numbered 01-08 Accordion) */}
        <PatternFAQ />

        {/* 9. Lime Green / Chartreuse High-Contrast CTA Banner (Frame 00:09 - 00:10: "Say hello to Calm Me.") */}
        <PatternLimeCTA />
      </main>

      {/* 10. Black Footer with Pixel Dither Top Border and Parade of Pixel Characters (Frame 00:11 - 00:12) */}
      <PatternFooter />
    </div>
  );
};

export default Home;
