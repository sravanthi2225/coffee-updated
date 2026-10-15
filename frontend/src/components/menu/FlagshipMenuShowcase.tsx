import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Coffee, 
  Award, 
  Check, 
  Plus, 
  ShoppingBag, 
  Info, 
  Flame, 
  X, 
  ChevronRight,
  Droplets,
  Heart,
  SlidersHorizontal
} from 'lucide-react';
import { FLAGSHIP_MENU_SERIES, FlagshipSeries, FlagshipDrink } from '../../data/singaporeMenuSeries';
import { useCart } from '../../context/CartContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FlagshipMenuShowcaseProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const FlagshipMenuShowcase: React.FC<FlagshipMenuShowcaseProps> = ({
  className = '',
  theme = 'light',
}) => {
  // Default to showing all coffees first, then filter when a category is selected
  const [activeSeriesId, setActiveSeriesId] = useState<string>('all');
  const [selectedDrink, setSelectedDrink] = useState<FlagshipDrink | null>(null);
  const [addedDrinkId, setAddedDrinkId] = useState<string | null>(null);
  
  // Customization state for modal
  const [selectedTemp, setSelectedTemp] = useState<'Iced' | 'Hot'>('Iced');
  const [selectedSugar, setSelectedSugar] = useState<string>('Regular (50%)');
  const [selectedIce, setSelectedIce] = useState<string>('Regular Ice');
  const [modalAdded, setModalAdded] = useState(false);

  const { addToCart } = useCart();
  const reducedMotion = useReducedMotion();

  // Aggregate all coffees across every series
  const allDrinks = useMemo(() => FLAGSHIP_MENU_SERIES.flatMap((s) => s.drinks), []);
  const isAll = activeSeriesId === 'all';

  const allSeriesPlaceholder: FlagshipSeries = useMemo(() => ({
    id: 'all',
    title: 'All Coffee Creations',
    subtitle: 'Full Specialty Repertoire',
    tagline: 'Singapore\'s Most Celebrated Specialty Lineup',
    bannerImg: '/images/menu/banners/banner-signature-lattes.png',
    bannerVideo: '/videos/signature-lattes.mp4',
    accentColor: '#C59B63',
    badge: `${allDrinks.length} Specialties`,
    badgeIcon: 'Sparkles',
    description: 'Explore our entire handcrafted coffee menu, from single-origin espressos and layered coconut lattes to refreshing fruit americanos.',
    drinks: allDrinks,
  }), [allDrinks]);

  const currentSeries = isAll
    ? allSeriesPlaceholder
    : FLAGSHIP_MENU_SERIES.find((s) => s.id === activeSeriesId) || FLAGSHIP_MENU_SERIES[0];

  const displayedDrinks = isAll ? allDrinks : currentSeries.drinks;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSeries.id, currentSeries.bannerVideo]);

  const handleQuickAdd = (drink: FlagshipDrink, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = addToCart({
      id: drink.id,
      name: drink.name,
      description: drink.description,
      flavorNotes: drink.flavorNotes,
      price: drink.price,
      image: drink.image,
      category: 'coffee',
      roastLevel: 'Medium Dark',
      size: 'Regular',
      notes: drink.flavorNotes,
    });

    if (added !== false) {
      setAddedDrinkId(drink.id);
      setTimeout(() => {
        setAddedDrinkId(null);
      }, 1800);
    }
  };

  const handleOpenCustomize = (drink: FlagshipDrink) => {
    setSelectedDrink(drink);
    setSelectedTemp(drink.temperature[0] || 'Iced');
    setSelectedSugar('Regular (50%)');
    setSelectedIce('Regular Ice');
    setModalAdded(false);
  };

  const handleModalAddToCart = () => {
    if (!selectedDrink) return;
    const added = addToCart({
      id: `${selectedDrink.id}-${selectedTemp}-${selectedSugar}`,
      name: `${selectedDrink.name} (${selectedTemp})`,
      description: selectedDrink.description,
      flavorNotes: selectedDrink.flavorNotes,
      price: selectedDrink.price,
      image: selectedDrink.image,
      category: 'coffee',
      roastLevel: 'Specialty Master',
      size: 'Regular',
      notes: [...selectedDrink.flavorNotes, selectedSugar, selectedIce],
    });
    if (added !== false) {
      setModalAdded(true);
      setTimeout(() => {
        setModalAdded(false);
        setSelectedDrink(null);
      }, 1200);
    }
  };

  const isDark = theme === 'dark';

  return (
    <section className={`w-full relative select-none ${className}`}>

      {/* ── Full-Screen Landscape Video Banner (Seamless edge-to-edge flush with fixed navbar) ── */}
      <div className="w-full relative overflow-hidden bg-[#1E0F07] border-b border-[#3E2416] shadow-[0_16px_40px_rgba(0,0,0,0.4)] h-[340px] sm:h-[380px] md:h-[420px] lg:h-[450px]">
        {/* Top Navbar Shadow Vignette for flawless contrast with header */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`banner-${currentSeries.id}`}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
        {currentSeries.bannerVideo ? (
              <video
                ref={videoRef}
                key={currentSeries.bannerVideo}
                src={currentSeries.bannerVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-[center_32%] sm:object-[center_30%]"
              />
            ) : currentSeries.id === 'fruity-americano' ? (
              /* ── Premium Multi-Photo Collage Banner for Fruity Americano ── */
              <>
                {/* Two-panel layout: left dark info panel + right 2×2 drink grid */}
                <div className="absolute inset-0 flex">
                  {/* Left info panel — deep dark with gradient */}
                  <div className="w-[38%] sm:w-[32%] lg:w-[28%] shrink-0 bg-gradient-to-br from-[#0D1A10] via-[#132918] to-[#0A1509] flex flex-col justify-center px-5 sm:px-8 lg:px-10 py-6 z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full bg-white/10 backdrop-blur border border-[#5D9E6C]/40 text-[#86EFAC] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest w-fit">
                      <Sparkles className="w-3 h-3" />
                      <span>Guilt Free</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#FFF8F0] tracking-tight leading-tight mb-2 sm:mb-3 drop-shadow">
                      Fruity<br/>Americano
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#C8E6CA]/80 leading-relaxed hidden sm:block max-w-[200px]">
                      Vibrant sparkling fruit juices layered with aromatic specialty espresso. 100% real juice, fat free.
                    </p>
                    <div className="hidden sm:flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <span className="font-serif text-base font-bold text-[#86EFAC] block">100%</span>
                        <span className="text-[9px] text-[#A7D7B0] uppercase tracking-wider">Real Juice</span>
                      </div>
                      <div className="w-px h-6 bg-white/15" />
                      <div className="text-center">
                        <span className="font-serif text-base font-bold text-[#86EFAC] block">0g</span>
                        <span className="text-[9px] text-[#A7D7B0] uppercase tracking-wider">Fat</span>
                      </div>
                      <div className="w-px h-6 bg-white/15" />
                      <div className="text-center">
                        <span className="font-serif text-base font-bold text-[#86EFAC] block">4</span>
                        <span className="text-[9px] text-[#A7D7B0] uppercase tracking-wider">Flavors</span>
                      </div>
                    </div>
                  </div>
                  {/* Right 2×2 photo grid */}
                  <div className="flex-1 grid grid-cols-2 grid-rows-2">
                    <div className="overflow-hidden relative">
                      <img src="/images/menu/drinks/orange-americano.jpg" alt="Orange Americano" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold text-white/90 tracking-wider uppercase hidden sm:block">Orange</span>
                    </div>
                    <div className="overflow-hidden relative">
                      <img src="/images/menu/drinks/pomelo-americano.jpg" alt="Pomelo Americano" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold text-white/90 tracking-wider uppercase hidden sm:block">Pomelo</span>
                    </div>
                    <div className="overflow-hidden relative">
                      <img src="/images/menu/drinks/apple-fizzy-americano.jpg" alt="Apple Fizzy Americano" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold text-white/90 tracking-wider uppercase hidden sm:block">Apple Fizzy</span>
                    </div>
                    <div className="overflow-hidden relative">
                      <img src="/images/menu/drinks/grape-fizzy-americano.jpg" alt="Grape Fizzy Americano" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] font-semibold text-white/90 tracking-wider uppercase hidden sm:block">Grape Fizzy</span>
                    </div>
                  </div>
                </div>
                {/* Top Navbar Vignette for contrast with header */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-20" />
              </>
            ) : currentSeries.id === 'matcha' ? (
              /* ── Premium Editorial Banner for Matcha Series ── */
              <>
                <div className="absolute inset-0 flex">
                  {/* Left: large hero drink photo — the jade green glass fills the space beautifully */}
                  <div className="flex-1 relative overflow-hidden">
                    <img
                      src="/images/menu/drinks/matcha-latte.jpg"
                      alt="Matcha Series"
                      className="w-full h-full object-cover object-center scale-110 hover:scale-[1.15] transition-transform duration-1000 ease-out"
                    />
                    {/* Right-edge fade into info panel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A1F10]/90 pointer-events-none" />
                    {/* Top navbar vignette */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                  </div>

                  {/* Right: deep jade info panel */}
                  <div className="w-[42%] sm:w-[36%] lg:w-[32%] shrink-0 bg-gradient-to-bl from-[#071510] via-[#0D2416] to-[#071510] flex flex-col justify-center px-5 sm:px-8 lg:px-10 py-6 relative">
                    {/* Subtle texture accent */}
                    <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, #4ade80 0%, transparent 60%)'}} />
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full bg-white/8 backdrop-blur border border-[#4ade80]/25 text-[#86EFAC] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest w-fit">
                      <Sparkles className="w-3 h-3" />
                      <span>First-Harvest Japanese</span>
                    </div>
                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F0FDF4] tracking-tight leading-tight mb-2 sm:mb-3">
                      Matcha<br/>Series
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#BBF7D0]/70 leading-relaxed hidden sm:block max-w-[220px] mb-4">
                      Stone-ground Japanese green tea leaves whisked with silky milk, oat cream, and tropical coconut.
                    </p>
                    {/* Stats row */}
                    <div className="hidden sm:flex items-center gap-3 pt-4 border-t border-[#4ade80]/15">
                      <div className="text-center">
                        <span className="font-serif text-sm font-bold text-[#4ade80] block">First</span>
                        <span className="text-[9px] text-[#86EFAC]/70 uppercase tracking-wider">Harvest</span>
                      </div>
                      <div className="w-px h-5 bg-white/10" />
                      <div className="text-center">
                        <span className="font-serif text-sm font-bold text-[#4ade80] block">100%</span>
                        <span className="text-[9px] text-[#86EFAC]/70 uppercase tracking-wider">Japanese</span>
                      </div>
                      <div className="w-px h-5 bg-white/10" />
                      <div className="text-center">
                        <span className="font-serif text-sm font-bold text-[#4ade80] block">4</span>
                        <span className="text-[9px] text-[#86EFAC]/70 uppercase tracking-wider">Variations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={currentSeries.bannerImg}
                alt={currentSeries.title}
                className="w-full h-full object-cover object-[center_52%] sm:object-[center_48%] hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            )}
            
            {/* Dark gradient and overlay text only when displaying a standard single static image series */}
            {!currentSeries.bannerVideo && currentSeries.id !== 'fruity-americano' && currentSeries.id !== 'matcha' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none hidden sm:block" />
                <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 z-20">
                  <div className="space-y-1.5 sm:space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C59B63]/40 text-[#E8C28A] text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                      <Award className="w-3.5 h-3.5 text-[#C59B63]" />
                      <span>{currentSeries.subtitle}</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF8F0] tracking-tight drop-shadow-md">
                      {currentSeries.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#E6DACB] leading-relaxed hidden sm:block drop-shadow max-w-lg">
                      {currentSeries.description}
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs font-medium text-[#FFF8F0] shadow-md">
                    <Sparkles className="w-4 h-4 text-[#C59B63]" />
                    <span>{displayedDrinks.length} Specialty Recipes in {isAll ? 'Menu' : 'Series'}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Series Showcase & Drinks Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Category & Series Selector Pills — strictly single row, never cropped */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 my-4 sm:my-6 px-2 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap w-max min-w-full justify-start lg:justify-center px-2">
            {/* Default 'All Coffees' Button */}
            <button
              onClick={() => setActiveSeriesId('all')}
              className={`relative shrink-0 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                isAll
                  ? 'bg-[#1C0E07] text-[#FFF8F0] shadow-md shadow-[#1C0E07]/25 font-bold border border-[#C59B63]'
                  : 'bg-white/95 hover:bg-white text-[#5A3B2E] border border-[#EFE2CF] hover:border-[#C59B63]/60 shadow-sm'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isAll ? 'text-[#E8C28A]' : 'text-[#8C6239]'}`} />
              <span className="whitespace-nowrap">All Coffees</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                isAll ? 'bg-[#C59B63]/30 text-[#E8C28A]' : 'bg-[#FAF6EE] text-[#8C6239]'
              }`}>
                {allDrinks.length}
              </span>
            </button>

            {FLAGSHIP_MENU_SERIES.map((series) => {
              const isActive = !isAll && series.id === activeSeriesId;
              const shortBadge = series.badge === 'Craft Heritage' ? 'Heritage' 
                : series.badge === 'Ceremonial Uji' ? 'Uji' 
                : series.badge;
              const displayTitle = series.id === 'single-origin-espresso' ? 'Single Origin' : series.title;

              return (
                <button
                  key={series.id}
                  onClick={() => setActiveSeriesId(series.id)}
                  className={`relative shrink-0 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1C0E07] text-[#FFF8F0] shadow-md shadow-[#1C0E07]/25 font-bold border border-[#C59B63]'
                      : 'bg-white/95 hover:bg-white text-[#5A3B2E] border border-[#EFE2CF] hover:border-[#C59B63]/60 shadow-sm'
                  }`}
                >
                  <Coffee className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#E8C28A]' : 'text-[#8C6239]'}`} />
                  <span className="whitespace-nowrap">{displayTitle}</span>
                  {shortBadge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium uppercase tracking-wider hidden sm:inline-block ${
                      isActive ? 'bg-[#C59B63]/30 text-[#E8C28A]' : 'bg-[#FAF6EE] text-[#8C6239]'
                    }`}>
                      {shortBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`drinks-${activeSeriesId}`}
            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Drinks Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#EFE2CF]">
                <div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-[#2B1B14]">
                    {isAll ? 'All Handcrafted Coffee Selections' : `Featured ${currentSeries.title} Selections`}
                  </h4>
                  <p className="text-xs text-[#5A3B2E]/75">
                    Showing {displayedDrinks.length} beverages • Click any beverage to customize ice, sweetness, and temperature.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#C08A4E]">
                  Nutri-Grade Certified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {displayedDrinks.map((drink, idx) => (
                  <motion.div
                    key={drink.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => handleOpenCustomize(drink)}
                    className="group relative bg-white rounded-3xl border border-[#EBE1D0] hover:border-[#C59B63] shadow-[0_4px_20px_rgba(43,27,20,0.05)] hover:shadow-[0_16px_36px_rgba(197,155,99,0.18)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
                  >
                    {/* Top Image Viewport */}
                    <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-[#F9F5EE] to-[#EFE7D8] overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="max-h-full max-w-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out shadow-sm"
                        loading="lazy"
                      />

                      {/* Nutri-Grade Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black tracking-tighter text-white shadow-sm ${
                          drink.nutriGrade === 'A' 
                            ? 'bg-[#10B981]' 
                            : drink.nutriGrade === 'B' 
                            ? 'bg-[#84CC16]' 
                            : 'bg-[#F59E0B]'
                        }`}>
                          {drink.nutriGrade}
                        </span>
                        <span className="bg-black/70 backdrop-blur-sm text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                          {drink.sugarLevel}
                        </span>
                      </div>

                      {/* Top Pick Pill */}
                      {drink.isTopPick && (
                        <div className="absolute top-3 right-3 bg-[#C59B63] text-[#1E0F07] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                          Top Pick
                        </div>
                      )}

                      {/* Temperature Badges */}
                      <div className="absolute bottom-2.5 left-3 flex gap-1">
                        {drink.temperature.map((t) => (
                          <span
                            key={t}
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                              t === 'Iced'
                                ? 'bg-cyan-500/10 text-cyan-800 border border-cyan-500/30'
                                : 'bg-orange-500/10 text-orange-800 border border-orange-500/30'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-base sm:text-lg font-bold text-[#2B1B14] group-hover:text-[#8C6239] transition-colors leading-snug">
                            {drink.name}
                          </h4>
                          <span className="font-serif text-base sm:text-lg font-bold text-[#2B1B14] shrink-0">
                            ₹{Math.round(drink.price)}
                          </span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-[#5A3B2E]/75 line-clamp-2 mt-1.5 leading-relaxed">
                          {drink.description}
                        </p>

                        {/* Flavor Note Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {drink.flavorNotes.map((note) => (
                            <span
                              key={note}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF4EA] border border-[#EFE2CF] text-[#8C6239] font-medium"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Action Row */}
                      <div className="pt-4 mt-4 border-t border-[#F0E6D6] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomize(drink);
                          }}
                          className="text-[11px] font-mono font-bold text-[#8C6239] hover:text-[#2B1B14] flex items-center gap-1 transition-colors"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Customize</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(drink, e)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm ${
                            addedDrinkId === drink.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#2B1B14] hover:bg-[#4A2E1C] text-[#FFF8F0] active:scale-95'
                          }`}
                        >
                          {addedDrinkId === drink.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CUSTOMIZE & TASTE NOTES LIGHTBOX MODAL */}
      {selectedDrink && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedDrink(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl border-2 border-[#C59B63]/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EFE2CF] bg-[#FAF6EE]">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                  selectedDrink.nutriGrade === 'A' ? 'bg-emerald-500' : selectedDrink.nutriGrade === 'B' ? 'bg-lime-500' : 'bg-amber-500'
                }`}>
                  {selectedDrink.nutriGrade}
                </span>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2B1B14]">
                    {selectedDrink.name}
                  </h3>
                  <p className="text-[11px] text-[#8C6239] font-mono">
                    Nutri-Grade {selectedDrink.nutriGrade} • {selectedDrink.calories}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDrink(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#2B1B14] text-[#2B1B14] hover:text-white flex items-center justify-center transition-all border border-[#EFE2CF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product Spotlight */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FAF6EE] border border-[#EFE2CF]">
                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-xl p-2 flex items-center justify-center shadow-inner">
                  <img
                    src={selectedDrink.image}
                    alt={selectedDrink.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-[#5A3B2E]/90 leading-relaxed">
                    {selectedDrink.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDrink.flavorNotes.map((note) => (
                      <span key={note} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-[#EFE2CF] text-[#8C6239] font-bold">
                        ✦ {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Temperature Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#2B1B14] mb-2">
                  Temperature
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {selectedDrink.temperature.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTemp(t)}
                      className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                        selectedTemp === t
                          ? 'bg-[#2B1B14] text-white border-[#2B1B14] shadow-sm'
                          : 'bg-[#FAF6EE] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C59B63]'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#2B1B14] mb-2">
                  Sweetness Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['0% Sugar', 'Less (30%)', 'Regular (50%)', 'Full (100%)'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSugar(s)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all border ${
                        selectedSugar === s
                          ? 'bg-[#2B1B14] text-white border-[#2B1B14]'
                          : 'bg-[#FAF6EE] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C59B63]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level (if Iced) */}
              {selectedTemp === 'Iced' && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#2B1B14] mb-2">
                    Ice Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['No Ice', 'Less Ice', 'Regular Ice'].map((ice) => (
                      <button
                        key={ice}
                        type="button"
                        onClick={() => setSelectedIce(ice)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all border ${
                          selectedIce === ice
                            ? 'bg-[#2B1B14] text-white border-[#2B1B14]'
                            : 'bg-[#FAF6EE] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C59B63]'
                        }`}
                      >
                        {ice}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#EFE2CF] bg-[#FAF6EE] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8C6239] block uppercase">Total Amount</span>
                <span className="font-serif text-2xl font-bold text-[#2B1B14]">
                  ₹{Math.round(selectedDrink.price)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleModalAddToCart}
                className={`px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md ${
                  modalAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2B1B14] hover:bg-[#4A2E1C] text-[#FFF8F0]'
                }`}
              >
                {modalAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
