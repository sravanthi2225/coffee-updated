import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Droplet, BarChart2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoffeeCardData {
  id: string;
  badge: string;
  name: string;
  tagline: string;
  description: string;
  ratio: string;
  strength: number;
  image: string;
}

export const TypesTeaser: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string>('espresso');

  const coffeeTypes: CoffeeCardData[] = [
    {
      id: 'espresso',
      badge: 'CLASSIC',
      name: 'Espresso',
      tagline: 'The Heart of Every Cup',
      description: 'Concentrated and rich, the shot unlocks the best of pure coffee, intense, rich, with a velvety finish.',
      ratio: '1:2 (Espresso to Water) – 30g (Liquid Yield)',
      strength: 4,
      image: '/images/types/espresso.jpg',
    },
    {
      id: 'americano',
      badge: 'CLASSIC DRINK',
      name: 'Americano',
      tagline: 'Pure Clarity & Depth',
      description: 'Marked with a rich, intense flavor, the Americano brings out the true character of your coffee.',
      ratio: '1:4 (Double espresso topped with hot water)',
      strength: 2,
      image: '/images/types/americano.jpg',
    },
    {
      id: 'latte',
      badge: 'ROBUSTE FLAVOR',
      name: 'Caffè Latte',
      tagline: 'Silky Harmony of Milk & Bean',
      description: 'The perfect balance for espresso, steamed milk and a touch of foam, creating a smooth, rich taste.',
      ratio: '1:3 (Double espresso + 200ml steamed milk + foam)',
      strength: 3,
      image: '/images/types/latte.jpg',
    },
    {
      id: 'cappuccino',
      badge: 'VELVETY TOUCH',
      name: 'Cappuccino',
      tagline: 'The Classic Italian Golden Trinity',
      description: 'A harmonious blend of espresso, hot milk, and velvety foam, creating a rich and balanced taste.',
      ratio: '1:1:1 (Equal parts espresso, hot milk, and foam)',
      strength: 4,
      image: '/images/types/cappuccino.jpg',
    },
  ];

  return (
    <section className="relative w-full bg-[#0C0603] text-[#FDF8F0] py-20 sm:py-24 lg:py-28 overflow-hidden select-none">
      {/* ── Deep Luxury Atmosphere Gradients ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0402] via-[#120804] to-[#180D07] pointer-events-none" />

      {/* Ambient warm roast glow in center */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(197,155,99,0.14)_0%,transparent_70%)] blur-3xl pointer-events-none z-0" />

      {/* ── Top-Left Decorative Latte Art Cup & Saucer (Matching 2nd Image) ── */}
      <div className="absolute -top-16 -left-16 sm:-top-24 sm:-left-24 w-56 sm:w-80 md:w-96 aspect-square pointer-events-none z-0 opacity-80 select-none">
        <div className="relative w-full h-full rounded-full p-3 bg-gradient-to-br from-[#C59B63]/40 via-[#2B1B14]/80 to-[#0A0402] border border-[#C59B63]/30 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
          <img
            src="/images/types/latte.jpg"
            alt=""
            className="w-full h-full object-cover rounded-full filter brightness-95 contrast-110"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
        </div>
      </div>

      {/* ── Top-Right Floating Coffee Beans & Leaves ── */}
      <div className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-48 sm:w-64 pointer-events-none z-0 opacity-65 select-none">
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto filter contrast-125"
        />
      </div>

      {/* ── Bottom-Left Coffee Beans Accent ── */}
      <div className="absolute -bottom-10 -left-10 w-40 sm:w-56 pointer-events-none z-0 opacity-55 select-none">
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto transform rotate-180 filter contrast-125"
        />
      </div>

      {/* ── Bottom-Right Botanical Leaf Accent ── */}
      <div className="absolute -bottom-12 -right-12 w-48 sm:w-64 pointer-events-none z-0 opacity-60 select-none">
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform rotate-45 filter brightness-105"
        />
      </div>

      {/* ── Main Container ── */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 z-10">
        
        {/* ── Section Header (Find Your Perfect Brew) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            {/* Overline with Gold Hairline Bars */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 sm:w-14 h-[1.5px] bg-[#C59B63]/80" />
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#D4A369] font-sans">
                FIND YOUR PERFECT BREW
              </span>
              <div className="w-10 sm:w-14 h-[1.5px] bg-[#C59B63]/80" />
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-tight">
              The Geometry of Coffee
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#D7C4B5] leading-relaxed font-sans mt-3 max-w-xl opacity-90">
              Every beverage in our repertoire is governed by a precise ratio of single-origin espresso, water, foam, and milk texture.
            </p>
          </div>

          {/* Top-Right Action Button */}
          <div className="shrink-0 self-start md:self-center">
            <Link
              to="/coffee-types"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-black/50 hover:bg-[#C59B63] hover:text-[#120703] text-[#F3D7AB] border border-[#C59B63]/50 text-xs sm:text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_6px_25px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 group"
            >
              <Coffee className="w-4 h-4 text-[#C59B63] group-hover:text-[#120703] transition-colors" />
              <span>Explore All 12 Types</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ── 8 Coffee Cards Grid (4 Columns x 2 Rows) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {coffeeTypes.map((type, index) => {
            const isSelected = selectedCard === type.id;

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedCard(type.id)}
                className={`group relative rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1C100A] border-2 border-[#D4A369] shadow-[0_0_32px_rgba(212,163,105,0.38),0_18px_40px_rgba(0,0,0,0.8)]'
                    : 'bg-[#180E09]/90 border border-[#3E2417]/80 hover:border-[#C59B63]/70 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_18px_38px_rgba(197,155,99,0.18)]'
                }`}
              >
                {/* ── Top Photo Section with Overlaid Badges ── */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#120804]">
                  {/* Top-Left Circular Icon */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/65 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#E8C28A] z-10 shadow-sm">
                    <Coffee className="w-3.5 h-3.5" />
                  </div>

                  {/* Top-Right Pill Badge (CLASSIC, ROBUSTE FLAVOR, etc.) */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[#E8C28A] text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#C59B63]/40 shadow-sm z-10">
                    {type.badge}
                  </div>

                  {/* Coffee Image */}
                  <img
                    src={type.image}
                    alt={type.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Dark gradient fade at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#180E09] via-transparent to-black/25 pointer-events-none" />
                </div>

                {/* ── Card Content ── */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Coffee Name */}
                    <h3 className="font-serif text-xl sm:text-[22px] font-bold text-white tracking-tight group-hover:text-[#E8C28A] transition-colors">
                      {type.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs font-medium text-[#C59B63] mt-1 font-sans">
                      {type.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-[11.5px] text-[#C4B5A5] leading-relaxed mt-2 font-normal line-clamp-2">
                      {type.description}
                    </p>
                  </div>

                  {/* Ratio & Specs */}
                  <div className="mt-4 pt-2.5 border-t border-[#351E13]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#D4A369] font-sans">
                      <Droplet className="w-3 h-3 text-[#C59B63] shrink-0" />
                      <span className="truncate">
                        <span className="font-semibold text-[#F2CF98]">Ratio:</span> {type.ratio}
                      </span>
                    </div>

                    {/* Intensity & Learn More Row */}
                    <div className="mt-3.5 pt-2.5 border-t border-[#2A170F] flex items-center justify-between">
                      {/* 5 Dots Intensity Meter */}
                      <div className="flex items-center gap-1 text-[10.5px] text-[#C4B5A5] font-sans">
                        <BarChart2 className="w-3 h-3 text-[#C59B63] mr-0.5" />
                        <span>Intensity:</span>
                        <div className="flex items-center gap-1 ml-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < type.strength
                                  ? 'bg-[#D4A369] shadow-[0_0_5px_rgba(212,163,105,0.8)]'
                                  : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Learn More Pill Button */}
                      <Link
                        to={`/coffee-types#${type.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-[#C59B63] hover:text-[#120703] border border-[#C59B63]/40 text-[#F5E6D3] text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom Divider: ── GOOD COFFEE • BETTER DAYS ── ── */}
        <div className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-[#3A1F13]/50 text-[10.5px] font-bold uppercase tracking-[0.3em] text-[#C59B63]/80">
          <div className="w-16 sm:w-28 h-[1px] bg-gradient-to-r from-transparent to-[#C59B63]/60" />
          <span className="flex items-center gap-2.5">
            <span>GOOD COFFEE</span>
            <span className="text-[#C59B63]">•</span>
            <span>BETTER DAYS</span>
          </span>
          <div className="w-16 sm:w-28 h-[1px] bg-gradient-to-l from-transparent to-[#C59B63]/60" />
        </div>

      </div>
    </section>
  );
};

export default TypesTeaser;
