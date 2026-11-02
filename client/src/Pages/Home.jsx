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
import { motion } from "../utils/motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      {/* 1. Transparent Full-Width Navbar */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 2. 100vh Pixel Meadow Hero (Interactive & Animated) */}
        <MeadowHero />

        {/* 3. Dark Section: "It doesn't judge. It listens." Interactive Simulator Card */}
        <div id="features">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65 }}
          >
            <PatternShowcase />
          </motion.div>
        </div>

        {/* 4. Light Cream Section: "You're in charge. Without hovering." */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65 }}
        >
          <PatternControlGrid />
        </motion.div>

        {/* 5. Creator & Mission Story (Calm Me by Developer & Designer Sagrika) */}
        <div id="about-story">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65 }}
          >
            <AboutSagrikaStory />
          </motion.div>
        </div>

        {/* 6. Sustainable Practices & Checklist Cards */}
        <div id="practices">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65 }}
          >
            <PatternChecklist />
          </motion.div>
        </div>

        {/* 7. Private by Design Cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65 }}
        >
          <PatternPrivateCards />
        </motion.div>

        {/* 8. FAQ Section */}
        <div id="faq">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65 }}
          >
            <PatternFAQ />
          </motion.div>
        </div>

        {/* 9. Lime High-Contrast CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <PatternLimeCTA />
        </motion.div>
      </main>

      {/* 10. Classic Multi-Column Footer */}
      <PatternFooter />
    </div>
  );
};

export default Home;
