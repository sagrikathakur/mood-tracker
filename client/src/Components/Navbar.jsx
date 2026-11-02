import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import assets from '../assets/asset'
import { useAuth } from '../context/AuthContext'
import { PixelOwl } from './PixelIcons'
import { sounds } from '../utils/soundEffects'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: "/tracker", label: "Dashboard" },
    { to: "/journal", label: "My Journal" },
    { to: "/calendar", label: "Calendar" },
    { to: "/analytics", label: "Correlation & AI" },
    { to: "/wellness", label: "Wellness Tools" },
    { to: "/habits", label: "Habits & Goals" },
  ]

  const handleNavClick = () => {
    sounds.playClick();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 py-3 px-4 sm:px-8 bg-[#FAF8F5]/95 backdrop-blur-md border-b-[2.5px] border-[#18181B]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo with Pixel Owl Avatar */}
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center transition-transform group-hover:scale-105">
            <PixelOwl className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight text-[#18181B] leading-none">
              MINDSPACE
            </span>
            <span className="font-pixel text-[9px] text-[#4ADE80] bg-[#18181B] px-1.5 py-0.2 rounded mt-0.5 inline-block w-fit">
              8-BIT SANCTUARY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Pixel Pill Bar */}
        <div className="hidden lg:flex items-center gap-1.5 p-1.5 bg-white border-2 border-[#18181B] rounded-2xl shadow-[2.5px_2.5px_0px_#18181B]">
          <Link
            to="/"
            onClick={handleNavClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              location.pathname === "/"
                ? "bg-[#18181B] text-[#4ADE80] font-pixel text-[11px]"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F5]"
            }`}
          >
            Home
          </Link>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={isAuthenticated ? link.to : "/login"}
                onClick={handleNavClick}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? "bg-[#18181B] text-[#4ADE80] font-pixel text-[11px]"
                    : "text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F5]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <span className="pixel-badge bg-[#DCFCE7] text-[#18181B]">
                <User className="w-3.5 h-3.5 text-[#18181B]" />
                {user?.name || "Player"}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  logout();
                }}
                className="pixel-btn pixel-btn-coral py-1.5 px-3.5 text-xs font-pixel"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={handleNavClick}
              className="pixel-btn pixel-btn-green py-2 px-5 text-xs font-pixel"
            >
              START GAME
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="pixel-btn pixel-btn-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 space-y-2 bg-white rounded-2xl p-4 border-[2.5px] border-[#18181B] shadow-[4px_4px_0px_#18181B] text-[#18181B] animate-in fade-in duration-200">
          <Link
            to="/"
            onClick={() => {
              handleNavClick();
              setMobileMenuOpen(false);
            }}
            className="block font-black text-sm px-3.5 py-2 rounded-xl hover:bg-[#FAF8F5]"
          >
            Home
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={isAuthenticated ? link.to : "/login"}
              onClick={() => {
                handleNavClick();
                setMobileMenuOpen(false);
              }}
              className="block font-black text-sm text-[#52525B] hover:text-[#18181B] hover:bg-[#DCFCE7] px-3.5 py-2 rounded-xl transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t-2 border-[#18181B] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="pixel-btn pixel-btn-coral py-2.5 text-xs font-pixel"
              >
                SIGN OUT ({user?.name || "User"})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => {
                  handleNavClick();
                  setMobileMenuOpen(false);
                }}
                className="pixel-btn pixel-btn-green py-2.5 text-xs font-pixel text-center"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
