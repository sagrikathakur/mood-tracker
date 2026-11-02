import React from "react";
import { Link } from "react-router-dom";

export const PatternFooter = () => {
  return (
    <footer className="w-full bg-[#080e0a] text-slate-400 py-8 px-4 text-center border-t border-emerald-950/60 select-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        <p>
          &copy; {new Date().getFullYear()} Calm Me | Design & Developed by sagrika
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
          <Link to="/tracker" className="hover:text-white transition">
            Tracker
          </Link>
          <a
            href="mailto:sagrikathakur68@gmail.com"
            className="hover:text-emerald-400 transition"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PatternFooter;
