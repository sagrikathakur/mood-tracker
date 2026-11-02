import React from "react";
import Navbar from "../Components/Navbar";
import SleekHero from "../Components/SleekHero";
import AboutCalmMe from "../Components/AboutCalmMe";
import SleekShowcase from "../Components/SleekShowcase";
import SleekFeatureGrid from "../Components/SleekFeatureGrid";
import SleekChecklist from "../Components/SleekChecklist";
import SleekPrivateGrid from "../Components/SleekPrivateGrid";
import SleekFAQ from "../Components/SleekFAQ";
import SleekCTA from "../Components/SleekCTA";
import SleekFooter from "../Components/SleekFooter";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Transparent Full-Width Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 2. 100vh Full Width Interactive Hero Section */}
        <SleekHero />

        {/* 3. About "Calm Me" & Designer/Developer Sagrika (Developer Burnout Tracker) */}
        <AboutCalmMe />

        {/* 4. Sleek Interactive Showcase ("It doesn't tell you how to feel. It listens.") */}
        <SleekShowcase />

        {/* 5. Sleek Feature Grid ("You're in charge. Without pressure.") */}
        <SleekFeatureGrid />

        {/* 6. Practice & Workflow Checklist */}
        <SleekChecklist />

        {/* 7. Private by Design Section */}
        <SleekPrivateGrid />

        {/* 8. Minimalist FAQ */}
        <SleekFAQ />

        {/* 9. Call to Action Banner ("Say hello to Calm Me.") */}
        <SleekCTA />
      </main>

      {/* 10. Sleek Modern Footer */}
      <SleekFooter />
    </div>
  );
};

export default Home;