import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, ArrowRight, Check, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export const FinalCTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const reducedMotion = useReducedMotion();

  // Subtle GSAP entrance animation
  useEffect(() => {
    if (reducedMotion || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 35, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
      setTimeout(() => {
        setEmailSubmitted(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-[#FAF6EE] py-10 sm:py-14 select-none">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury CTA Card Container - Compact & Sleek Height */}
        <div
          ref={cardRef}
          className="relative rounded-[24px] sm:rounded-[36px] overflow-hidden bg-[#130904] border border-[#C59B63]/30 shadow-[0_20px_50px_-15px_rgba(25,12,6,0.4)] min-h-[300px] sm:min-h-[380px] flex items-center justify-center py-7 px-4 sm:py-10 sm:px-10 lg:py-11 lg:px-14"
        >
          {/* Pristine Background Photography (No baked-in text) */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/images/sections/final-cta-clean-bg.jpg"
              alt=""
              className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.1] transform scale-105"
            />
            {/* Cinematic Multi-Layer Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120703]/95 via-[#180A04]/80 to-[#120703]/85" />
            <div
              className="absolute inset-0 opacity-45"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(197, 155, 99, 0.35) 0%, rgba(30, 12, 5, 0.2) 50%, transparent 80%)',
              }}
            />
            {/* Subtle Golden Top Hairline Glow */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C59B63]/70 to-transparent" />
          </div>

          {/* Foreground Editorial Content */}
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3.5 sm:space-y-4.5">
            
            {/* Elegant Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#200F06]/80 border border-[#C59B63]/40 backdrop-blur-md shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8B87A] animate-pulse" />
              <span className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-[#E8B87A] font-sans">
                Brew &amp; Bloom • Sanctuary Awaits
              </span>
            </div>

            {/* Headline */}
            <h2
              ref={headlineRef}
              className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-bold text-[#FAF4ED] tracking-tight leading-[1.18] drop-shadow-md"
            >
              A little pause is waiting for{' '}
              <span className="italic font-normal font-serif text-[#E8B87A]">you.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#F4ECE1]/85 font-sans font-normal max-w-xl mx-auto leading-relaxed drop-shadow-sm px-1">
              Whether you are stepping in for a morning espresso, settling down with a novel, or taking a moment between meetings, our baristas are ready.
            </p>

            {/* Interactive Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 w-full max-w-md sm:max-w-none mx-auto">
              <Link
                to="/menu"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#D8A464] via-[#E8B87A] to-[#C9914E] text-[#190C05] text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_8px_22px_rgba(216,164,100,0.35)] hover:shadow-[0_12px_28px_rgba(216,164,100,0.48)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Coffee className="w-4 h-4 text-[#190C05] transition-transform duration-300 group-hover:-rotate-12" />
                <span>ORDER FOR CAFÉ PICKUP</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#190C05] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/locations"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#180C06]/85 hover:bg-[#25130A] text-[#FAF4ED] border border-[#C59B63]/60 hover:border-[#E8B87A] backdrop-blur-md text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <MapPin className="w-4 h-4 text-[#E8B87A] transition-transform duration-300 group-hover:scale-110" />
                <span>FIND NEAREST CAFÉ</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E8B87A] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Newsletter VIP Signup with Glassmorphic Pill */}
            <div className="pt-2 sm:pt-3.5 w-full max-w-md mx-auto">
              <div className="relative p-1 rounded-full bg-[#0F0603]/80 border border-[#C59B63]/30 backdrop-blur-md shadow-xl focus-within:border-[#E8B87A] transition-all duration-300">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <div className="pl-3 text-[#C59B63]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 bg-transparent py-1.5 sm:py-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
                    required
                  />
                  <AnimatePresence mode="wait">
                    {emailSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="px-3.5 py-1.5 rounded-full bg-[#447A40] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md"
                      >
                        <Check className="w-3 h-3" />
                        <span>Joined</span>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="submit"
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        className="px-4.5 py-2 rounded-full bg-gradient-to-r from-[#C59B63] to-[#E8B87A] text-[#190C05] text-[10.5px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                      >
                        Subscribe
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>
              </div>
              <p className="text-[10px] text-[#FAF4ED]/50 mt-2 tracking-wide flex items-center justify-center gap-1 font-sans">
                <span className="text-[#C59B63]">✦</span>
                <span>Join 2,400+ coffee lovers. No spam, just unhurried brews.</span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
