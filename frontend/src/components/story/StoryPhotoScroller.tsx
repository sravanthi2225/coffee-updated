import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Eye, 
  X, 
  ArrowRight,
  Maximize2,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface StoryPhotoItem {
  id: string;
  src: string;
  title: string;
  badge: string;
  oneLiner: string;
  category: 'champion' | 'brew' | 'culture';
}

export const STORY_PHOTOS: StoryPhotoItem[] = [
  {
    id: 'anthony-douglas',
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85',
    title: 'Anthony Douglas',
    badge: '2022 WBC World Champion',
    oneLiner: 'Sensory precision and radiant single-origin roast curves.',
    category: 'champion',
  },
  {
    id: 'andrea-lattuada',
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85',
    title: 'Andrea Lattuada',
    badge: '2003 WBC Italy Champion',
    oneLiner: 'Classical Italian espresso heritage refined for modern extraction.',
    category: 'champion',
  },
  {
    id: 'coffee-toast',
    src: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1200&q=85',
    title: 'Artisan Cold Brew Cheers',
    badge: 'Handcrafted Refreshments',
    oneLiner: 'Chilled single-origin cold brews poured for peaceful morning rituals.',
    category: 'brew',
  },
  {
    id: 'coffee-book-pour',
    src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=85',
    title: 'Roastery Notes & Cold Pour',
    badge: 'Single-Origin Focus',
    oneLiner: 'Freshly pulled dark roast over crystal ice beside cupping journals.',
    category: 'brew',
  },
  {
    id: 'zhimin-pan',
    src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=85',
    title: 'Zhimin Pan',
    badge: 'WBC China Champion',
    oneLiner: 'Water distribution mastery, temperature control, and latte art.',
    category: 'champion',
  },
  {
    id: 'agnieszka-rojewska',
    src: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?auto=format&fit=crop&w=1200&q=85',
    title: 'Agnieszka Rojewska',
    badge: '2018 WBC & 2022 WLAC Champion',
    oneLiner: 'Setting global standards for competitive specialty coffee excellence.',
    category: 'champion',
  },
  {
    id: 'cafe-ambiance',
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85',
    title: 'Sanctuary Architecture',
    badge: 'Botanical Interior',
    oneLiner: 'Sunlit urban retreats filled with natural timber and lush botanicals.',
    category: 'culture',
  },
  {
    id: 'coffee-tennis-court',
    src: 'https://images.unsplash.com/photo-1522992319-0365e5f11656?auto=format&fit=crop&w=1200&q=85',
    title: 'Active Energy & Signature Cup',
    badge: 'Lifestyle & Motion',
    oneLiner: 'High-performance specialty coffee fueling vibrant active lifestyles.',
    category: 'culture',
  },
  {
    id: 'barista-craft-counter',
    src: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1200&q=85',
    title: 'The Craft Counter',
    badge: 'Artisanal Preparation',
    oneLiner: 'Precision layered iced drinks crafted with oat milk and espresso.',
    category: 'brew',
  },
  {
    id: 'mascot-luck-in-hand',
    src: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=85',
    title: 'Bloom In Hand Experience',
    badge: 'Global Collaboration',
    oneLiner: 'Uniting sports culture and joyful energy with craft coffee.',
    category: 'culture',
  },
  {
    id: 'cup-luck-in-singapore',
    src: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=85',
    title: 'Brew & Bloom in Singapore',
    badge: 'Global Flagship Journey',
    oneLiner: 'Celebrating global roastery expansion with exclusive city editions.',
    category: 'culture',
  },
  {
    id: 'barista-espresso-precision',
    src: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=1200&q=85',
    title: 'Espresso Extraction Mastery',
    badge: 'Quality & Consistency',
    oneLiner: 'Morning espresso shots dialed in to exact extraction yield and pressure.',
    category: 'champion',
  },
];

interface StoryPhotoScrollerProps {
  className?: string;
  showTitle?: boolean;
}

export const StoryPhotoScroller: React.FC<StoryPhotoScrollerProps> = ({
  className = '',
  showTitle = true,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<StoryPhotoItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'champion' | 'brew' | 'culture'>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.2); // Pixels per frame
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right'>('left');
  const [hoveredCardTitle, setHoveredCardTitle] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const reducedMotion = useReducedMotion();

  // ── Custom Cursor Tracker for Story Section ──
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringSection, setIsHoveringSection] = useState(false);
  const springX = useSpring(0, { stiffness: 350, damping: 28 });
  const springY = useSpring(0, { stiffness: 350, damping: 28 });

  const handleMouseMoveSection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
    springX.set(x);
    springY.set(y);
  };

  // ── Parallax Scrolling Effects with Page Scroll ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const leafY = useTransform(scrollYProgress, [0, 1], [-50, 90]);
  const beansY = useTransform(scrollYProgress, [0, 1], [40, -80]);

  const filteredPhotos = filterCategory === 'all' 
    ? STORY_PHOTOS 
    : STORY_PHOTOS.filter(p => p.category === filterCategory);

  // Triple duplicated list for seamless infinite loop
  const displayPhotos = [...filteredPhotos, ...filteredPhotos, ...filteredPhotos];

  // ── 60FPS Smooth Continuous Automatic Scroller ──
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let lastTimestamp = performance.now();

    const scrollLoop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 16.667, 2); // normalize delta time
      lastTimestamp = timestamp;

      if (!isPaused && !isDragging.current && !reducedMotion) {
        const step = scrollSpeed * delta;
        if (scrollDirection === 'left') {
          scroller.scrollLeft += step;
          // When reached the end of the second set, loop back seamlessly
          const maxLoopWidth = scroller.scrollWidth / 3;
          if (scroller.scrollLeft >= maxLoopWidth * 2) {
            scroller.scrollLeft -= maxLoopWidth;
          }
        } else {
          scroller.scrollLeft -= step;
          const maxLoopWidth = scroller.scrollWidth / 3;
          if (scroller.scrollLeft <= 0) {
            scroller.scrollLeft += maxLoopWidth;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scrollLoop);
    };

    animationFrameId.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, scrollSpeed, scrollDirection, reducedMotion, filteredPhotos.length]);

  // Mouse & Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollerRef.current.offsetLeft;
    scrollLeft.current = scrollerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.6;
    scrollerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Manual Nudge
  const nudge = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const amount = 380;
    scrollerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowRight' && selectedPhoto) {
        const idx = STORY_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
        setSelectedPhoto(STORY_PHOTOS[(idx + 1) % STORY_PHOTOS.length]);
      } else if (e.key === 'ArrowLeft' && selectedPhoto) {
        const idx = STORY_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
        setSelectedPhoto(STORY_PHOTOS[(idx - 1 + STORY_PHOTOS.length) % STORY_PHOTOS.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMoveSection}
      onMouseEnter={() => setIsHoveringSection(true)}
      onMouseLeave={() => {
        setIsHoveringSection(false);
        handleMouseUp();
      }}
      className={`w-full relative select-none bg-[#FAF6EE] text-[#2B1B14] py-10 sm:py-16 overflow-hidden ${className}`}
    >
      {/* ── Custom Interactive Floating Cursor Tracker Badge ── */}
      {isHoveringSection && !reducedMotion && (
        <motion.div
          style={{
            x: springX,
            y: springY,
          }}
          className="fixed pointer-events-none z-50 -top-6 -left-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2B1B14]/90 text-[#FFF8F0] border border-[#C08A4E]/60 shadow-[0_8px_25px_rgba(43,27,20,0.35)] backdrop-blur-md text-[10.5px] font-bold tracking-widest uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-[#C08A4E] animate-ping" />
          <span>{hoveredCardTitle ? 'TAP TO INSPECT' : 'DRAG TO SCROLL'}</span>
        </motion.div>
      )}

      {/* ── Ambient Parallax Botanical Elements ── */}
      <motion.div
        style={{ y: reducedMotion ? 0 : leafY }}
        className="absolute top-10 -left-12 w-48 sm:w-64 pointer-events-none select-none opacity-40 z-0"
      >
        <img
          src="/images/journey/leaves-corner.png"
          alt=""
          className="w-full h-auto transform -rotate-12 filter brightness-95"
        />
      </motion.div>

      <motion.div
        style={{ y: reducedMotion ? 0 : beansY }}
        className="absolute bottom-6 -right-10 w-44 sm:w-56 pointer-events-none select-none opacity-40 z-0"
      >
        <img
          src="/images/journey/beans-corner.png"
          alt=""
          className="w-full h-auto transform rotate-45 filter contrast-125"
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Editorial Header ── */}
        {showTitle && (
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE2CF] border border-[#E0D0BB] mb-3 backdrop-blur-sm shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-[#8C6239]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6239]">
                World Champions &amp; Heritage
              </span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-[#2B1B14]">
              Our Story in <span className="italic font-normal text-[#C08A4E]">Every Frame</span>
            </h3>

            <p className="text-xs sm:text-sm md:text-base max-w-2xl mx-auto text-[#5A3B2E]/85 leading-relaxed font-sans">
              From WBC World Champions crafting world-class espresso to global moments across cities.
            </p>

            {/* ── Interactive Category Filters & Speed / Direction Bar ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-[#EFE2CF]">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(['all', 'champion', 'brew', 'culture'] as const).map((cat) => {
                  const count = cat === 'all' 
                    ? STORY_PHOTOS.length 
                    : STORY_PHOTOS.filter(p => p.category === cat).length;
                  const label = cat === 'all' 
                    ? 'All Moments' 
                    : cat === 'champion' 
                    ? 'World Champions' 
                    : cat === 'brew' 
                    ? 'Artisan Brews' 
                    : 'Café Culture';

                  const isActive = filterCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
                      }}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#2B1B14] text-[#FFF8F0] font-bold shadow-md shadow-[#2B1B14]/20 scale-105'
                          : 'bg-white text-[#5A3B2E] hover:text-[#2B1B14] border border-[#E5D5C0] hover:border-[#C08A4E] shadow-sm'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-[#FFF8F0]' : 'bg-[#FAF4EA] text-[#8C6239]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Automatic Scrolling Controls */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5D5C0] shadow-sm">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF4EA] hover:bg-[#2B1B14] text-[#8C6239] hover:text-[#FFF8F0] text-xs font-bold transition-all"
                  title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Auto Scroll' : 'Scrolling'}</span>
                </button>

                {/* Speed Toggle */}
                <button
                  onClick={() => setScrollSpeed((s) => (s === 1.2 ? 2.2 : s === 2.2 ? 0.6 : 1.2))}
                  className="px-2 py-1 rounded-full text-xs font-mono font-bold text-[#5A3B2E] hover:text-[#2B1B14]"
                  title="Toggle scrolling speed"
                >
                  {scrollSpeed === 0.6 ? '0.5x' : scrollSpeed === 1.2 ? '1x' : '2x'}
                </button>

                {/* Left/Right Direction Arrows */}
                <div className="flex items-center gap-1 pl-1 border-l border-[#EFE2CF]">
                  <button
                    onClick={() => {
                      setScrollDirection('left');
                      nudge('left');
                    }}
                    aria-label="Scroll left"
                    className="w-6 h-6 rounded-full hover:bg-[#2B1B14] text-[#5A3B2E] hover:text-[#FFF8F0] flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setScrollDirection('right');
                      nudge('right');
                    }}
                    aria-label="Scroll right"
                    className="w-6 h-6 rounded-full hover:bg-[#2B1B14] text-[#5A3B2E] hover:text-[#FFF8F0] flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            CONTINUOUS SILKY AUTOMATIC SCROLLING GALLERY VIEWPORT
        ───────────────────────────────────────────────────────────── */}
        <div 
          className="relative w-full py-4 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            handleMouseUp();
          }}
        >
          {/* Subtle Left & Right Gradient Fog Masks */}
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF6EE] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF6EE] to-transparent pointer-events-none z-20" />

          {/* Draggable & Auto-Scrolling Horizontal Track */}
          <div
            ref={scrollerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="flex items-stretch gap-6 overflow-x-auto no-scrollbar py-4 cursor-grab active:cursor-grabbing select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {displayPhotos.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                onClick={() => setSelectedPhoto(photo)}
                onMouseEnter={() => setHoveredCardTitle(photo.title)}
                onMouseLeave={() => setHoveredCardTitle(null)}
                className="group relative flex-shrink-0 w-[290px] sm:w-[350px] md:w-[380px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-white border border-[#EBE1D0] hover:border-[#C08A4E] shadow-[0_8px_24px_rgba(43,27,20,0.06)] hover:shadow-[0_20px_45px_rgba(192,138,78,0.20)] hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Ultra-HD Photographic Viewport */}
                <div className="relative w-full aspect-[16/10] bg-[#F7F1E6] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Chic Category Badge Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#8C6239] border border-[#E8D9C5] shadow-md backdrop-blur-md">
                      <Sparkles className="w-2.5 h-2.5 text-[#C08A4E]" />
                      <span>{photo.badge}</span>
                    </span>
                  </div>

                  {/* Hover Inspect Icon */}
                  <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#2B1B14] text-[#FFF8F0] p-2.5 rounded-full shadow-xl transform translate-y-1 group-hover:translate-y-0">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Information: Title + Strictly One-Line Sentence */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-[#2B1B14] group-hover:text-[#8C6239] transition-colors leading-snug">
                      {photo.title}
                    </h4>
                    
                    <p className="text-xs sm:text-[13px] text-[#5A3B2E]/90 font-sans leading-relaxed mt-1.5 line-clamp-2">
                      {photo.oneLiner}
                    </p>
                  </div>

                  {/* Card Bottom Link */}
                  <div className="pt-3.5 mt-3.5 border-t border-[#F5EDE1] flex items-center justify-between text-[11px] font-mono font-bold text-[#8C6239]">
                    <span>TAP TO INSPECT HD</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Interaction Instruction */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#8C6239] font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C08A4E] animate-ping" />
            <span>Automatically scrolling • Hover cards to pause • Drag with cursor to explore</span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          FULLSCREEN HIGH-RES LIGHTBOX MODAL
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-3xl border border-[#EFE2CF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EFE2CF] bg-[#FAF6EE]">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-[#EFE2CF] text-[#8C6239] text-[10px] font-bold uppercase tracking-wider border border-[#E0D0BB]">
                    {selectedPhoto.badge}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-[#2B1B14]">
                    {selectedPhoto.title}
                  </h4>
                </div>

                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#2B1B14] text-[#2B1B14] hover:text-white flex items-center justify-center transition-all border border-[#EFE2CF]"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Image Viewport */}
              <div className="flex-1 overflow-hidden p-4 sm:p-6 flex items-center justify-center bg-[#F7F1E6]">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[62vh] object-contain rounded-2xl shadow-xl border border-[#EFE2CF]"
                />
              </div>

              {/* Modal Footer with One-Liner Sentence */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#EFE2CF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-[#5A3B2E] font-medium leading-relaxed">
                  {selectedPhoto.oneLiner}
                </p>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = STORY_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
                      setSelectedPhoto(STORY_PHOTOS[(idx - 1 + STORY_PHOTOS.length) % STORY_PHOTOS.length]);
                    }}
                    className="p-2 rounded-full bg-[#FAF6EE] hover:bg-[#2B1B14] text-[#2B1B14] hover:text-white border border-[#EFE2CF] transition-all"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = STORY_PHOTOS.findIndex((p) => p.id === selectedPhoto.id);
                      setSelectedPhoto(STORY_PHOTOS[(idx + 1) % STORY_PHOTOS.length]);
                    }}
                    className="p-2 rounded-full bg-[#FAF6EE] hover:bg-[#2B1B14] text-[#2B1B14] hover:text-white border border-[#EFE2CF] transition-all"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
