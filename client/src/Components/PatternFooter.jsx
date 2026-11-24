import React from "react";
import { Link } from "react-router-dom";

export const PatternFooter = () => {
  return (
    <footer className="w-full bg-[#080e0a] text-slate-400 py-8 px-4 text-center border-t border-emerald-950/60 select-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        <p>
          &copy; {new Date().getFullYear()} CalmTREE | Crafted for Developer Wellbeing &amp; Privacy
        </p>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-white transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-white transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-white transition">
            Contact
          </Link>
          <Link to="/chatafriend" className="hover:text-white transition">
            Chat a Friend
          </Link>
          <Link to="/meet" className="hover:text-white transition">
            Zen Rooms
          </Link>
          <Link to="/tracker" className="hover:text-white transition">
            Tracker
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default PatternFooter;
