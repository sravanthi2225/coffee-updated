import React from 'react';
import { InteractiveHero } from '../components/hero/InteractiveHero';
import { FeaturedSeasonalAndRewards } from '../components/home/FeaturedSeasonalAndRewards';
import { BaristaChampionshipShowcase } from '../components/home/BaristaChampionshipShowcase';
import { StorySection } from '../components/home/StorySection';
import { BuildYourCoffee } from '../components/home/BuildYourCoffee';
import { FinalCTA } from '../components/home/FinalCTA';

export const Home: React.FC = () => {
  return (
    <main>
      {/* 1. Hero Section — Three.js 3D coffee cup + GSAP scroll exit + Order Ahead / Book Slot CTAs */}
      <InteractiveHero />

      {/* 2. Rewards Summary, Seasonal Picks & Slot Booking CTA */}
      <FeaturedSeasonalAndRewards />

      {/* 3. World Barista Championship Showcase (Interactive Expanding Panels) */}
      <BaristaChampionshipShowcase />

      {/* 4. Our Story — GSAP pinned scroll storytelling */}
      <StorySection />

      {/* 5. Artisan Cup Customizer */}
      <BuildYourCoffee />

      {/* 6. Final CTA — GSAP text-split + Motion button */}
      <FinalCTA />
    </main>
  );
};
