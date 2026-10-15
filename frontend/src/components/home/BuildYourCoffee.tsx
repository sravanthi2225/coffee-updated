import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Check, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Coffee, 
  Sparkles, 
  ShoppingBag,
  Heart,
  Droplets,
  Flame,
  Plus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Product } from '../../types/product';

export const BuildYourCoffee: React.FC = () => {
  const { addToCart } = useCart();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // ── Custom Interactive Cursor Spotlight Tracker ──
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveredSection, setIsHoveredSection] = useState(false);

  const springX = useSpring(0, { stiffness: 300, damping: 28 });
  const springY = useSpring(0, { stiffness: 300, damping: 28 });

  const handleMouseMoveSection = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
    springX.set(x);
    springY.set(y);
  };

  // ── Parallax Scrolling Effects ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const leafY = useTransform(scrollYProgress, [0, 1], [-50, 90]);
  const beansY = useTransform(scrollYProgress, [0, 1], [40, -80]);
  const platterY = useTransform(scrollYProgress, [0, 1], [-30, 60]);

  // ── Selections Matching Exactly The Uploaded Image ──
  // Base: Artisan Latte (₹260) + Medium (₹30) + Oat Milk (₹40) + Madagascar Vanilla (₹45) + Extra Espresso Shot (₹50) = ₹425
  const [coffeeType, setCoffeeType] = useState<{ id: string; name: string; basePrice: number; desc: string; image: string }>({
    id: 'latte',
    name: 'Artisan Latte',
    basePrice: 260,
    desc: 'Velvety steamed milk with espresso',
    image: '/images/types/latte.jpg',
  });

  const [size, setSize] = useState<{ label: string; extra: number }>({
    label: 'Medium (12oz)',
    extra: 30,
  });

  const [milk, setMilk] = useState<{ label: string; extra: number }>({
    label: 'Oat Milk',
    extra: 40,
  });

  const [flavor, setFlavor] = useState<{ label: string; extra: number }>({
    label: 'Madagascar Vanilla',
    extra: 45,
  });

  const [selectedExtras, setSelectedExtras] = useState<string[]>(['Extra Espresso Shot']);

  // Options matching reference image exactly
  const coffeeOptions = [
    { id: 'latte', name: 'Artisan Latte', basePrice: 260, desc: 'Velvety steamed milk with espresso', image: '/images/types/latte.jpg' },
    { id: 'cappuccino', name: 'Cappuccino', basePrice: 240, desc: 'Equal parts foam, milk & espresso', image: '/images/types/cappuccino.jpg' },
    { id: 'flat-white', name: 'Flat White', basePrice: 275, desc: 'Double ristretto with microfoam', image: '/images/types/flat-white.jpg' },
    { id: 'cold-brew', name: 'Cold Brew', basePrice: 250, desc: '20-hours steeped chilled elixir', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80' },
    { id: 'espresso', name: 'Espresso Solo', basePrice: 190, desc: 'Pure 9-bar single origin extraction', image: '/images/types/espresso.jpg' },
  ];

  const sizeOptions = [
    { label: 'Small (8oz)', extra: 0, desc: 'Single espresso shot base' },
    { label: 'Medium (12oz)', extra: 30, desc: 'Double ristretto gold standard' },
    { label: 'Large (16oz)', extra: 50, desc: 'Triple shot extended comfort' },
  ];

  const milkOptions = [
    { label: 'Whole Milk', extra: 0, desc: 'Classic farm fresh whole milk' },
    { label: 'Oat Milk', extra: 40, desc: 'Smooth Swedish barista edition' },
    { label: 'Almond Milk', extra: 40, desc: 'Light roasted nutty finish' },
    { label: 'Soy Milk', extra: 35, desc: 'Creamy botanical protein' },
    { label: 'Black (No Milk)', extra: 0, desc: 'Pure unadorned extraction' },
  ];

  const flavorOptions = [
    { label: 'Pure (None)', extra: 0, desc: 'Natural single origin tasting notes' },
    { label: 'Madagascar Vanilla', extra: 45, desc: 'Real vanilla bean pods reduction' },
    { label: 'Salted Caramel', extra: 45, desc: 'Fleur de sel buttery caramel' },
    { label: 'Toasted Hazelnut', extra: 45, desc: 'Slow-roasted Piedmont hazelnut' },
    { label: 'Raw Honey Blossom', extra: 40, desc: 'Wildflower amber honey nectar' },
  ];

  const extrasOptions = [
    { label: 'Extra Espresso Shot', extra: 50, desc: 'Freshly extracted 9-bar boost' },
    { label: 'Vanilla Bean Cold Foam', extra: 45, desc: 'Silky micro-whipped velvet cloud' },
    { label: 'Salted Caramel Drizzle', extra: 30, desc: 'Warm artisan caramel swirl' },
    { label: 'Dutch Cocoa Dusting', extra: 20, desc: 'Rich 70% dark cocoa powder' },
  ];

  const toggleExtra = (extraLabel: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraLabel)
        ? prev.filter((e) => e !== extraLabel)
        : [...prev, extraLabel]
    );
  };

  const extrasCost = selectedExtras.reduce((sum, extraLabel) => {
    const found = extrasOptions.find((e) => e.label === extraLabel);
    return sum + (found ? found.extra : 0);
  }, 0);

  // Computed total price: 260 + 30 + 40 + 45 + 50 = ₹ 425
  const totalPrice = coffeeType.basePrice + size.extra + milk.extra + flavor.extra + extrasCost;

  const handleReset = () => {
    setCoffeeType(coffeeOptions[0]);
    setSize(sizeOptions[1]);
    setMilk(milkOptions[1]);
    setFlavor(flavorOptions[1]);
    setSelectedExtras(['Extra Espresso Shot']);
    setActiveStep(1);
  };

  const handleAddToCart = () => {
    const customProduct: Product = {
      id: `custom-${coffeeType.id}-${Date.now()}`,
      name: `Your Perfect ${coffeeType.name.replace('Artisan ', '')}`,
      category: 'coffee',
      description: `${size.label} with ${milk.label}, ${flavor.label}${selectedExtras.length ? `, plus ${selectedExtras.join(', ')}` : ''}.`,
      price: totalPrice,
      image: coffeeType.image,
      flavorNotes: [milk.label, flavor.label, ...selectedExtras],
      roastLevel: 'Medium Dark',
      origin: 'Specialty Master Blend',
      intensity: 4,
      isBestSeller: true,
    };

    const added = addToCart(customProduct);
    if (added !== false) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2400);
    }
  };

  const steps = [
    { num: 1, name: '1 COFFEE', icon: <Coffee className="w-3.5 h-3.5" /> },
    { num: 2, name: '2 SIZE', icon: <span className="text-[11px] font-bold">2</span> },
    { num: 3, name: '3 MILK', icon: <Droplets className="w-3.5 h-3.5" /> },
    { num: 4, name: '4 FLAVOR', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { num: 5, name: '5 EXTRAS', icon: <Plus className="w-3.5 h-3.5" /> },
  ];

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMoveSection}
      onMouseEnter={() => setIsHoveredSection(true)}
      onMouseLeave={() => setIsHoveredSection(false)}
      className="relative w-full bg-gradient-to-b from-[#EFE6DC] via-[#F4ECE2] to-[#ECE1D5] text-[#2A170E] py-16 sm:py-24 overflow-hidden select-none"
    >
      {/* ── Interactive Cursor Spotlight Glow (Warm Golden Aura) ── */}
      {isHoveredSection && !reducedMotion && (
        <motion.div
          style={{
            x: springX,
            y: springY,
          }}
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-[#E0B57C]/20 to-[#C59B63]/15 pointer-events-none blur-3xl z-0"
        />
      )}

      {/* ── Parallax Botanical Visuals (Leaves & Roasted Coffee Beans) ── */}
      <motion.div
        style={{ y: reducedMotion ? 0 : leafY }}
        className="absolute top-10 -left-12 w-48 sm:w-64 pointer-events-none select-none opacity-40 z-0"
      >
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-12 filter brightness-95" />
      </motion.div>

      <motion.div
        style={{ y: reducedMotion ? 0 : beansY }}
        className="absolute -bottom-10 -left-8 w-44 sm:w-56 pointer-events-none select-none opacity-45 z-0"
      >
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-12 filter contrast-125" />
      </motion.div>

      <motion.div
        style={{ y: reducedMotion ? 0 : beansY }}
        className="absolute -bottom-6 -right-8 w-48 sm:w-60 pointer-events-none select-none opacity-45 z-0"
      >
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-45 filter contrast-125" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* ─────────────────────────────────────────────────────────────
            TOP EDITORIAL HEADER & DECORATIVE TOP-RIGHT PLATTER
        ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-4">
          <div className="max-w-2xl">
            {/* Top Subtitle Bar */}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#8C6239] mb-2 font-sans">
              <div className="w-6 h-[1.5px] bg-[#8C6239]/60" />
              <span>THE DAILY BREW • GOOD COFFEE • BETTER DAYS</span>
              <div className="w-6 h-[1.5px] bg-[#8C6239]/60" />
            </div>

            {/* Main Editorial Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#2A170E] tracking-tight leading-tight">
              Artisan Cup <span className="font-normal italic text-[#C08A4E]">Customizer</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#5A3B2E]/90 mt-2 leading-relaxed font-sans max-w-xl">
              Craft your personal morning ritual. Choose your roast base, calibrate milk temperature, and layer handcrafted infusions.
            </p>
          </div>

          {/* Top-Right Decorative Latte Platter with Script Callout */}
          <motion.div 
            style={{ y: reducedMotion ? 0 : platterY }}
            className="hidden md:flex items-center gap-4 self-end lg:self-center pr-2"
          >
            <div className="text-right">
              <span className="font-serif italic text-sm text-[#8C6239] block leading-tight">
                Small Choices
              </span>
              <span className="font-serif italic text-sm text-[#8C6239] flex items-center justify-end gap-1">
                <span>Make a Big Difference</span>
                <Heart className="w-3.5 h-3.5 text-[#C08A4E] inline" />
              </span>
            </div>

            {/* Ceramic Cup on Saucer */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl border-2 border-white/60 bg-gradient-to-br from-white/40 to-black/20 p-1">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=85"
                alt="Artisan Latte Art Cup"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 rounded-full border border-[#C59B63]/30 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN CUSTOMIZER GRID (LEFT WHITE PANEL & RIGHT OBSIDIAN CARD)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 items-stretch">
          
          {/* ── LEFT CONTAINER: Translucent Warm Glass Panel ── */}
          <div className="lg:col-span-8 bg-white/75 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 border border-white/80 shadow-[0_16px_45px_rgba(43,27,20,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col justify-between min-h-[540px]">
            
            <div>
              {/* Step Navigation Pill Tabs */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-5 border-b border-[#EFE5D8]">
                {steps.map((step) => {
                  const isActive = activeStep === step.num;
                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setActiveStep(step.num)}
                      className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#2A160C] to-[#3D2516] text-[#FAF4ED] shadow-md shadow-[#2A160C]/25 scale-105 border border-[#C59B63]/40'
                          : 'bg-[#F2E8DC] hover:bg-[#EAE0D2] text-[#553E30] border border-transparent'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span>{step.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Header indicating active step */}
              <div className="flex items-center justify-center sm:justify-start gap-3 my-5">
                <div className="w-8 h-[1.5px] bg-[#C08A4E]" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#8C6239] font-sans">
                  {activeStep === 1 && 'STEP 1 — SELECT YOUR BREW FOUNDATION'}
                  {activeStep === 2 && 'STEP 2 — CHOOSE YOUR VOLUME & EXTRACTION'}
                  {activeStep === 3 && 'STEP 3 — CALIBRATE MILK & TEXTURE'}
                  {activeStep === 4 && 'STEP 4 — INFUSE ARTISAN FLAVOR'}
                  {activeStep === 5 && 'STEP 5 — HANDCRAFTED EXTRAS'}
                </span>
                <div className="w-8 h-[1.5px] bg-[#C08A4E]" />
              </div>

              {/* ── STEP 1: BREW FOUNDATIONS (EXACTLY MATCHING IMAGE) ── */}
              {activeStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {coffeeOptions.map((opt) => {
                    const isSelected = coffeeType.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCoffeeType(opt)}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 group ${
                          isSelected
                            ? 'bg-[#FAF4EB] border-[#C08A4E] shadow-[0_4px_18px_rgba(192,138,78,0.22)] ring-1 ring-[#C08A4E]'
                            : 'bg-white hover:bg-white/90 border-[#EBE1D3] shadow-sm hover:border-[#C08A4E]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F0E6D8] shrink-0 border border-[#E0D0BD] shadow-inner">
                            <img src={opt.image} alt={opt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-sm sm:text-[15px] text-[#2A170E] group-hover:text-[#8C6239] transition-colors">
                              {opt.name}
                            </h4>
                            <p className="text-[11px] text-[#735B4A] font-sans line-clamp-1 mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-2">
                          <span className="font-serif font-bold text-sm text-[#2A170E]">
                            ₹ {opt.basePrice}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#8C6239] text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 2: SIZE ── */}
              {activeStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {sizeOptions.map((opt) => {
                    const isSelected = size.label === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSize(opt)}
                        className={`p-4 sm:p-5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#FAF4EB] border-[#C08A4E] shadow-md ring-1 ring-[#C08A4E]'
                            : 'bg-white hover:bg-white/90 border-[#EBE1D3]'
                        }`}
                      >
                        <Coffee className="w-6 h-6 mx-auto text-[#8C6239] mb-2" />
                        <h4 className="font-serif font-bold text-sm text-[#2A170E]">{opt.label}</h4>
                        <p className="text-[10px] text-[#735B4A] mt-1">{opt.desc}</p>
                        <span className="text-xs text-[#8C6239] font-bold block mt-2">
                          {opt.extra > 0 ? `+₹ ${opt.extra}` : 'Included'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 3: MILK ── */}
              {activeStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {milkOptions.map((opt) => {
                    const isSelected = milk.label === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setMilk(opt)}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FAF4EB] border-[#C08A4E] shadow-md ring-1 ring-[#C08A4E]'
                            : 'bg-white hover:bg-white/90 border-[#EBE1D3]'
                        }`}
                      >
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#2A170E]">{opt.label}</h4>
                          <p className="text-[10px] text-[#735B4A] mt-0.5">{opt.desc}</p>
                        </div>
                        <span className="text-xs text-[#8C6239] font-bold">
                          {opt.extra > 0 ? `+₹ ${opt.extra}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 4: FLAVOR ── */}
              {activeStep === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {flavorOptions.map((opt) => {
                    const isSelected = flavor.label === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setFlavor(opt)}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FAF4EB] border-[#C08A4E] shadow-md ring-1 ring-[#C08A4E]'
                            : 'bg-white hover:bg-white/90 border-[#EBE1D3]'
                        }`}
                      >
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#2A170E]">{opt.label}</h4>
                          <p className="text-[10px] text-[#735B4A] mt-0.5">{opt.desc}</p>
                        </div>
                        <span className="text-xs text-[#8C6239] font-bold">
                          {opt.extra > 0 ? `+₹ ${opt.extra}` : 'Included'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── STEP 5: EXTRAS ── */}
              {activeStep === 5 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {extrasOptions.map((opt) => {
                    const isSelected = selectedExtras.includes(opt.label);
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => toggleExtra(opt.label)}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FAF4EB] border-[#C08A4E] shadow-md ring-1 ring-[#C08A4E]'
                            : 'bg-white hover:bg-white/90 border-[#EBE1D3]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#8C6239] border-[#8C6239] text-white' : 'border-[#C5B39E]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#2A170E]">{opt.label}</h4>
                            <p className="text-[10px] text-[#735B4A] mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#8C6239] font-bold">+₹ {opt.extra}</span>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Controls inside Left Container */}
            <div className="flex items-center justify-between gap-2 pt-5 mt-6 border-t border-[#EFE5D8]">
              <button
                type="button"
                onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                disabled={activeStep === 1}
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeStep === 1 ? 'opacity-30 cursor-not-allowed text-[#735B4A]' : 'text-[#2A170E] hover:text-[#C08A4E]'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>PREVIOUS STEP</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6239] hover:text-[#2A170E] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep((s) => Math.min(5, s + 1))}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#2A160C] hover:bg-[#3E2214] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>{activeStep === 5 ? 'REVIEW RECIPE' : 'NEXT STEP'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C08A4E]" />
              </button>
            </div>

          </div>

          {/* ── RIGHT CONTAINER: Dark Luxury Obsidian Recipe Card (MATCHING IMAGE) ── */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#1F120A] via-[#1A0E08] to-[#120803] text-[#FDF8F0] rounded-[28px] sm:rounded-[36px] p-6 sm:p-7 border border-[#3A2214] shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col justify-between">
            
            {/* Top Right Floating Coffee Cup Badge with Golden Aura */}
            <div className="absolute top-5 right-5 flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full p-1 bg-gradient-to-br from-[#C59B63] to-[#8C6239] shadow-[0_0_25px_rgba(197,155,99,0.4)]">
                <img
                  src={coffeeType.image}
                  alt={coffeeType.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Connected Golden Orb Icon */}
              <div className="hidden sm:flex w-9 h-9 rounded-full bg-[#2A160C] border border-[#C59B63]/60 items-center justify-center text-[#E8C28A] shadow-md">
                <Coffee className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C59B63] block mb-1 font-sans">
                YOUR CUSTOM RECIPE
              </span>
              <h3 className="font-serif text-2xl sm:text-[27px] font-bold text-[#FDF8F0] tracking-tight mb-5 pr-16">
                Your Perfect {coffeeType.name.replace('Artisan ', '')}
              </h3>

              {/* Breakdown Rows with Icons */}
              <div className="space-y-3 pt-2 text-xs font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#C8B6A6]">
                    <Coffee className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Base Brew</span>
                  </div>
                  <span className="font-semibold text-[#FDF8F0]">{coffeeType.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#C8B6A6]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Volume</span>
                  </div>
                  <span className="font-semibold text-[#FDF8F0]">{size.label}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#C8B6A6]">
                    <Droplets className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Milk Texture</span>
                  </div>
                  <span className="font-semibold text-[#FDF8F0]">{milk.label}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#C8B6A6]">
                    <Flame className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Infusion</span>
                  </div>
                  <span className="font-semibold text-[#FDF8F0]">{flavor.label}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-[#C8B6A6]">
                    <Plus className="w-3.5 h-3.5 text-[#C59B63]" />
                    <span>Extras ({selectedExtras.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedExtras.map((ex) => (
                      <span key={ex} className="px-2.5 py-0.5 rounded-full bg-[#2C1C13] border border-[#C59B63]/40 text-[10px] font-medium text-[#E8C28A]">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="mt-8 pt-4 flex items-baseline justify-between border-t border-white/15">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C8B6A6]">
                  TOTAL PRICE:
                </span>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#E8C28A] tracking-tight">
                  ₹ {totalPrice}
                </span>
              </div>
            </div>

            {/* Action Button & Footer Quote */}
            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D8A464] via-[#E8B87A] to-[#C9914E] hover:from-[#E8B87A] hover:to-[#D8A464] text-[#190C05] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(216,164,100,0.35)] transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO ORDER NOW →</span>
              </button>

              <AnimatePresence>
                {addedNotice && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-xs text-[#85E397] font-medium"
                  >
                    ✓ Added your custom cup to cart!
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-center font-serif italic text-[11px] text-[#A69080] pt-1">
                — "Thoughtfully crafted for the moments that deserve a pause." —
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
