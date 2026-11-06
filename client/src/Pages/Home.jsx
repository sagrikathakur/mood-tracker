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
        {/* 2. 100vh Pixel Meadow Hero */}
        <MeadowHero />

        {/* 3. Dark Section: "It doesn't judge. It listens." Interactive Simulator Card */}
        <div id="features">
          <PatternShowcase />
        </div>

        {/* 4. Light Cream Section: "You're in charge. Without hovering." */}
        <PatternControlGrid />

        {/* 5. Creator & Mission Story (Calm Me by Developer & Designer Sagrika) */}
        <div id="about-story">
          <AboutSagrikaStory />
        </div>

        {/* 6. Sustainable Practices & Checklist Cards */}
        <div id="practices">
          <PatternChecklist />
        </div>

        {/* 7. Private by Design Cards */}
        <PatternPrivateCards />

        {/* 8. FAQ Section */}
        <div id="faq">
          <PatternFAQ />
        </div>

        {/* 9. Lime High-Contrast CTA Banner */}
        <PatternLimeCTA />
      </main>

      {/* 10. Classic Multi-Column Footer */}
      <PatternFooter />
    </div>
  );
};

export default Home;
