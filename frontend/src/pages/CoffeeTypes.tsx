import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Droplets, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';
import { COFFEE_TYPES } from '../data/coffeeTypes';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const CoffeeTypes: React.FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16 relative overflow-hidden bg-[#FAF6EE]">
      {/* Ambient Floating Botanicals & Coffee Beans */}
      <motion.div
        animate={reducedMotion ? {} : { y: [0, -15, 0], rotate: [45, 48, 45] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 -right-10 w-48 sm:w-64 pointer-events-none select-none opacity-60 z-0"
      >
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto" />
      </motion.div>

      <motion.div
        animate={reducedMotion ? {} : { y: [0, 14, 0], rotate: [-12, -15, -12] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-96 -left-8 w-44 sm:w-56 pointer-events-none select-none opacity-60 z-0"
      >
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto" />
      </motion.div>

      <SectionContainer bg="cream" className="!py-0 relative z-10">
        
        {/* Editorial Heading with Entrance Fade */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeading
            title="The Coffee Atlas &amp; Repertoire"
            subtitle="Explore the 12 definitive expressions of specialty coffee, botanical teas, and hearth bakery. Learn their precise extraction ratios, temperature, and flavor personalities."
          />
        </motion.div>

        {/* Alternating Editorial Showcase with Smooth Scroll Entrance & Micro-Interactions */}
        <div className="space-y-16 sm:space-y-24 mt-6">
          {COFFEE_TYPES.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.article
                key={item.id}
                id={item.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reducedMotion ? {} : { y: -6, transition: { duration: 0.3 } }}
                className="group/card grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center bg-[#F7F1E6] hover:bg-[#FAF4EB] p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#EFE2CF] hover:border-[#C5A882]/70 shadow-sm hover:shadow-[0_24px_50px_rgba(43,27,20,0.08)] transition-all duration-300 scroll-mt-28"
              >
                {/* Image Stage (Alternates Left/Right on Desktop) */}
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFE2CF] shadow-md group">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 group-hover:brightness-105 transition-all duration-700 ease-out"
                    />
                    
                    {/* Badge Overlay with Shimmer Pulse */}
                    <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#2B1B14]/85 backdrop-blur-md text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/10">
                      <Sparkles className="w-3.5 h-3.5 text-[#C08A4E] animate-pulse" />
                      {item.artType}
                    </div>

                    {/* Step Number in Background */}
                    <span className="absolute bottom-2 right-4 text-7xl sm:text-8xl font-serif font-black text-black/10 select-none pointer-events-none group-hover:text-black/15 transition-colors duration-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                {/* Editorial Content (Alternates Left/Right) */}
                <motion.div
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-6 space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono font-bold text-[#C08A4E]">
                        SELECTION {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-[#5A3B2E]/60">•</span>
                      <span className="text-xs text-[#5A3B2E] font-medium tracking-wider">
                        Intensity: {'●'.repeat(item.strength)}{'○'.repeat(5 - item.strength)}
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B14] leading-tight group-hover/card:text-[#7A4B29] transition-colors duration-300">
                      {item.name}
                    </h2>

                    <p className="text-xs sm:text-sm font-semibold text-[#5C6B4E] uppercase tracking-wider mt-1">
                      {item.tagline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5A3B2E] leading-relaxed font-sans">
                    {item.description}
                  </p>

                  {/* Brewing Ratio & Best Served Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EFE2CF]">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A3B2E]/70 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-[#C08A4E]" />
                        Extraction Ratio
                      </span>
                      <p className="text-xs font-mono font-medium text-[#2B1B14]">
                        {item.ratio}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A3B2E]/70 flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-[#5C6B4E]" />
                        Best Served
                      </span>
                      <p className="text-xs text-[#2B1B14]">
                        {item.bestServed}
                      </p>
                    </div>
                  </div>

                  {/* Flavor Profile Pills with Interactive Hover Scale */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A3B2E]/70 block mb-2">
                      Sensory Profile
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.flavorProfile.map((note) => (
                        <motion.span
                          key={note}
                          whileHover={reducedMotion ? {} : { scale: 1.06, backgroundColor: '#E4D5C0' }}
                          className="px-3 py-1 rounded-full bg-[#EFE2CF] text-[#2B1B14] text-xs font-medium cursor-default transition-colors duration-200"
                        >
                          {note}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Order / Explore Link */}
                  <div className="pt-2">
                    <Link
                      to="/menu"
                      className="group/link inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2B1B14] hover:text-[#C08A4E] transition-colors"
                    >
                      <span>Order in Our Specialty Menu</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
                    </Link>
                  </div>
                </motion.div>
              </motion.article>
            );
          })}
        </div>

      </SectionContainer>
    </main>
  );
};
