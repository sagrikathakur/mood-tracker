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
      <Navbar />

      <main className="flex-1 w-full">
        <MeadowHero />

        <div id="features">
          <PatternShowcase />
        </div>

        <PatternControlGrid />

        <div id="about-story">
          <AboutSagrikaStory />
        </div>

        <div id="practices">
          <PatternChecklist />
        </div>

        <PatternPrivateCards />

        <div id="faq">
          <PatternFAQ />
        </div>

        <PatternLimeCTA />
      </main>

      <PatternFooter />
    </div>
  );
};

export default Home;
