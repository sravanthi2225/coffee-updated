import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Menu as MenuIcon, 
  X, 
  Search, 
  ChevronRight,
  User,
  MapPin,
  Ticket
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useRealtime } from '../../context/RealtimeContext';
import { LuckinTopAnnouncement } from '../realtime/LuckinTopAnnouncement';
import { motion, AnimatePresence } from 'framer-motion';

// Artisan Steaming Coffee Cup Logo Emblem
export const CoffeeBrandLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7 sm:w-8 sm:h-8' }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Outer circle with warm golden accent rim */}
    <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    {/* Steaming Coffee Cup with Saucer */}
    <path 
      d="M11 16.5H26V22C26 25 23.5 26.5 18.5 26.5C13.5 26.5 11 25 11 22V16.5Z" 
      fill="currentColor"
    />
    <path 
      d="M26 18H28C29.1 18 30 18.9 30 20C30 21.1 29.1 22 28 22H25.5" 
      stroke="currentColor" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
    />
    <path 
      d="M9 29.5H29" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
    />
    {/* Steam wisps */}
    <path 
      d="M15 10C14.5 11.5 15.5 12.5 15 13.8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M19 9C18.5 10.8 19.5 11.8 19 13.8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M23 10C22.5 11.5 23.5 12.5 23 13.8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
  </svg>
);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { itemCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { selectedStore, openStoreSelector } = useStore();
  const { liveStores } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll listener: activates solid background matching website color grading on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Nav links requested: Home, Menu, coffee-types, our-story, locations, contact
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Coffee Types', path: '/coffee-types' },
    { name: 'Our Story', path: '/our-story' },
    { name: 'Locations', path: '/locations' },
    { name: 'Contact', path: '/contact' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          FULL-WIDTH FIXED NAVBAR
          - Transparent at top (Image 1 style)
          - Scrolled: Solid rich background matching website color grading (Image 2 style)
      ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 flex flex-col">
        {/* Real-Time Flash Deals & Live Activity Announcement Bar */}
        <LuckinTopAnnouncement />

        {/* Main Navigation Row */}
        <div
          className={`w-full transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'bg-[#2B1B14] border-b border-[#43291C]/70 shadow-[0_4px_25px_rgba(0,0,0,0.45)] py-3 sm:py-4'
              : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent py-3.5 sm:py-4.5'
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* ─────────────────────────────────────────────────────────
              BRAND LOGO: ARTISAN COFFEE LOGO + BREW & BLOOM
          ───────────────────────────────────────────────────────── */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none shrink-0"
            aria-label="Brew & Bloom Home"
          >
            <div className="text-white transition-transform duration-300 group-hover:scale-105">
              <CoffeeBrandLogo className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <span className="font-serif font-bold text-white text-[19px] sm:text-[22px] tracking-wide leading-none uppercase select-none">
              Brew &amp; Bloom
            </span>
          </Link>

          {/* Active Store Indicator Pill - User Portal Only (when logged in) */}
          {isAuthenticated && selectedStore && (() => {
            const liveMetric = (liveStores?.find((s: any) => s.id === selectedStore?.id) || selectedStore) as any;
            const isRush = liveMetric?.status === 'BUSY' || (liveMetric?.inQueue ?? 0) >= 4;
            const livePrep = liveMetric?.livePrepTime || liveMetric?.avg_prep_time_minutes || 8;
            return (
              <button
                type="button"
                onClick={openStoreSelector}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-all shadow-sm group"
                title="Change pickup store or view live queue radar"
              >
                <span className={`w-2 h-2 rounded-full ${isRush ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="truncate max-w-[130px] font-semibold">
                  {selectedStore.name.split('—')[1] || selectedStore.name}
                </span>
                <span className="text-[#C5A880] text-[11px] font-bold">• ~{livePrep}m</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                  isRush ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isRush ? 'Rush' : 'Fast'}
                </span>
              </button>
            );
          })()}

          {/* ─────────────────────────────────────────────────────────
              CENTER/DESKTOP NAVIGATION LINKS
              - Home, Menu, Coffee Types, Our Story, Locations, Contact
              - Active item has horizontal white indicator bar directly underneath
          ───────────────────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="relative py-1 text-[14.5px] xl:text-[15.5px] select-none flex flex-col items-center focus:outline-none transition-colors duration-200"
                >
                  <span className={`${active ? 'font-bold text-white' : 'font-medium text-white/90 hover:text-white'}`}>
                    {link.name}
                  </span>

                  {/* Active Underline Pill Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1.5 sm:-bottom-2 w-6 sm:w-7 h-[3px] bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ─────────────────────────────────────────────────────────
              RIGHT ACTIONS: SEARCH + FAVORITES + CART + HAMBURGER
          ───────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 text-white shrink-0">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Search"
              title="Search menu"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* User Portal Actions: Favorites & Shopping Cart (Visible inside User Portal when Authenticated) */}
            {isAuthenticated && (
              <>
                {/* Favorites Icon */}
                <Link
                  to="/favourites"
                  className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                  aria-label="Favorites"
                  title="View Favorites"
                >
                  <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  {favoritesCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-white text-[#2B1B14] text-[9px] font-black flex items-center justify-center shadow-md">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                {/* Shopping Cart Bag */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                  aria-label="Shopping Cart"
                  title="View Cart"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  {itemCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-white text-[#2B1B14] text-[9px] font-black flex items-center justify-center shadow-md">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Member Profile / Sign-in */}
            {isAuthenticated ? (
              <Link
                to="/account"
                className="relative p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Member Account"
                title="Account & Vouchers"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {user?.activeVouchersCount ? (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C5A880] text-[#1C1A17] text-[9px] font-black flex items-center justify-center shadow-md">
                    {user.activeVouchersCount}
                  </span>
                ) : null}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A880] hover:bg-[#B3956F] text-[#1C1A17] text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors focus:outline-none ml-1"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            INLINE SEARCH EXPANDABLE BAR
        ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full px-4 sm:px-8 pt-3 pb-2 flex justify-center"
            >
              <form 
                onSubmit={handleSearchSubmit}
                className="relative w-full max-w-xl bg-black/60 backdrop-blur-md rounded-full border border-white/20 shadow-xl p-1.5 flex items-center"
              >
                <Search className="w-4 h-4 text-white/70 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Espresso, Latte, Cold Brew, Vanilla..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-white/50 px-3 py-1.5 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-white text-[#2B1B14] text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors shrink-0"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white ml-1 mr-1.5 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE NAVIGATION DRAWER
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full max-w-sm bg-[#2B1B14] text-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto border-l border-[#43291C]"
            >
              <div>
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <CoffeeBrandLogo className="w-7 h-7 text-white" />
                    <span className="font-serif font-bold text-lg text-white uppercase">
                      Brew &amp; Bloom
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-1 py-5">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.path);

                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all ${
                          active
                            ? 'bg-white/15 text-white font-bold'
                            : 'text-white/85 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {link.name}
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Footer Actions */}
              <div className="pt-6 border-t border-white/15 flex items-center justify-around text-xs text-white/85">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/favourites" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="flex items-center gap-1.5 font-bold hover:text-white transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Favorites ({favoritesCount})</span>
                    </Link>
                    <div className="w-[1px] h-4 bg-white/20" />
                    <Link 
                      to="/cart" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="flex items-center gap-1.5 font-bold hover:text-white transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Cart ({itemCount})</span>
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('Sign in to access your order-ahead cart & perks.');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C5A880] text-[#1C1A17] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
