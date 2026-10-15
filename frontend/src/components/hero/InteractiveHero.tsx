import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const InteractiveHero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { selectedStore, openStoreSelector } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isLoading } = useLoading();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Trigger choreographed entrance precisely after page loader completes
  useEffect(() => {
    if (!isLoading) {
      // Gentle 180ms delay allowing the 3D loader dissolve to seamlessly reveal the hero entrance
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <section className="relative w-full h-[100dvh] min-h-[540px] sm:min-h-[680px] lg:min-h-[760px] overflow-hidden bg-[#140804] select-none flex items-center justify-center">
      {/* ── Background Video Hero (Pure video, edge-to-edge) ── */}
      <video
        ref={videoRef}
        src="/videos/hero-coffee-cup.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-center"
      />

      {/* ── Animated Hero Caption on Right Side (Centered on Mobile) ── */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center lg:justify-end px-4 sm:px-12 md:px-16 lg:px-20 xl:px-28">
        <div className="max-w-md sm:max-w-lg lg:max-w-xl flex flex-col items-center text-center pointer-events-auto space-y-3 sm:space-y-6 pt-8 sm:pt-16">
          
          {/* Overline: ── CRAFTED FOR COFFEE LOVERS ── */}
          <motion.div
            initial={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
            animate={
              shouldAnimate
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: -16, filter: 'blur(6px)' }
            }
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex items-center justify-center gap-2.5 sm:gap-4"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={shouldAnimate ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-6 sm:w-12 h-[1.5px] bg-[#C59B63]/80 origin-right"
            />
            <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.28em] text-[#D4A369] font-sans">
              CRAFTED FOR COFFEE LOVERS
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={shouldAnimate ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-6 sm:w-12 h-[1.5px] bg-[#C59B63]/80 origin-left"
            />
          </motion.div>

          {/* Main Headline: A PERFECT CUP, EVERY TIME */}
          <div className="space-y-0.5 sm:space-y-2 overflow-hidden py-1">
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={
                shouldAnimate
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 40, filter: 'blur(10px)' }
              }
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.06] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
            >
              A PERFECT CUP,
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={
                shouldAnimate
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 40, filter: 'blur(10px)' }
              }
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-[#E8C28A] tracking-tight leading-[1.06] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
            >
              EVERY TIME
            </motion.h2>
          </div>

          {/* Subtitle: Rich aroma. Smooth crema. Roasted with passion. */}
          <motion.p
            initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
            animate={
              shouldAnimate
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 22, filter: 'blur(6px)' }
            }
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="font-serif italic text-sm sm:text-lg md:text-xl text-[#F4ECE1]/90 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] px-2"
          >
            Rich aroma. Smooth crema. Roasted with passion.
          </motion.p>

          {/* Acquisition Hook Banner: Luckin New-User Free Cup Offer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="bg-[#2A2723]/80 backdrop-blur-md p-3 rounded-2xl border border-[#C5A880]/50 shadow-xl flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C5A880]/20 text-[#C5A880]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#C5A880]">New Member Exclusive</span>
                  <h4 className="font-semibold text-xs text-white">First Cup On Us (Flat ₹250 Off)</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openAuthModal();
                  else navigate('/menu');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#C5A880] text-[#1C1A17] font-bold text-[10px] uppercase tracking-wider hover:bg-[#B3956F] transition-all flex-shrink-0"
              >
                {isAuthenticated ? 'View Menu' : 'Claim'}
              </button>
            </div>
          </motion.div>

          {/* CTA Buttons: ORDER AHEAD (SKIP QUEUE) & EXPLORE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={
              shouldAnimate
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.9, y: 20 }
            }
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.85 }}
            className="pt-1 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) openAuthModal();
                else navigate('/menu');
              }}
              className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#C5A880] hover:bg-[#B3956F] text-[#160B05] font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_8px_25px_rgba(197,155,99,0.35)] hover:scale-105 active:scale-95"
            >
              <span>ORDER AHEAD (NO CASHIER)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#160B05] transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/book-table"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-[#C5A880]/50 hover:bg-white/20 text-white text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>BOOK A TABLE / SLOT</span>
            </Link>

            <Link
              to="/menu"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 bg-black/40 hover:bg-white/10 text-white text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase transition-all"
            >
              <span>BROWSE MENU</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Floating Nearest Store Widget at Bottom Left (Positioned higher with comfortable breathing room) */}
      {selectedStore && (
        <div className="absolute bottom-14 sm:bottom-16 left-6 sm:left-8 z-20 hidden md:block">
          <button
            type="button"
            onClick={openStoreSelector}
            className="bg-[#2A2723]/80 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-left text-white shadow-xl hover:border-[#C5A880]/50 transition-all flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-white/10 text-[#C5A880]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-white/60 block">Nearest Store Outlet</span>
              <h5 className="font-semibold text-xs text-white">{selectedStore.name}</h5>
              <span className="text-[10px] text-[#C5A880] font-medium">Ready in ~{selectedStore.avg_prep_time_minutes} min • Tap to Change</span>
            </div>
          </button>
        </div>
      )}
    </section>
  );
};
