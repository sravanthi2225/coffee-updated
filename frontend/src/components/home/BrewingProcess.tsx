import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface BrewStep {
  id: string;
  label: string;
  description: string;
  color: string;
}

const BREW_STEPS: BrewStep[] = [
  { id: 'grind', label: 'Grind', description: 'Freshly ground to the perfect coarseness for optimal extraction.', color: '#D49B55' },
  { id: 'bloom', label: 'Bloom', description: 'Hot water meets grounds — CO₂ releases, flavors awaken.', color: '#8C6239' },
  { id: 'pour', label: 'Pour', description: 'A slow, circular pour draws out sweetness and complexity.', color: '#36B39E' },
  { id: 'serve', label: 'Serve', description: 'Perfection in a cup. Rich, balanced, and ready to savor.', color: '#E08D79' },
];

/**
 * BrewingProcess — GSAP scroll-scrubbed SVG brewing animation.
 * The SVG illustration progresses through 4 brewing stages as the user scrolls.
 * Step labels fade in/out synced to scroll position.
 */
export const BrewingProcess: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const pourPathRef = useRef<SVGPathElement>(null);
  const steamPath1Ref = useRef<SVGPathElement>(null);
  const steamPath2Ref = useRef<SVGPathElement>(null);
  const steamPath3Ref = useRef<SVGPathElement>(null);
  const waterFillRef = useRef<SVGRectElement>(null);
  const groundsRef = useRef<SVGEllipseElement>(null);
  const cupBodyRef = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 20%',
          end: 'bottom 20%',
          scrub: 0.6,
        },
      });

      // Progress bar
      tl.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, duration: 4, ease: 'none' }, 0);

      // Grind phase (0-1): grounds appear and scatter
      if (groundsRef.current) {
        gsap.set(groundsRef.current, { opacity: 0, scale: 0 });
        tl.to(groundsRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)' }, 0);
      }

      // Step labels fade in sequence
      stepRefs.current.forEach((stepEl, i) => {
        if (!stepEl) return;
        gsap.set(stepEl, { opacity: 0, y: 20 });
        tl.to(stepEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i * 1);
        if (i < BREW_STEPS.length - 1) {
          tl.to(stepEl, { opacity: 0.3, duration: 0.3 }, (i + 1) * 1);
        }
      });

      // Bloom phase (1-2): pour path draws
      if (pourPathRef.current) {
        const pathLength = pourPathRef.current.getTotalLength();
        gsap.set(pourPathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        tl.to(pourPathRef.current, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 1);
      }

      // Pour phase (2-3): water fills up in cup
      if (waterFillRef.current) {
        gsap.set(waterFillRef.current, { scaleY: 0, transformOrigin: 'bottom center' });
        tl.to(waterFillRef.current, { scaleY: 1, duration: 1, ease: 'power1.inOut' }, 2);
      }

      // Serve phase (3-4): steam rises
      const steamPaths = [steamPath1Ref.current, steamPath2Ref.current, steamPath3Ref.current].filter(Boolean);
      steamPaths.forEach((path) => {
        if (!path) return;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        tl.to(path, { strokeDashoffset: 0, opacity: 0.7, duration: 0.8, ease: 'power1.out' }, 3);
      });

      // Cup body glow on serve
      if (cupBodyRef.current) {
        tl.to(cupBodyRef.current, {
          filter: 'drop-shadow(0 0 12px rgba(224, 141, 121, 0.5))',
          duration: 0.5,
        }, 3.2);
      }

    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative w-full bg-[#180C07] text-[#FDF8F0] py-20 sm:py-28 overflow-hidden select-none">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(197, 155, 99, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Corner botanicals */}
      <div className="absolute -top-8 -left-8 w-48 sm:w-64 pointer-events-none opacity-25 z-[1]">
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-12" />
      </div>
      <div className="absolute -bottom-8 -right-8 w-44 sm:w-56 pointer-events-none opacity-20 z-[1]">
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 sm:w-16 h-[1px] bg-[#C59B63]/60" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#C59B63]">
              THE CRAFT
            </span>
            <div className="w-12 sm:w-16 h-[1px] bg-[#C59B63]/60" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#FFF8F0] tracking-tight">
            The Brewing <span className="italic font-normal text-[#E8C28A]">Process</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#C6B4A3] mt-3 max-w-xl mx-auto font-sans">
            Scroll through each stage of our meticulous brewing ritual.
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-1 bg-[#2A150C] rounded-full mb-12 overflow-hidden">
          <div
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-full rounded-full origin-left"
            style={{
              background: 'linear-gradient(90deg, #D49B55, #8C6239, #36B39E, #E08D79)',
              transform: 'scaleX(0)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: SVG Brewing Illustration */}
          <div ref={svgContainerRef} className="flex justify-center">
            <svg width="320" height="380" viewBox="0 0 320 380" fill="none" className="w-full max-w-[320px]">
              {/* Chemex / Pour-over body */}
              <path
                ref={cupBodyRef}
                d="M100 140 L80 300 C80 320 100 340 160 340 C220 340 240 320 240 300 L220 140 Z"
                stroke="#C59B63"
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
              />

              {/* Filter cone top */}
              <path
                d="M90 140 L130 60 L160 40 L190 60 L230 140"
                stroke="#C59B63"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
              />

              {/* Rim */}
              <ellipse cx="160" cy="140" rx="70" ry="8" stroke="#C59B63" strokeWidth="2" fill="none" />

              {/* Coffee grounds in filter */}
              <ellipse
                ref={groundsRef}
                cx="160"
                cy="80"
                rx="28"
                ry="10"
                fill="#3A1F0E"
                stroke="#5A3522"
                strokeWidth="1.5"
              />

              {/* Pour stream */}
              <path
                ref={pourPathRef}
                d="M160 10 C160 20 162 30 160 50 C158 60 160 70 160 80"
                stroke="#8FC4DD"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />

              {/* Water fill in bottom carafe */}
              <rect
                ref={waterFillRef}
                x="100"
                y="200"
                width="120"
                height="120"
                rx="20"
                fill="#3A1F0E"
                opacity="0.6"
              />

              {/* Steam lines */}
              <path
                ref={steamPath1Ref}
                d="M130 30 C128 20 132 12 130 2"
                stroke="#FFF8F0"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
              <path
                ref={steamPath2Ref}
                d="M160 25 C158 15 162 8 160 -2"
                stroke="#FFF8F0"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
              <path
                ref={steamPath3Ref}
                d="M190 30 C188 20 192 12 190 2"
                stroke="#FFF8F0"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />

              {/* Base / stand */}
              <line x1="110" y1="345" x2="210" y2="345" stroke="#C59B63" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Right: Step labels */}
          <div className="space-y-6">
            {BREW_STEPS.map((step, i) => (
              <div
                key={step.id}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#2A150C]/50 border border-[#4A2917]/50"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold font-mono"
                  style={{
                    border: `2px solid ${step.color}`,
                    color: step.color,
                    boxShadow: `0 0 12px ${step.color}33`,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FFF8F0]">{step.label}</h3>
                  <p className="text-xs sm:text-sm text-[#C6B4A3] leading-relaxed mt-1 font-sans">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
