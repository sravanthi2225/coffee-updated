import React from 'react';
import { Link } from 'react-router-dom';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';
import { BeanToCupTimeline } from '../components/home/BeanToCupTimeline';
import { StoryPhotoScroller } from '../components/story/StoryPhotoScroller';
import { ArrowRight, Leaf, Flame, Sparkles } from 'lucide-react';

export const OurStory: React.FC = () => {
  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16 relative overflow-hidden">
      {/* Coffee-Themed Visual Decor on Page Flanks */}
      <div className="absolute top-12 -left-8 w-44 sm:w-60 pointer-events-none select-none opacity-60 z-0">
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-12" />
      </div>
      <div className="absolute top-48 -right-8 w-40 sm:w-56 pointer-events-none select-none opacity-60 z-0">
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-45" />
      </div>

      <SectionContainer bg="cream" className="!py-0 relative z-10">
        
        {/* Magazine Editorial Hero */}
        <div className="max-w-4xl mx-auto text-center space-y-6 pb-12 sm:pb-16 border-b border-[#EFE2CF]">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B1B14] leading-[1.15]">
            A little pause. A perfect cup.
          </h1>
          <p className="font-serif text-xl sm:text-2xl text-[#5A3B2E] italic max-w-2xl mx-auto">
            "We built Brew &amp; Bloom on the conviction that a day is measured not by how fast you run, but by the stillness you allow into your morning."
          </p>
        </div>

        {/* Story Chapter 1: The Origin */}
        <div className="py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono font-bold text-[#C08A4E]">
              CHAPTER I • HIGH MIST &amp; VOLCANIC SOIL
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B14]">
              Where time slows down, coffee deepens.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#5A3B2E]/90 leading-relaxed font-sans">
              <p>
                Our search for exceptional coffees brought us to the misty mountain slopes of Yirgacheffe, Ethiopia, and Huila, Colombia. Here, heirloom Arabica varieties thrive beneath indigenous canopies of acacia and shade trees at 2,100 meters above sea level.
              </p>
              <p>
                Because the cool mountain nights retard cherry maturation, the coffee beans slowly absorb dense sugars and complex florality. We know every farmer by name, guaranteeing transparent prices well above fair-trade thresholds.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-[#2B1B14]">
              <div>
                <span className="font-serif text-2xl font-bold text-[#5C6B4E] block">100%</span>
                <span>Traceable Harvests</span>
              </div>
              <div className="w-px h-8 bg-[#EFE2CF]" />
              <div>
                <span className="font-serif text-2xl font-bold text-[#C08A4E] block">45%</span>
                <span>Above Fair Minimums</span>
              </div>
              <div className="w-px h-8 bg-[#EFE2CF]" />
              <div>
                <span className="font-serif text-2xl font-bold text-[#2B1B14] block">2,100m</span>
                <span>Average Elevation</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-[#EFE2CF]">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="Green coffee beans drying in sun"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </div>
        </div>

      </SectionContainer>

      {/* The 5-Step Bean to Cup Journey */}
      <BeanToCupTimeline />

      {/* Visual Heritage & Master Baristas Showcase */}
      <section className="py-10 sm:py-16 bg-[#FAF6EE] text-[#2B1B14] relative overflow-hidden my-8 border-y border-[#EFE2CF]">
        <StoryPhotoScroller showTitle={true} />
      </section>

      {/* Story Chapter 2: The Roastery & Hearth */}
      <SectionContainer bg="off-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-[#EFE2CF]">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
                alt="Roasting cast iron drum"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-mono font-bold text-[#C08A4E]">
              CHAPTER II • THE CAST-IRON ROAST
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B14]">
              Gentle heat, acoustic crack, sweet finish.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#5A3B2E]/90 leading-relaxed font-sans">
              <p>
                In our San Francisco flagship roastery, we roast in small 12-kilogram batches using cast-iron drums. Rather than masking the origin characteristics behind dark, burnt roasts, our profiles seek the golden sweet spot where jasmine florals and cacao nuances sing in unison.
              </p>
              <p>
                Every morning at 6:00 AM, our head roasters taste every roast batch through rigorous SCA cupping standards before releasing beans to the espresso bars.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B1B14] hover:bg-[#5A3B2E] text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Taste the Harvest</span>
                <ArrowRight className="w-4 h-4 text-[#C08A4E]" />
              </Link>
            </div>
          </div>

        </div>
      </SectionContainer>
    </main>
  );
};

