import React from 'react';
import { motion } from 'framer-motion';
import type { HeroDrink } from '../../types/product';

interface CoffeeVisualProps {
  drink: HeroDrink;
  isHot: boolean;
}

export const CoffeeVisual: React.FC<CoffeeVisualProps> = ({ drink, isHot }) => {
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Background radial warmth */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-caramel/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Floating Coffee Beans (Faithful to Reference Image) */}
      
      {/* Bean 1 - Top Left Group */}
      <motion.div 
        animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 left-6 sm:top-6 sm:left-8 w-12 h-8 sm:w-16 sm:h-10 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={-25} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 5, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-16 left-2 sm:top-20 sm:left-4 w-10 h-7 sm:w-14 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={40} />
      </motion.div>

      {/* Bean 2 - Upper Right of Cup */}
      <motion.div 
        animate={{ y: [0, -7, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-10 right-14 sm:top-14 sm:right-24 w-10 h-7 sm:w-13 sm:h-8 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={115} />
      </motion.div>

      {/* Bean 3 - Mid Left */}
      <motion.div 
        animate={{ y: [0, 8, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-[45%] left-0 sm:left-2 w-11 h-7 sm:w-14 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={-60} />
      </motion.div>

      {/* Bean 4 - Far Right / Edge */}
      <motion.div 
        animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute top-12 right-2 sm:top-16 sm:right-6 w-11 h-7 sm:w-14 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={80} />
      </motion.div>

      {/* Bean 5 - Lower Left */}
      <motion.div 
        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-16 left-4 sm:bottom-20 sm:left-8 w-11 h-7 sm:w-14 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={30} />
      </motion.div>

      {/* Bean 6 - Lower Right Beans near card */}
      <motion.div 
        animate={{ y: [0, -5, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute bottom-28 right-4 sm:bottom-36 sm:right-8 w-12 h-8 sm:w-15 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={-45} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        className="absolute bottom-12 right-2 sm:bottom-16 sm:right-4 w-11 h-7 sm:w-14 sm:h-9 z-10 filter drop-shadow-xl"
      >
        <CoffeeBeanSvg rotation={65} />
      </motion.div>

      {/* The Main Cup & Saucer Top-Down Assembly */}
      <motion.div
        key={`${drink.id}-${isHot ? 'hot' : 'cold'}`}
        initial={{ scale: 0.94, opacity: 0.85, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-[85%] sm:w-[86%] aspect-square flex items-center justify-center filter drop-shadow-[0_25px_35px_rgba(30,16,10,0.55)]"
      >
        {/* Steam Animation when Hot */}
        {isHot && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <motion.div
              animate={{
                opacity: [0, 0.45, 0],
                y: [10, -40],
                scale: [0.9, 1.2],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-t from-white/30 to-transparent blur-xl"
            />
          </div>
        )}

        {/* Outer Saucer */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FAF5EC] via-[#EFE5D3] to-[#D9CBB7] p-[5%] shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),inset_0_-8px_16px_rgba(70,45,30,0.25)] flex items-center justify-center">
          {/* Saucer Inner Ring Depression */}
          <div className="w-[84%] h-[84%] rounded-full border border-[#D5C2AA]/60 bg-gradient-to-tl from-[#E5D5BF] via-[#F4EDE0] to-[#FAF5EC] shadow-[inset_0_4px_8px_rgba(90,60,40,0.15)] flex items-center justify-center relative">
            
            {/* Cup Handle (extending to the bottom-left at 225 deg angle, just like user image) */}
            <div 
              className="absolute -bottom-4 -left-1 w-7 h-11 sm:w-9 sm:h-14 bg-gradient-to-r from-[#EDE2CE] to-[#FAF6EE] rounded-full border-2 border-[#D3C1A8] shadow-[0_6px_10px_rgba(30,18,12,0.35)] -rotate-45 z-0" 
            />

            {/* Ceramic Cup Body Rim */}
            <div className="relative w-[75%] h-[75%] rounded-full bg-gradient-to-br from-[#FFFFFF] via-[#F6EFE3] to-[#DDD0BE] p-[4%] shadow-[0_12px_24px_rgba(43,27,20,0.4),inset_0_3px_6px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(70,45,30,0.3)] z-10 flex items-center justify-center">
              
              {/* Cup Interior Liquid / Crema */}
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-[inset_0_8px_16px_rgba(40,20,10,0.7),inset_0_-6px_10px_rgba(255,200,140,0.2)] flex items-center justify-center">
                
                {/* Coffee Base Liquid */}
                <div className={`absolute inset-0 ${
                  isHot 
                    ? 'bg-gradient-to-br from-[#663A1D] via-[#854F27] to-[#452310]' 
                    : 'bg-gradient-to-br from-[#3B2011] via-[#5C331A] to-[#1F0F08]'
                }`} />

                {/* Micro Crema Texture */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#D69B56_1px,transparent_1px)] [background-size:6px_6px]" />

                {/* Latte Art Layer */}
                <div className="relative w-[86%] h-[86%] flex items-center justify-center">
                  <LatteArtDisplay type={drink.latteArt} isHot={isHot} />
                </div>

                {/* Specular Highlight Gloss across Cup Rim & Liquid */}
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-white/35 to-transparent rounded-full blur-md pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};

// Realistic Vector Coffee Bean
const CoffeeBeanSvg: React.FC<{ rotation: number }> = ({ rotation }) => (
  <svg 
    viewBox="0 0 100 65" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: `rotate(${rotation}deg)` }}
    className="w-full h-full transition-transform"
  >
    <defs>
      <radialGradient id="beanGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#6E432A" />
        <stop offset="50%" stopColor="#4A2A19" />
        <stop offset="100%" stopColor="#25120A" />
      </radialGradient>
      <filter id="beanShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#1B0F09" floodOpacity="0.65" />
      </filter>
    </defs>
    {/* Bean Outer Silhouette */}
    <ellipse cx="50" cy="32.5" rx="46" ry="29" fill="url(#beanGrad)" filter="url(#beanShadow)" />
    {/* Specular curved reflection */}
    <path 
      d="M20 22 C 32 14, 60 14, 76 22" 
      stroke="#966141" 
      strokeWidth="4" 
      strokeLinecap="round" 
      opacity="0.5" 
      filter="blur(1px)"
    />
    {/* Iconic Center Crease of Roasted Coffee Bean */}
    <path 
      d="M 12 33 Q 35 27 50 32 T 88 32" 
      stroke="#140804" 
      strokeWidth="6.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M 14 33 Q 36 29 50 33 T 86 33" 
      stroke="#7D492D" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      opacity="0.75"
    />
  </svg>
);

// High-fidelity Latte Art Styles
const LatteArtDisplay: React.FC<{ type: string; isHot: boolean }> = ({ type, isHot }) => {
  if (!isHot) {
    // Iced drink styling: glass ice cubes with golden crema swirl
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Swirling cream in iced brew */}
        <path d="M20 50 Q 40 20 70 35 T 85 70 Q 60 85 30 75 Z" fill="#F8EEDB" opacity="0.8" filter="blur(2px)" />
        <path d="M35 40 Q 55 30 75 45 T 60 70 Z" fill="#E6CBA3" opacity="0.65" filter="blur(1px)" />
        {/* Floating ice cubes */}
        <rect x="30" y="32" width="22" height="22" rx="4" transform="rotate(15 41 43)" fill="white" fillOpacity="0.45" stroke="#FFFFFF" strokeWidth="1.5" />
        <rect x="52" y="48" width="20" height="20" rx="4" transform="rotate(-12 62 58)" fill="white" fillOpacity="0.4" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  switch (type) {
    case 'rosette':
      // Rosetta feather fern pattern (matching reference Vanilla Latte)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md" fill="none">
          {/* Main stem */}
          <path d="M 50 82 Q 50 50 50 20" stroke="#FAF2E4" strokeWidth="4" strokeLinecap="round" />
          {/* Top Heart Tip */}
          <path d="M 44 23 C 44 18 48 16 50 20 C 52 16 56 18 56 23 C 56 28 50 32 50 32 C 50 32 44 28 44 23 Z" fill="#FAF2E4" />
          {/* Feather tiers */}
          <path d="M 32 36 Q 50 42 68 36" stroke="#FAF2E4" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 28 46 Q 50 52 72 46" stroke="#FAF2E4" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 26 56 Q 50 62 74 56" stroke="#FAF2E4" strokeWidth="6" strokeLinecap="round" />
          <path d="M 30 66 Q 50 72 70 66" stroke="#FAF2E4" strokeWidth="6" strokeLinecap="round" />
          <path d="M 36 75 Q 50 80 64 75" stroke="#FAF2E4" strokeWidth="5" strokeLinecap="round" />
          {/* Warm Crema Accents */}
          <circle cx="50" cy="50" r="38" stroke="#8C4E24" strokeWidth="3" opacity="0.3" filter="blur(2px)" />
        </svg>
      );

    case 'tulip':
      // Multi-layer stacked tulip for Flat White
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md" fill="none">
          {/* Central draw-through line */}
          <path d="M 50 85 L 50 20" stroke="#FAF2E4" strokeWidth="3.5" strokeLinecap="round" />
          {/* Top Heart */}
          <path d="M 43 25 C 43 18 48 16 50 20 C 52 16 57 18 57 25 C 57 32 50 36 50 36 C 50 36 43 32 43 25 Z" fill="#FAF2E4" />
          {/* Tier 2 */}
          <path d="M 36 42 C 36 34 46 36 50 40 C 54 36 64 34 64 42 C 64 50 50 54 50 54 C 50 54 36 50 36 42 Z" fill="#FAF2E4" />
          {/* Tier 3 */}
          <path d="M 30 58 C 30 48 44 50 50 54 C 56 50 70 48 70 58 C 70 67 50 70 50 70 C 50 70 30 67 30 58 Z" fill="#FAF2E4" />
          {/* Base Wing */}
          <path d="M 28 72 C 34 68 46 72 50 76 C 54 72 66 68 72 72 C 65 80 50 84 50 84 C 50 84 35 80 28 72 Z" fill="#FAF2E4" />
        </svg>
      );

    case 'cinnamon':
      // Cinnamon dusted spiral swirl
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Swirl milk foam */}
          <path d="M 50 50 m -28, 0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0" fill="#FAF2E4" opacity="0.9" />
          <path d="M 50 50 m -16, 0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0" fill="#EAD5BA" opacity="0.8" />
          {/* Cinnamon powder speckles and swirl */}
          <path d="M 32 40 Q 50 25 68 42 T 50 68 T 40 50" stroke="#7E3A1A" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 4" />
          <circle cx="38" cy="34" r="1.5" fill="#5F260E" />
          <circle cx="62" cy="38" r="1.8" fill="#5F260E" />
          <circle cx="48" cy="56" r="1.5" fill="#5F260E" />
          <circle cx="56" cy="64" r="2" fill="#5F260E" />
          <circle cx="44" cy="44" r="1.8" fill="#5F260E" />
          <circle cx="66" cy="58" r="1.5" fill="#5F260E" />
          <circle cx="34" cy="58" r="1.5" fill="#5F260E" />
        </svg>
      );

    case 'crema':
    default:
      // Intense espresso crema with rich hazelnut tiger flecks & tender heart
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <circle cx="50" cy="50" r="42" fill="#99582A" opacity="0.85" />
          {/* Tiger mottling */}
          <path d="M 30 35 Q 45 30 65 34" stroke="#5A2E12" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 26 52 Q 48 46 72 50" stroke="#5A2E12" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M 34 68 Q 52 64 68 66" stroke="#5A2E12" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          {/* Petite macchiato dollop */}
          <circle cx="50" cy="48" r="10" fill="#FAF2E4" opacity="0.95" />
          <path d="M 50 40 L 50 58" stroke="#FAF2E4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
