import React from 'react'
import assets from '../assets/asset'

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900 pt-20 pb-16">

      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {(assets.hero_video3 || assets.hero_video2 || assets.hero_video) && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={assets.hero_video3} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Hero Content - Scaled for Mobile & Desktop */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center justify-center space-y-5 sm:space-y-6">
        <h1 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          Soothe Your Vibe
        </h1>

        <p className="text-sm sm:text-lg text-white font-medium max-w-lg mx-auto leading-relaxed drop-shadow-sm px-2">
          Cancel your internal noise and track your emotional wellness every day with clarity and peace.
        </p>

        {/* 2 Hero Buttons - Scaled for Mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-xs sm:max-w-none">
          <a
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors duration-200 active:scale-95 cursor-pointer shadow-lg"
          >
            Get Started
          </a>
          <a
            href="#tracker"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-white/10 border border-white/40 text-white font-semibold text-sm backdrop-blur-md hover:bg-black hover:text-white hover:border-black transition-colors duration-200 active:scale-95 cursor-pointer"
          >
            Explore Calm
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero





