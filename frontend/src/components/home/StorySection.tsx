import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * StorySection — GSAP ScrollTrigger pinned storytelling.
 * The section pins while 3 narrative blocks fade/slide in sequence,
 * an SVG timeline path draws itself, and the background color shifts.
 */
export const StorySection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const block1Ref = useRef<HTMLDivElement>(null);
  const block2Ref = useRef<HTMLDivElement>(null);
  const block3Ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const milestone1Ref = useRef<HTMLDivElement>(null);
  const milestone2Ref = useRef<HTMLDivElement>(null);
  const milestone3Ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: pinnedRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // SVG path draw
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });
        tl.to(pathRef.current, { strokeDashoffset: 0, duration: 3, ease: 'none' }, 0);
      }

      // Background color shift: warm amber → cream → daylight
      tl.to(bgRef.current, {
        background: 'linear-gradient(180deg, #2B1B14 0%, #3D2418 50%, #4A2E1C 100%)',
        duration: 1,
        ease: 'none',
      }, 0);
      tl.to(bgRef.current, {
        background: 'linear-gradient(180deg, #3D2418 0%, #5A3B2E 50%, #6B4C3A 100%)',
        duration: 1,
        ease: 'none',
      }, 1);
      tl.to(bgRef.current, {
        background: 'linear-gradient(180deg, #5A3B2E 0%, #7A5C4A 50%, #8B6D5A 100%)',
        duration: 1,
        ease: 'none',
      }, 2);

      // Block 1: Fade + slide in (phase 1)
      gsap.set(block1Ref.current, { opacity: 0, y: 50 });
      tl.to(block1Ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
      tl.to(block1Ref.current, { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 0.8);

      // Milestone 1
      gsap.set(milestone1Ref.current, { opacity: 0, scale: 0.5 });
      tl.to(milestone1Ref.current, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.3);

      // Block 2: Fade + slide in (phase 2)
      gsap.set(block2Ref.current, { opacity: 0, y: 50 });
      tl.to(block2Ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1);
      tl.to(block2Ref.current, { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 1.8);

      // Milestone 2
      gsap.set(milestone2Ref.current, { opacity: 0, scale: 0.5 });
      tl.to(milestone2Ref.current, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 1.3);

      // Block 3: Fade + slide in (phase 3)
      gsap.set(block3Ref.current, { opacity: 0, y: 50 });
      tl.to(block3Ref.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2);

      // Milestone 3
      gsap.set(milestone3Ref.current, { opacity: 0, scale: 0.5 });
      tl.to(milestone3Ref.current, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 2.3);

    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative w-full select-none bg-[#1E0F07]">
      <div
        ref={pinnedRef}
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background */}
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 transition-none"
          style={{
            background: 'linear-gradient(180deg, #1E0F07 0%, #2B1B14 50%, #3D2418 100%)',
          }}
        />

        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(197, 155, 99, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Corner botanicals */}
        <div className="absolute -top-8 -left-8 w-48 sm:w-64 pointer-events-none opacity-30 z-[2]">
          <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-12" />
        </div>
        <div className="absolute -bottom-8 -right-8 w-48 sm:w-60 pointer-events-none opacity-25 z-[2]">
          <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform rotate-180 scale-x-[-1]" />
        </div>

        {/* Content container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          {/* Section header (always visible) */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 sm:w-16 h-[1px] bg-[#C59B63]/60" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#C59B63]">
                OUR JOURNEY
              </span>
              <div className="w-12 sm:w-16 h-[1px] bg-[#C59B63]/60" />
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FFF8F0] tracking-tight">
              From Seed to <span className="italic font-normal text-[#E8C28A]">Sanctuary</span>
            </h2>
          </div>

          {/* SVG Timeline Path */}
          <div className="relative flex justify-center mb-8">
            <svg
              width="600"
              height="60"
              viewBox="0 0 600 60"
              fill="none"
              className="w-full max-w-[600px] overflow-visible"
            >
              <path
                ref={pathRef}
                d="M30 30 C130 30 170 10 300 30 C430 50 470 30 570 30"
                stroke="#C59B63"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Milestone dots (static positions) */}
              <circle cx="30" cy="30" r="6" fill="#C59B63" opacity="0.3" />
              <circle cx="300" cy="30" r="6" fill="#C59B63" opacity="0.3" />
              <circle cx="570" cy="30" r="6" fill="#C59B63" opacity="0.3" />
            </svg>

            {/* Milestone labels */}
            <div ref={milestone1Ref} className="absolute left-[2%] sm:left-[5%] top-[55px] sm:top-[60px] text-center opacity-0">
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#E8C28A] block">2021</span>
              <span className="text-[9px] sm:text-[10px] text-[#C6B4A3] block">Founded</span>
            </div>
            <div ref={milestone2Ref} className="absolute left-1/2 -translate-x-1/2 top-[55px] sm:top-[60px] text-center opacity-0 whitespace-nowrap">
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#E8C28A] block">2022</span>
              <span className="text-[9px] sm:text-[10px] text-[#C6B4A3] block">First Roastery</span>
            </div>
            <div ref={milestone3Ref} className="absolute right-[2%] top-[55px] sm:top-[60px] text-center opacity-0">
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#E8C28A] block">Today</span>
              <span className="text-[9px] sm:text-[10px] text-[#C6B4A3] block">3 Cafés</span>
            </div>
          </div>

          {/* Narrative text blocks (stacked, each fades in/out) */}
          <div className="relative min-h-[300px] sm:min-h-[260px] flex items-center justify-center">

            {/* Block 1 */}
            <div ref={block1Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
              <div className="text-center max-w-2xl px-2 sm:px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59B63]/15 border border-[#C59B63]/30 mb-3 sm:mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C28A]">Chapter I</span>
                </div>
                <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#FFF8F0] mb-3 sm:mb-4">
                  A Dream of Slow Mornings
                </h3>
                <p className="text-xs sm:text-base text-[#C6B4A3] leading-relaxed font-sans">
                  It began with a simple belief: that the best moments are the unhurried ones. In a small studio kitchen,
                  we pulled our first espresso shots and imagined a place where people could pause, breathe, and savor.
                </p>
              </div>
            </div>

            {/* Block 2 */}
            <div ref={block2Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
              <div className="text-center max-w-2xl px-2 sm:px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59B63]/15 border border-[#C59B63]/30 mb-3 sm:mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C28A]">Chapter II</span>
                </div>
                <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#FFF8F0] mb-3 sm:mb-4">
                  The First Roastery
                </h3>
                <p className="text-xs sm:text-base text-[#C6B4A3] leading-relaxed font-sans">
                  By 2022, we had our own micro-roastery — twelve-kilogram drums humming through the night, filling the
                  neighborhood with the scent of freshly roasted Ethiopian Yirgacheffe and Colombian Huila beans.
                </p>
              </div>
            </div>

            {/* Block 3 */}
            <div ref={block3Ref} className="absolute inset-0 flex items-center justify-center opacity-0">
              <div className="text-center max-w-2xl px-2 sm:px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59B63]/15 border border-[#C59B63]/30 mb-3 sm:mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C28A]">Today</span>
                </div>
                <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#FFF8F0] mb-3 sm:mb-4">
                  Three Sanctuaries & Counting
                </h3>
                <p className="text-xs sm:text-base text-[#C6B4A3] leading-relaxed font-sans">
                  Today, Brew & Bloom has three sunlit cafés across the city — each one a quiet sanctuary where the coffee
                  is single-origin, the milk is micro-foamed, and there's absolutely nowhere to rush to.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

