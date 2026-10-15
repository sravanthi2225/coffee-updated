import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const MenuHeroParallax: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Hook scroll progress to this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms for various layers
  // Central Cup & Plate (scales down, glides downwards with 3D tilt)
  const cupScale = useTransform(scrollYProgress, [0, 1], [1, 0.84]);
  const cupY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const cupRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);

  // Headline & Subtitle parallax (fades and moves upwards)
  const titleY = useTransform(scrollYProgress, [0, 0.8], [0, -90]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Floating Ingredients Dispersal (QClay 3D explosion effect)
  // Layer 1: Top-Left Botanical Branch
  const tlLeafX = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const tlLeafY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const tlLeafRotate = useTransform(scrollYProgress, [0, 1], [-15, -50]);
  const tlLeafScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  // Layer 2: Top-Right Roasted Beans Cluster
  const trBeansX = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const trBeansY = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const trBeansRotate = useTransform(scrollYProgress, [0, 1], [25, 75]);

  // Layer 3: Bottom-Left Roasted Beans
  const blBeansX = useTransform(scrollYProgress, [0, 1], [0, -210]);
  const blBeansY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const blBeansRotate = useTransform(scrollYProgress, [0, 1], [0, -55]);

  // Layer 4: Bottom-Right Botanical Leaf
  const brLeafX = useTransform(scrollYProgress, [0, 1], [0, 230]);
  const brLeafY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const brLeafRotate = useTransform(scrollYProgress, [0, 1], [40, 90]);

  // Ambient Halo Glow
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.8], [0.75, 0.15]);

  // Scroll prompt fade out
  const promptOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[720px] lg:min-h-[820px] bg-[#0C0603] text-[#FBF4E9] overflow-hidden flex flex-col justify-between items-center pt-28 sm:pt-36 pb-12 select-none"
    >
      {/* ── 1. Atmospheric Dark Roast Gradients ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0402] via-[#140A05] to-[#1E0F08] pointer-events-none" />

      {/* Warm Golden Halo Center Light */}
      <motion.div
        style={{
          scale: reducedMotion ? 1 : glowScale,
          opacity: reducedMotion ? 0.6 : glowOpacity,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full bg-[radial-gradient(circle,#C59B63_0%,rgba(197,155,99,0.22)_45%,transparent_70%)] blur-3xl pointer-events-none z-0"
      />

      {/* Subtle fine coffee dust shimmer particles */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F2CF98_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* ── 2. Cinematic Headline Layer (Cleanly positioned below navbar) ── */}
      <motion.div
        style={{
          y: reducedMotion ? 0 : titleY,
          opacity: reducedMotion ? 1 : titleOpacity,
        }}
        className="relative z-20 text-center px-4 max-w-4xl mx-auto pointer-events-none"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E8C28A] text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-3 sm:mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>Curated Artisan Collection</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[66px] font-bold text-[#FDF8F0] tracking-tight leading-[1.08]">
          Every Pour, <span className="italic font-normal text-[#E8C28A]">A Masterpiece.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#D7C0AE] mt-3 sm:mt-4 max-w-xl mx-auto font-sans font-normal leading-relaxed opacity-90">
          Slow-roasted single origins, silky micro-textured classics, and botanical cold brews crafted with obsessively calibrated precision.
        </p>
      </motion.div>

      {/* ── 3. Central Focal Plate / Skillet Cup (Matching QClay centerpiece) ── */}
      <motion.div
        style={{
          scale: reducedMotion ? 1 : cupScale,
          y: reducedMotion ? 0 : cupY,
          rotate: reducedMotion ? 0 : cupRotate,
        }}
        className="relative z-10 flex flex-col items-center justify-center my-6 sm:my-8 pointer-events-none"
      >
        {/* Soft shadow */}
        <div className="absolute -bottom-8 w-64 sm:w-84 h-14 bg-black/85 rounded-[100%] blur-2xl pointer-events-none" />

        {/* Circular Artisan Plate Showcase */}
        <div className="relative w-64 sm:w-80 md:w-92 aspect-square rounded-full p-2.5 bg-gradient-to-b from-[#C59B63]/40 via-[#2B1B14]/80 to-[#0A0402] border border-[#C59B63]/45 shadow-[0_25px_65px_rgba(0,0,0,0.92),0_0_55px_rgba(197,155,99,0.22)] flex items-center justify-center overflow-hidden">
          <img
            src="/images/sections/journey-mug.png"
            alt="Artisanal Brew"
            className="w-full h-full object-cover rounded-full filter contrast-110 brightness-105 transform scale-105"
          />

          {/* Inner radial vignette */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Floating Pill Badge */}
          <div className="absolute bottom-5 bg-black/80 backdrop-blur-md border border-[#C59B63]/50 px-4 py-1.5 rounded-full flex items-center gap-1.5 text-[10.5px] font-bold tracking-widest uppercase text-[#F3D7AB] shadow-xl">
            <Flame className="w-3 h-3 text-[#E88E38]" />
            <span>Ethiopian Yirgacheffe • 9 Bar</span>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Floating Ingredients Dispersal Layers (QClay Parallax Effect) ── */}

      {/* Top-Left: Botanical Branch & Coffee Leaves */}
      <motion.div
        style={{
          x: reducedMotion ? 0 : tlLeafX,
          y: reducedMotion ? 0 : tlLeafY,
          rotate: reducedMotion ? -15 : tlLeafRotate,
          scale: reducedMotion ? 1 : tlLeafScale,
        }}
        className="absolute top-[28%] left-[4%] sm:left-[10%] w-36 sm:w-56 pointer-events-none z-10 opacity-90 drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
      >
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform -rotate-45 filter brightness-110"
        />
      </motion.div>

      {/* Top-Right: Roasted Beans Cluster */}
      <motion.div
        style={{
          x: reducedMotion ? 0 : trBeansX,
          y: reducedMotion ? 0 : trBeansY,
          rotate: reducedMotion ? 25 : trBeansRotate,
        }}
        className="absolute top-[30%] right-[4%] sm:right-[10%] w-32 sm:w-48 pointer-events-none z-10 opacity-95 drop-shadow-[0_22px_40px_rgba(0,0,0,0.75)]"
      >
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto filter contrast-125 brightness-105"
        />
      </motion.div>

      {/* Bottom-Left: Scattered Beans */}
      <motion.div
        style={{
          x: reducedMotion ? 0 : blBeansX,
          y: reducedMotion ? 0 : blBeansY,
          rotate: reducedMotion ? 0 : blBeansRotate,
        }}
        className="absolute bottom-[16%] left-[6%] sm:left-[12%] w-28 sm:w-44 pointer-events-none z-10 opacity-85 drop-shadow-[0_16px_32px_rgba(0,0,0,0.7)]"
      >
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto transform rotate-180 filter contrast-125"
        />
      </motion.div>

      {/* Bottom-Right: Botanical Coffee Leaf */}
      <motion.div
        style={{
          x: reducedMotion ? 0 : brLeafX,
          y: reducedMotion ? 0 : brLeafY,
          rotate: reducedMotion ? 40 : brLeafRotate,
        }}
        className="absolute bottom-[14%] right-[5%] sm:right-[12%] w-32 sm:w-52 pointer-events-none z-10 opacity-90 drop-shadow-[0_18px_35px_rgba(0,0,0,0.7)]"
      >
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform rotate-120 filter brightness-105"
        />
      </motion.div>

      {/* ── 5. Bottom Scroll Prompt ── */}
      <motion.div
        style={{ opacity: reducedMotion ? 1 : promptOpacity }}
        className="relative z-20 flex flex-col items-center justify-center gap-2 pointer-events-none text-white/60"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#E8C28A]/80">
          Scroll to explore brews
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 rounded-full border border-white/25 flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-2.5 rounded-full bg-[#C59B63]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MenuHeroParallax;
