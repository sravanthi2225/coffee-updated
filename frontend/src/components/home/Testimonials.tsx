import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Aria Chen',
    role: 'Creative Director',
    text: "Brew & Bloom is my morning ritual. The single-origin Ethiopian espresso here has more character than most cafés' entire menu. The ambience makes you want to stay forever.",
    rating: 5,
    avatar: '🌸',
  },
  {
    id: 2,
    name: 'Marcus Rivera',
    role: 'Freelance Writer',
    text: "I've written two novels in that corner booth. The flat white is impossibly silky, the staff remembers your name, and the Wi-Fi never drops. It's my second office.",
    rating: 5,
    avatar: '✍️',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Architect',
    text: "The attention to detail is extraordinary — from the precise latte art to the curated playlist. Every visit feels like a small escape from the chaos of the city.",
    rating: 5,
    avatar: '🏛️',
  },
  {
    id: 4,
    name: 'James O\'Brien',
    role: 'Coffee Enthusiast',
    text: "I track specialty coffee roasters across three countries. Brew & Bloom's micro-roasted Colombian Huila is one of the best I've had. Period.",
    rating: 4,
    avatar: '☕',
  },
  {
    id: 5,
    name: 'Sophie Laurent',
    role: 'Photographer',
    text: "The golden hour light streaming through those floor-to-ceiling windows is my favorite thing to photograph. And the almond croissant? Absolutely divine.",
    rating: 5,
    avatar: '📸',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

// Animated star rating with stagger pop
const StarRating: React.FC<{ rating: number; animate: boolean }> = ({ rating, animate }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={animate ? { scale: 0, rotate: -180 } : undefined}
          animate={animate ? { scale: 1, rotate: 0 } : undefined}
          transition={animate ? {
            delay: i * 0.1,
            type: 'spring',
            stiffness: 500,
            damping: 15,
          } : undefined}
        >
          <Star
            className={`w-4 h-4 ${i < rating ? 'fill-[#E8C28A] text-[#E8C28A]' : 'text-[#D5C6B3]'}`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export const Testimonials: React.FC = () => {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [starKey, setStarKey] = useState(0);

  const paginate = useCallback((newDirection: number) => {
    setCurrent(([prev]) => {
      const next = (prev + newDirection + TESTIMONIALS.length) % TESTIMONIALS.length;
      return [next, newDirection];
    });
    setStarKey((k) => k + 1);
  }, []);

  // Auto-advance every 5s (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => paginate(1), 5000);
    return () => clearInterval(interval);
  }, [isHovered, paginate]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      paginate(1);
    } else if (info.offset.x > threshold) {
      paginate(-1);
    }
  };

  const testimonial = TESTIMONIALS[current];

  return (
    <section className="relative w-full bg-[#FAF6EE] py-20 sm:py-24 overflow-hidden select-none">
      {/* Corner accent */}
      <div className="absolute -bottom-8 -left-8 w-44 sm:w-56 pointer-events-none opacity-25">
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform -rotate-12" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 sm:w-16 h-[1.5px] bg-[#C5A882]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239] font-sans">
              GUEST VOICES
            </span>
            <div className="w-12 sm:w-16 h-[1.5px] bg-[#C5A882]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#140703] tracking-tight">
            What Our <span className="italic font-normal">Guests</span> Say
          </h2>
        </div>

        {/* Carousel container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 z-20 w-10 h-10 rounded-full bg-white border border-[#E9DEC8] shadow-md flex items-center justify-center hover:bg-[#1C0E07] hover:text-white hover:border-[#1C0E07] transition-all group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 text-[#5A3B2E] group-hover:text-white" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 z-20 w-10 h-10 rounded-full bg-white border border-[#E9DEC8] shadow-md flex items-center justify-center hover:bg-[#1C0E07] hover:text-white hover:border-[#1C0E07] transition-all group"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 text-[#5A3B2E] group-hover:text-white" />
          </button>

          {/* Slide */}
          <div className="relative min-h-[280px] flex items-center justify-center overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={testimonial.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="w-full bg-white rounded-[28px] border border-[#E9DEC8] shadow-[0_8px_28px_rgba(40,20,10,0.06)] p-8 sm:p-10 cursor-grab active:cursor-grabbing"
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-[#C5A882] mb-4" />

                {/* Review text */}
                <p className="font-serif text-base sm:text-lg md:text-xl text-[#2B1B14] leading-relaxed italic mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author info */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF0E4] border border-[#E9DEC8] flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <span className="font-serif font-bold text-sm sm:text-base text-[#1C0E07] block">{testimonial.name}</span>
                      <span className="text-[11px] text-[#8C6239] font-sans uppercase tracking-wider">{testimonial.role}</span>
                    </div>
                  </div>
                  <StarRating key={starKey} rating={testimonial.rating} animate={true} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent([i, i > current ? 1 : -1])}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-7 h-2 bg-[#1C0E07]'
                    : 'w-2 h-2 bg-[#D5C6B3] hover:bg-[#A89883]'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
