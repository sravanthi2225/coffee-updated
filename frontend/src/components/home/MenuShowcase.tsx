import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { Coffee, IceCreamCone, Croissant, Sparkles } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { FlagshipMenuShowcase } from '../menu/FlagshipMenuShowcase';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'espresso' | 'cold-brew' | 'pastries';
  hasSteam?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'espresso-single',
    name: 'Single Origin Espresso',
    description: 'Intense, rich shot with golden crema. Ethiopian Yirgacheffe.',
    price: 195,
    image: '/images/types/espresso.jpg',
    category: 'espresso',
    hasSteam: true,
  },
  {
    id: 'caffe-latte',
    name: 'Caffè Latte',
    description: 'Silky steamed milk meets a double-shot of espresso perfection.',
    price: 275,
    image: '/images/types/latte.jpg',
    category: 'espresso',
    hasSteam: true,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    description: 'Velvety foam dome with a dusting of artisan cocoa.',
    price: 260,
    image: '/images/types/cappuccino.jpg',
    category: 'espresso',
    hasSteam: true,
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    description: 'Bold double ristretto with micro-textured milk. No stiff foam.',
    price: 275,
    image: '/images/types/flat-white.jpg',
    category: 'espresso',
    hasSteam: true,
  },
  {
    id: 'cold-brew-classic',
    name: 'Classic Cold Brew',
    description: '18-hour steeped concentrate over hand-cut ice. Smooth & bold.',
    price: 250,
    image: '/images/types/americano.jpg',
    category: 'cold-brew',
  },
  {
    id: 'cold-brew-vanilla',
    name: 'Vanilla Oat Cold Brew',
    description: 'House-made vanilla syrup meets cold brew and creamy oat milk.',
    price: 295,
    image: '/images/types/mocha.jpg',
    category: 'cold-brew',
  },
  {
    id: 'almond-croissant',
    name: 'Almond Croissant',
    description: 'Twice-baked, filled with frangipane, dusted with powdered sugar.',
    price: 220,
    image: '/images/sections/gallery-sweet-pairings.jpg',
    category: 'pastries',
  },
  {
    id: 'banana-bread',
    name: 'Banana Walnut Bread',
    description: 'Dense, moist, studded with toasted walnuts. Served warm.',
    price: 195,
    image: '/images/sections/gallery-place-to-unwind.jpg',
    category: 'pastries',
  },
];

const TABS = [
  { id: 'espresso' as const, label: 'Espresso', icon: Coffee },
  { id: 'cold-brew' as const, label: 'Cold Brew', icon: IceCreamCone },
  { id: 'pastries' as const, label: 'Pastries', icon: Croissant },
];

// Steam wisp SVG for card hover
const SteamWisp: React.FC<{ active: boolean }> = ({ active }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll('.wisp-path');

    if (active) {
      animRef.current = animate(paths, {
        translateY: [0, -24],
        opacity: [0.6, 0],
        scaleX: [1, 1.4],
        ease: 'outSine',
        duration: 2000,
        loop: true,
        delay: stagger(250),
      });
    } else {
      animRef.current?.pause();
      // Reset
      animate(paths, { translateY: 0, opacity: 0, duration: 0 });
    }

    return () => { animRef.current?.pause(); };
  }, [active]);

  return (
    <svg ref={svgRef} className="steam-wisp-container w-12 h-10 -top-8" viewBox="0 0 40 32" fill="none">
      <path className="wisp-path" d="M12 28C11 22 14 20 12 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0" />
      <path className="wisp-path" d="M20 28C19 21 22 19 20 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0" />
      <path className="wisp-path" d="M28 28C27 22 30 20 28 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0" />
    </svg>
  );
};

// Price count-up component
const PriceTag: React.FC<{ price: number }> = ({ price }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const obj = { val: 0 };
          animate(obj, {
            val: price,
            duration: 1200,
            ease: 'outExpo',
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent = `₹${Math.round(obj.val)}`;
              }
            },
          });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [price]);

  return (
    <span ref={ref} className="font-serif text-xl sm:text-2xl font-bold text-[#1C0E07]">
      ₹{Math.round(price)}
    </span>
  );
};

export const MenuShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'espresso' | 'cold-brew' | 'pastries'>('espresso');
  const filteredItems = MENU_ITEMS.filter((item) => item.category === activeTab);
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative w-full bg-[#FAF6EE] py-16 sm:py-24 overflow-hidden select-none">
      {/* Corner botanicals */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 0.3, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute -top-6 -right-6 w-48 sm:w-64 pointer-events-none z-[1]"
      >
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform rotate-90" />
      </motion.div>

      {/* ── 1. Flagship Singapore Menu Series (Featured First) ── */}
      <FlagshipMenuShowcase className="mb-20 sm:mb-28" />

      {/* ── 2. Artisan Bakery & Classic Brews Sub-Section ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-8 border-t border-[#EFE2CF]">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE2CF] text-[#8C6239] text-[10.5px] font-bold uppercase tracking-[0.22em] mb-2.5">
            <Sparkles className="w-3 h-3 text-[#C08A4E]" />
            <span>Café Classics &amp; Bakery</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1B14] tracking-tight">
            Fresh Hearth Pastries &amp; Cold Brews
          </h3>
          <p className="text-xs sm:text-sm text-[#5A3B2E]/75 mt-1">
            Twice-baked almond croissants, walnut banana bread, and 18-hour slow cold-drip concentrates.
          </p>
        </div>

        {/* Filter Tabs - Scroll Slide-Up */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-1 sm:gap-2 mb-10 relative"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-7 py-2 sm:py-3 rounded-full text-[11px] sm:text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-[#FDF8F0]'
                    : 'text-[#5A3B2E] hover:text-[#2B1B14]'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="menuTabIndicator"
                    className="absolute inset-0 bg-[#1C0E07] rounded-full z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Menu Cards - Scroll Slide-Up */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, index) => (
                <MenuCard key={item.id} item={item} index={index} reducedMotion={reducedMotion} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

// Individual Menu Card with Framer Motion hover + Anime.js steam
const MenuCard: React.FC<{ item: MenuItem; index: number; reducedMotion?: boolean }> = ({ item, index, reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reducedMotion ? undefined : { scale: 1.05, y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-[22px] border border-[#E9DEC8] shadow-[0_6px_22px_rgba(40,20,10,0.06)] hover:shadow-[0_18px_38px_rgba(40,20,10,0.14)] transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFE5D5]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Steam wisp on hover */}
        {item.hasSteam && <SteamWisp active={isHovered} />}

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-[#F4E6D2] text-[#482815] text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C0E07] tracking-tight">{item.name}</h3>
        <p className="text-[11px] sm:text-xs text-[#554033] leading-relaxed mt-1.5 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F0E4D3]">
          <PriceTag price={item.price} />
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-4 py-1.5 rounded-full bg-[#1C0E07] hover:bg-[#361B0E] text-[#FDF8F0] text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            Add to Order
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
