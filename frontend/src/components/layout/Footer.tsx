import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Heart, Music, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#2B1B14] text-[#FBF4E9] pt-16 sm:pt-20 pb-12 border-t border-[#3E291F]">
      {/* Subtle Coffee Visuals in Footer Corners */}
      <div className="absolute top-0 right-0 w-48 sm:w-64 pointer-events-none select-none opacity-40 z-0">
        <img src="/images/journey/beans-corner.png" alt="" className="w-full h-auto transform rotate-45" />
      </div>
      <div className="absolute bottom-0 left-0 w-44 sm:w-60 pointer-events-none select-none opacity-25 z-0">
        <img src="/images/journey/leaves-corner.png" alt="" className="w-full h-auto transform -rotate-45" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          
          {/* Brand & Manifesto Column */}
          <div className="lg:col-span-4 space-y-4 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#C08A4E] text-[#2B1B14] flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FBF4E9] uppercase">
                Brew &amp; Bloom
              </span>
            </Link>
            
            <p className="text-sm text-[#FBF4E9]/70 leading-relaxed max-w-sm mx-auto md:mx-0 font-sans">
              "A little pause. A perfect cup." Specialty single-origin coffees, gentle mornings, and quiet café sanctuaries designed for unhurried souls.
            </p>

            {/* Hours summary */}
            <div className="pt-2 text-xs text-[#C08A4E] font-medium tracking-wide">
              <span>Open Daily: 7:00 AM – 8:00 PM • Roastery &amp; Espresso Bar</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="lg:col-span-2 space-y-4 text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C08A4E]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FBF4E9]/80 font-medium">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Experience</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">Specialty Menu</Link>
              </li>
              <li>
                <Link to="/coffee-types" className="hover:text-white transition-colors">Types of Coffee</Link>
              </li>
              <li>
                <Link to="/our-story" className="hover:text-white transition-colors">Our Story &amp; Craft</Link>
              </li>
              <li>
                <Link to="/locations" className="hover:text-white transition-colors">Find a Café</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div className="lg:col-span-2 space-y-4 text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C08A4E]">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FBF4E9]/80 font-medium">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-white transition-colors">Saved Favorites</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Your Order Cart</Link>
              </li>
              <li>
                <Link to="/order-summary" className="hover:text-white transition-colors">Checkout &amp; Pickup</Link>
              </li>
              <li>
                <Link to="/coffee-types" className="hover:text-white transition-colors">Brewing Guides</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter & Harvest Notes */}
          <div className="lg:col-span-4 space-y-4 text-center md:text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C08A4E]">
              Harvest Notes &amp; Events
            </h4>
            <p className="text-xs text-[#FBF4E9]/70 leading-relaxed">
              Subscribe to receive weekly single-origin tasting cards, brewing masterclasses, and acoustic café night invites.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex max-w-sm mx-auto md:mx-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-2.5 rounded-full bg-white/10 text-xs text-[#FBF4E9] placeholder-[#FBF4E9]/40 border border-white/15 focus:outline-none focus:border-[#C08A4E] pr-10"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-full bg-[#C08A4E] text-[#2B1B14] hover:bg-[#D4A369] transition-all flex items-center justify-center font-bold"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-[#5C6B4E] flex items-center justify-center md:justify-start gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Thank you. Welcome to the Brew &amp; Bloom family.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FBF4E9]/60 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Brew &amp; Bloom Coffee Roasters. All rights reserved. Specialty Café Experience.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:space-x-6 sm:gap-0">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://spotify.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Spotify Café Playlist">
              <Music className="w-4 h-4" />
            </a>
            <span className="flex items-center gap-1 text-[#C08A4E]">
              Crafted with <Heart className="w-3 h-3 fill-current inline" /> for coffee lovers
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
