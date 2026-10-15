import React from 'react';
import { Leaf, Mountain, Sun } from 'lucide-react';

export const AboutTeaser: React.FC = () => {
  return (
    <section className="relative w-full bg-[#FAF6EE] text-[#1E0F07] py-20 sm:py-24 lg:py-28 overflow-hidden select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. CORNER BOTANICALS & ROASTED BEAN DECOR (MATCHING IMAGE 3)
      ───────────────────────────────────────────────────────────── */}
      {/* Top-Left: Coffee Branch with Green Leaves, Red Cherries & White Blossoms */}
      <div className="absolute -top-6 -left-6 sm:-top-4 sm:-left-4 w-52 sm:w-68 md:w-80 pointer-events-none z-10 select-none opacity-95 drop-shadow-[0_8px_16px_rgba(43,27,20,0.12)]">
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform -rotate-6"
        />
      </div>

      {/* Top-Right: Wooden Bowl Filled with Roasted Coffee Beans */}
      <div 
        className="absolute top-0 right-0 w-56 sm:w-72 md:w-88 pointer-events-none z-10 select-none opacity-95"
        style={{
          maskImage: 'radial-gradient(circle at 75% 25%, black 50%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 75% 25%, black 50%, transparent 80%)',
        }}
      >
        <img
          src="/images/geometry/corner-beans.jpg"
          alt=""
          className="w-full h-auto mix-blend-multiply drop-shadow-[0_12px_24px_rgba(40,20,10,0.12)]"
        />
      </div>

      {/* Bottom-Left: Scattered Roasted Coffee Beans & Botanical Leaves */}
      <div className="absolute -bottom-8 -left-6 w-48 sm:w-60 pointer-events-none z-10 select-none opacity-85">
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto transform -rotate-12"
        />
      </div>

      {/* Bottom-Right: Subtle Golden Flourish Waves with Coffee Beans */}
      <div className="absolute -bottom-6 -right-6 w-48 sm:w-60 pointer-events-none z-10 select-none opacity-75">
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform rotate-180 scale-x-[-1]"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        
        {/* ─────────────────────────────────────────────────────────────
            2. SECTION HEADER (EXACT REPRODUCTION OF IMAGE 3)
        ───────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          
          {/* Overline with Center Coffee Bean Icon & Hairlines */}
          <div className="flex items-center justify-center gap-3.5 mb-4">
            <div className="w-12 sm:w-20 h-[1.5px] bg-[#C5A882]" />
            <div className="w-4 h-4 rounded-full bg-[#8C6239] flex items-center justify-center text-white text-[9px] shadow-sm">
              ☕
            </div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] font-sans">
              OUR COFFEE JOURNEY
            </span>
            <div className="w-12 sm:w-20 h-[1.5px] bg-[#C5A882]" />
          </div>

          {/* Section Main Title */}
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C0E07] tracking-tight leading-tight">
            A little pause. A perfect cup.
          </h2>

          {/* Section Quote */}
          <p className="font-serif italic text-sm sm:text-base md:text-lg text-[#553E30] mt-3.5 max-w-2xl mx-auto leading-relaxed">
            "We build Brew &amp; Bloom on the conviction that a day is measured not by how fast you run, but by the stillness you allow into your morning."
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. CHAPTER I CONTENT & RIGHT COFFEE MUG STAGE (IMAGE 3)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Chapter I Story Narrative & Stat Badges */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-[1.5px] bg-[#C08A4E]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] font-sans">
                  CHAPTER I
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#A68262] block mb-2 font-sans">
                HIGH MIST &amp; VOLCANIC SOIL
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C0E07] leading-[1.15] tracking-tight">
                Where time slows down, coffee deepens.
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-[14px] text-[#554033] leading-relaxed font-sans font-normal">
              <p>
                Our search for exceptional coffees brought us to the misty mountain slopes of Yirgacheffe, Ethiopia, and Huila, Colombia. Here, heirloom Arabica varieties thrive beneath indigenous canopies of acacia and shade trees at 2,100 meters above sea level.
              </p>
              <p>
                Because the cool mountain nights retard cherry maturation, the coffee beans slowly absorb dense sugars and complex florality. We know every farmer by name, guaranteeing transparent prices well above fair-trade thresholds.
              </p>
            </div>

            {/* 3 Metric Badges matching Image 3 */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#EBDCCB]">
              
              {/* Stat 1: 100% Traceable */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[#8C6239] mb-1">
                  <Leaf className="w-4 h-4 text-[#8C6239]" />
                </div>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C0E07] block leading-none">
                  100%
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8C6239] font-sans block">
                  TRACEABLE HARVESTS
                </span>
              </div>

              {/* Stat 2: 45% Above Fair Minimums */}
              <div className="space-y-1 pl-2 sm:pl-4 border-l border-[#EBDCCB]">
                <div className="flex items-center gap-1 text-[#8C6239] mb-1">
                  <Mountain className="w-4 h-4 text-[#8C6239]" />
                </div>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C0E07] block leading-none">
                  45%
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8C6239] font-sans block">
                  ABOVE FAIR MINIMUMS
                </span>
              </div>

              {/* Stat 3: 2,100m Average Elevation */}
              <div className="space-y-1 pl-2 sm:pl-4 border-l border-[#EBDCCB]">
                <div className="flex items-center gap-1 text-[#8C6239] mb-1">
                  <Sun className="w-4 h-4 text-[#8C6239]" />
                </div>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C0E07] block leading-none">
                  2,100m
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8C6239] font-sans block">
                  AVERAGE ELEVATION
                </span>
              </div>

            </div>

          </div>

          {/* Right Column: Framed Artisanal Steaming Coffee Mug Photo & Script (Image 3) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
            
            <div className="relative w-full max-w-lg rounded-[32px] overflow-hidden border-2 border-[#EADFCF] shadow-[0_16px_40px_rgba(43,27,20,0.1)] bg-[#FAF6EE] group">
              <img
                src="/images/sections/journey-mug.png"
                alt="Artisan Steaming Coffee Mug"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Decorative Script "Good Coffee Better Days ♡" on Right Edge */}
            <div className="absolute -right-4 sm:-right-8 bottom-4 sm:bottom-8 select-none pointer-events-none text-right hidden sm:block">
              <span className="font-serif italic text-sm sm:text-base text-[#8C6239] tracking-wide block drop-shadow-sm rotate-6">
                Good Coffee
              </span>
              <span className="font-serif italic text-sm sm:text-base text-[#8C6239] tracking-wide block drop-shadow-sm rotate-6">
                Better Days ♡
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
