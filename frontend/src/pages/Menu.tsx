import React, { useState, useMemo, useRef } from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionContainer } from '../components/layout/SectionContainer';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryFilter } from '../components/product/CategoryFilter';
import type { FilterCategory } from '../components/product/CategoryFilter';
import { PRODUCTS } from '../data/products';
import { useFavorites } from '../context/FavoritesContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { FlagshipMenuShowcase } from '../components/menu/FlagshipMenuShowcase';

export const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { favorites, favoritesCount } = useFavorites();
  const catalogRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Parallax for ambient floating elements throughout the catalog scroll
  const { scrollYProgress } = useScroll({
    target: catalogRef,
    offset: ['start end', 'end start'],
  });

  const ambientLeafY = useTransform(scrollYProgress, [0, 1], [-60, 120]);
  const ambientBeansY = useTransform(scrollYProgress, [0, 1], [40, -100]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(product.id)) return false;
      } else if (activeCategory !== 'all') {
        if (product.category !== activeCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesNotes = product.flavorNotes.some((note) => note.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesNotes;
      }

      return true;
    });
  }, [activeCategory, searchQuery, favorites]);

  return (
    <main className="relative bg-[#FAF6EE] min-h-screen">
      {/* ── Full-Bleed Menu Hero Banner starting flush at top ── */}
      <div ref={catalogRef} className="relative pt-0 pb-24 overflow-hidden">
        {/* Subtle Ambient Parallax Floating Ingredients — positioned down in catalog area */}
        <motion.div
          style={{ y: reducedMotion ? 0 : ambientLeafY }}
          className="absolute top-[480px] -left-12 w-48 sm:w-64 pointer-events-none select-none opacity-30 z-0"
        >
          <img
            src="/images/journey/leaves-corner.png"
            alt=""
            className="w-full h-auto transform -rotate-12 filter brightness-90"
          />
        </motion.div>

        <motion.div
          style={{ y: reducedMotion ? 0 : ambientBeansY }}
          className="absolute top-[55%] -right-10 w-44 sm:w-60 pointer-events-none select-none opacity-40 z-0"
        >
          <img
            src="/images/journey/beans-corner.png"
            alt=""
            className="w-full h-auto transform rotate-45 filter contrast-125"
          />
        </motion.div>

        {/* ── Featured Singapore Flagship Menu Series (Full-bleed landscape banner + centered catalog) ── */}
        <div className="relative z-10 w-full">
          <FlagshipMenuShowcase className="mb-20 sm:mb-28" />
        </div>
      </div>
    </main>
  );
};

export default Menu;
