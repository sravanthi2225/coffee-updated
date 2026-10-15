import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FeaturedCoffeeItem {
  id: string;
  name: string;
  shortName: string;
  category: string;
  quote: string;
  signature: string;
  accolades: string[];
  flavorNotes: string[];
  image: string;
}

const COFFEE_CREATIONS: FeaturedCoffeeItem[] = [
  {
    id: 'roastery-reserve',
    name: 'Artisan Roastery Reserve',
    shortName: 'Roastery Reserve',
    category: 'Single-Origin Espresso Intenso',
    quote: 'Daring to rise above; Specialty Coffee, it\'s time to break new ground.',
    signature: 'Brew & Bloom Master Roaster',
    accolades: [
      'Specialty Arabica 88+ SCA Certified Single-Origin Reserve',
      'Slow Cast-Iron Drum Roasted at Peak Maturity'
    ],
    flavorNotes: ['Dark Cocoa', 'Roasted Walnut', 'Black Cherry Crema'],
    image: '/images/sections/featured-bg.jpg',
  },
  {
    id: 'velvet-latte',
    name: 'Velvet Vanilla Latte',
    shortName: 'Vanilla Latte',
    category: 'Signature Microfoam Latte Art',
    quote: 'Silky microfoam poured over double-shot espresso creates a velvety tropical sweetness.',
    signature: 'Artisan Microfoam Pour',
    accolades: [
      '86+ SCA Score • Yirgacheffe Heirloom Terroir',
      'Steamed Microfoam Layered at 65°C Sweet Spot'
    ],
    flavorNotes: ['Madagascar Vanilla', 'Sweet Cream', 'Caramelized Honey'],
    image: '/images/types/latte.jpg',
  },
  {
    id: 'espresso-intenso',
    name: 'Single-Origin Espresso',
    shortName: 'Espresso Intenso',
    category: 'Double Ristretto 9-Bar Extraction',
    quote: 'Dense golden crema with deep cocoa notes, extracted under strict 9-bar pressure.',
    signature: 'Precision 9-Bar Extraction',
    accolades: [
      '89+ SCA Certified High-Elevation Arabica',
      '28-Second Peak Extraction Calibration'
    ],
    flavorNotes: ['Golden Crema', 'Toasted Hazelnut', 'Dark Molasses'],
    image: '/images/types/espresso.jpg',
  },
  {
    id: 'artisan-flat-white',
    name: 'Artisan Flat White',
    shortName: 'Flat White',
    category: 'Velvet Ristretto & Rosetta Pour',
    quote: 'A double ristretto extraction poured under a glossy microfoam layer for profound balance.',
    signature: 'Rosetta Master Pour',
    accolades: [
      '87+ SCA Score • Colombian Huila Supremo',
      'Hand-Poured Rosetta Latte Art Finish'
    ],
    flavorNotes: ['Brown Butter', 'Toasted Almond', 'Floral Crema'],
    image: '/images/types/flat-white.jpg',
  },
  {
    id: 'botanical-cappuccino',
    name: 'Botanical Cappuccino',
    shortName: 'Cappuccino',
    category: 'Harmonic Equal Thirds Extraction',
    quote: 'Equal thirds of intense espresso, velvety steamed milk, and a dense cloud of microfoam.',
    signature: 'Morning Hearth Pour',
    accolades: [
      '85+ SCA Score • Highland Specialty Blend',
      'Velvety Microfoam Cushion Infusion'
    ],
    flavorNotes: ['Warm Biscuit', 'Praline', 'Milk Chocolate'],
    image: '/images/types/cappuccino.jpg',
  },
];

export const BaristaChampionshipShowcase: React.FC = () => {
  // 0 = Default featured active item (Roastery Reserve)
  // Switching between 0, 1, 2, 3, 4 dynamically expands the selected coffee
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <section className="relative w-full bg-[#0D0603] text-white py-0 select-none overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          FULL LANDSCAPE EDGE-TO-EDGE SHOWCASE
          - Edge-to-edge full width across the entire viewport
          - Panoramic cinematic landscape height
          - Active item expands to wide landscape hero (~60% width)
          - Non-active items compress to narrow portrait strips (~10% width each)
          - Hover or click smoothly switches active coffee, pushing neighbors aside
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[460px] sm:h-[500px] lg:h-[540px] xl:h-[580px] 2xl:h-[620px] overflow-hidden bg-black border-y border-[#3E2416] shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row">
        
        {COFFEE_CREATIONS.map((coffee, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={coffee.id}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`relative h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? 'flex-[4.5] lg:flex-[5] cursor-default'
                  : 'flex-[0.75] sm:flex-[0.8] lg:flex-[0.85] cursor-pointer hover:brightness-110'
              }`}
              style={{ willChange: 'flex-grow' }}
              title={isActive ? undefined : `Switch to ${coffee.name}`}
            >
              {/* ───────────────────────────────────────────────────
                  ACTIVE EXPANDED STATE (LARGE HERO COFFEE VIEW)
              ─────────────────────────────────────────────────── */}
              {isActive ? (
                <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between p-5 sm:p-7 lg:p-9 xl:p-11">
                  {/* Background Coffee Photograph */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={coffee.image}
                      alt={coffee.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
                    />

                    {/* Soft dark gradient overlays for pristine text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Top Quote Mark & Bold Editorial Headline */}
                  <div className="relative z-10 space-y-2.5 sm:space-y-3 max-w-md sm:max-w-lg xl:max-w-xl">
                    {/* Double Quote Icon (matching reference design) */}
                    <div className="text-white opacity-95">
                      <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8">
                        <path d="M10 8v8H6c0 4.418 3.582 8 8 8v4c-6.627 0-12-5.373-12-12V8h8zm18 0v8h-4c0 4.418 3.582 8 8 8v4c-6.627 0-12-5.373-12-12V8h8z" />
                      </svg>
                    </div>

                    {/* Bold Headline Quote */}
                    <h3 className="font-sans font-extrabold text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight tracking-tight drop-shadow-md">
                      "{coffee.quote}"
                      {/* Signature Warm Coffee Caramel Underline Bar */}
                      <span className="block w-14 sm:w-16 h-1 bg-gradient-to-r from-[#C59B63] to-[#E8C28A] rounded-full mt-1.5" />
                    </h3>

                    {/* Script Signature */}
                    <div className="pt-1">
                      <span className="font-script text-xl sm:text-2xl xl:text-3xl text-white/90 tracking-wide select-none drop-shadow">
                        {coffee.signature}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Coffee Identity & Tasting Accolades */}
                  <div className="relative z-10 pt-3 sm:pt-4">
                    <h4 className="font-sans font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-white tracking-tight drop-shadow-sm">
                      {coffee.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#E8C28A] tracking-wide mt-0.5">
                      {coffee.category}
                    </p>
                    
                    <div className="space-y-1 mt-2.5 text-[11px] sm:text-xs text-white/80 font-sans leading-relaxed">
                      {coffee.accolades.map((item, idx) => (
                        <p key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#C59B63] font-black text-xs">✦</span>
                          <span>{item}</span>
                        </p>
                      ))}
                      <p className="flex items-center gap-1.5 text-white/85 pt-0.5">
                        <span className="text-[#C59B63] font-black text-xs">✦</span>
                        <span className="font-bold text-[#E8C28A]">Flavor Notes:</span>
                        <span>{coffee.flavorNotes.join(' • ')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────
                    NON-ACTIVE COMPRESSED STATE (NARROW PORTRAIT STRIP)
                ───────────────────────────────────────────────── */
                <div className="relative w-full h-full overflow-hidden">
                  {/* Coffee Photograph */}
                  <img
                    src={coffee.image}
                    alt={coffee.name}
                    className="w-full h-full object-cover object-center filter brightness-90 transition-transform duration-500 hover:scale-105"
                  />

                  {/* Dark Tint Overlay */}
                  <div className="absolute inset-0 bg-[#0B1528]/45 sm:bg-black/35 transition-opacity duration-300" />

                  {/* Subtle vertical hairline divider border */}
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-black/50 pointer-events-none" />
                  <div className="absolute inset-y-0 left-0 w-[1px] bg-white/5 pointer-events-none" />

                  {/* Bottom Name Label (matching reference screenshots) */}
                  <div className="absolute bottom-4 sm:bottom-6 inset-x-2 text-center pointer-events-none">
                    <span className="font-sans font-bold text-xs sm:text-[13px] text-white block leading-tight drop-shadow-md">
                      {coffee.shortName}
                    </span>
                  </div>
                </div>
              )}

              {/* Subtle active warm coffee gold accent indicator line */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C59B63] via-[#E8C28A] to-[#C59B63] z-20 pointer-events-none shadow-[0_0_14px_rgba(197,155,99,0.8)]" />
              )}
            </div>
          );
        })}

      </div>
    </section>
  );
};
