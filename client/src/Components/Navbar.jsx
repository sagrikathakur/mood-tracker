import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import assets from '../assets/asset'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:px-8 bg-transparent border-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo Picture Only */}
        <a href="/" className="flex items-center">
          <img
            src={assets.logo}
            alt="Logo"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </a>

        {/* Desktop Navigation - White Menu Color */}
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-white drop-shadow-sm">
          <a href="/" className="font-bold text-white hover:text-white/80 transition">
            Home
          </a>
          <a href="#tracker" className="hover:text-white/80 transition">
            Mood Tracker
          </a>
          <a href="#meditation" className="hover:text-white/80 transition">
            Guided Calm
          </a>
          <a href="#insights" className="hover:text-white/80 transition">
            Insights
          </a>
          <a href="#community" className="hover:text-white/80 transition">
            Community
          </a>
        </div>

        {/* Single Action Button - White Button (Hover Black) */}
        <div className="hidden md:flex items-center">
          <a
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-black hover:text-white px-4.5 py-2 rounded-lg shadow-md transition-colors duration-200 active:scale-95"
          >
            Sign In
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown - Transparent Glass Theme */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 space-y-2 bg-black/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 text-white animate-in fade-in duration-200">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-semibold text-sm text-white px-3.5 py-2.5 rounded-xl bg-white/20"
          >
            Home
          </a>
          <a
            href="#tracker"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition"
          >
            Mood Tracker
          </a>
          <a
            href="#meditation"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition"
          >
            Guided Calm
          </a>
          <a
            href="#insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition"
          >
            Insights
          </a>
          <a
            href="#community"
            onClick={() => setMobileMenuOpen(false)}
            className="block font-medium text-sm text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition"
          >
            Community
          </a>
          <div className="pt-2 border-t border-white/15 flex flex-col gap-2">
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center font-bold text-sm text-slate-900 bg-white hover:bg-black hover:text-white py-3 rounded-xl shadow-md transition-colors duration-200"
            >
              Sign In
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar






