import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { Component as ArgentLoopSlider } from '../ui/argent-loop-infinite-slider';

export const FeaturedCoffee: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slideTitles = [
    '01 / 03 • ETHIOPIAN YIRGACHEFFE',
    '02 / 03 • COLOMBIAN HUILA',
    '03 / 03 • ARTISAN ROSETTE',
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0E0603] select-none"
    >
      {/* ── Pinned Viewport Container ── */}
      <div
        ref={pinnedRef}
        className="w-full h-screen min-h-[560px] sm:min-h-[700px] overflow-hidden relative"
      >
        {/* ── Top Floating Editorial Header ── */}
        <div className="absolute top-4 sm:top-8 left-0 right-0 z-30 w-full max-w-7xl mx-auto px-3.5 sm:px-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#F2CF98] text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.22em] border border-white/15 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#C59B63]" />
              <span>{slideTitles[activeSlide]}</span>
            </span>
            <span className="hidden sm:inline-block font-serif text-lg text-[#FDF8F0] tracking-wide font-medium">
              Featured Brews &amp; Origins
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#E8C28A]/80">
              <MousePointer2 className="w-3.5 h-3.5 text-[#C59B63]" />
              Scroll 3 Profiles ({activeSlide + 1} of 3)
            </span>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#C59B63] hover:bg-[#D4A369] text-[#120703] font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
            >
              <span>View Menu</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Parallax Slider (Pinned & Synchronized with GSAP ScrollTrigger) ── */}
        <div className="w-full h-full">
          <ArgentLoopSlider
            triggerRef={sectionRef}
            pinnedRef={pinnedRef}
            onSlideChange={setActiveSlide}
          />
        </div>

        {/* ── Bottom Floating Hint ── */}
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 w-full max-w-7xl mx-auto px-4 sm:px-10 flex flex-col sm:flex-row items-center justify-between pointer-events-none text-[8.5px] sm:text-[10.5px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-white/50 gap-1 text-center sm:text-left">
          <span>EST. 2021 • SINGLE-ORIGIN SELECTION</span>
          <span className="font-mono text-[#C59B63]">03 MICROLOTS • PINNED SHOWCASE</span>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoffee;
