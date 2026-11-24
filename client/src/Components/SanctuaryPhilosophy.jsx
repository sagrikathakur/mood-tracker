import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, EyeOff, ArrowRight } from "lucide-react";
import assets from "../assets/asset";
import { sounds } from "../utils/soundEffects";

export const SanctuaryPhilosophy = () => {
  return (
    <section className="w-full bg-[#FAF8F5] text-slate-900 py-20 sm:py-28 px-4 sm:px-8 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-stone-200 bg-white p-2 shadow-2xs">
              <img
                src={assets.pic_2}
                alt="Sanctuary"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200/60">
              <Heart className="w-3.5 h-3.5 text-emerald-600" />
              The CalmTREE Philosophy
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              An honest sanctuary, created for{" "}
              <span className="italic text-emerald-800">unfiltered peace.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Wellness tools shouldn&apos;t feel like corporate performance trackers, nor should they monetize your vulnerable moments. CalmTREE was designed from day one to remain 100% private, anonymous, and free from toxic streak pressure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 font-serif">Client-Side Privacy</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your thoughts belong only to you, encrypted locally on your device.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center">
                  <EyeOff className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 font-serif">Zero Ads or Tracking</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Completely free of third-party ad brokers and surveillance algorithms.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition"
              >
                <span>Read our full story on the About page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SanctuaryPhilosophy;
