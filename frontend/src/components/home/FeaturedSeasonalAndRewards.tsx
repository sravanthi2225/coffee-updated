import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Ticket,
  Star,
  Plus,
  ArrowRight,
  Heart,
  Calendar,
  Coffee,
  Check,
  TrendingUp,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { PRODUCTS } from '../../data/products';

export const FeaturedSeasonalAndRewards: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const [addedId, setAddedId] = useState<string | null>(null);

  const seasonalPicks = PRODUCTS.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.8)).slice(0, 4);

  const handleQuickAdd = (product: typeof PRODUCTS[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, undefined, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] relative z-20">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ── 1. LOYALTY & REWARDS SUMMARY CARD (LUCKIN MODEL) ── */}
        <div className="bg-[#241610] text-[#FBF4E9] rounded-3xl p-6 sm:p-8 border border-[#C5A880]/30 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>{isAuthenticated ? `${user?.membership_tier || 'BLUE'} Tier Member` : 'Artisan Rewards Club'}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FBF4E9]">
                {isAuthenticated
                  ? `Welcome, ${user?.name || 'Coffee Lover'} — You have ${user?.loyalty_points || 0} pts`
                  : 'Start with Flat ₹250 Off Your Inaugural Brew'}
              </h2>

              <p className="text-xs sm:text-sm text-[#FBF4E9]/75 font-sans leading-relaxed">
                {isAuthenticated
                  ? `You have ${user?.activeVouchersCount || 2} active vouchers in your sanctuary wallet. Redeem against your favorite single-origin roast.`
                  : 'Join thousands of coffee lovers enjoying smart no-cashier pickup, table reservations, and 50% referral passes.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="py-3 px-5 rounded-2xl bg-[#C5A880] text-[#1E140F] text-xs font-bold uppercase tracking-wider hover:bg-[#B3956F] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View Wallet &amp; Vouchers</span>
                  </Link>

                  <Link
                    to="/book-table"
                    className="py-3 px-5 rounded-2xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#C5A880]" />
                    <span>Book Tasting Table</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="py-3.5 px-6 rounded-2xl bg-[#C5A880] text-[#1E140F] text-xs font-bold uppercase tracking-wider hover:bg-[#B3956F] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer font-sans"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Claim Free Cup &amp; Join</span>
                  </Link>
                  <Link
                    to="/login"
                    className="py-3.5 px-5 rounded-2xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. FEATURED & SEASONAL PICKS ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#2B1B14]/10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6D46] uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 text-[#8C6D46]" />
                <span>Curated Roasts</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B14]">
                Seasonal Creations &amp; Popular Picks
              </h3>
            </div>

            <Link
              to="/menu"
              className="text-xs font-bold uppercase tracking-wider text-[#8C6D46] hover:text-[#2B1B14] flex items-center gap-1"
            >
              <span>Explore Entire Menu ({PRODUCTS.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalPicks.map(product => {
              const isFav = favorites.includes(product.id);
              const isJustAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#2B1B14]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#EFE2CF]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex gap-1">
                      {product.isBestSeller && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#2B1B14]/85 backdrop-blur-md text-[#C5A880] text-[9px] font-bold uppercase tracking-wider">
                          Top Pick
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8C6D46] text-white text-[9px] font-bold uppercase tracking-wider">
                        Signature
                      </span>
                    </div>

                    {/* Favorite Heart */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#2B1B14] hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#5C6B4E] font-bold uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-[#2B1B14] group-hover:text-[#8C6D46] transition-colors line-clamp-1">
                        {product.name}
                      </h4>

                      <p className="text-xs text-[#5A3B2E]/70 line-clamp-2 mt-1 font-sans">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#2B1B14]/8 flex items-center justify-between">
                      <div className="font-serif text-lg font-bold text-[#2B1B14]">
                        ₹{product.price}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/menu/${product.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-[#8C6D46] hover:underline"
                        >
                          Calibrate
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`p-2 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-90 ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#2B1B14] hover:bg-[#8C6D46] text-[#FBF4E9]'
                          }`}
                          aria-label={`Quick add ${product.name}`}
                          title="Quick Add to Cart"
                        >
                          {isJustAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. SANCTUARY LOUNGE PRE-BOOKING STRIP ── */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1C1A17] via-[#2A231C] to-[#1C1A17] text-[#FBF4E9] p-6 sm:p-8 border border-[#C5A880]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880]">
                Live Capacity Reservations
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FBF4E9]">
                Pre-Book a Tasting Room or Alcove Table
              </h3>
              <p className="text-xs text-[#FBF4E9]/70 mt-0.5">
                Reserve 15-minute slots at Indiranagar, Koramangala, or Old Roastery Pier with zero waiting.
              </p>
            </div>
          </div>

          <Link
            to="/book-table"
            className="py-3 px-6 rounded-2xl bg-[#C5A880] hover:bg-[#B3956F] text-[#1E140F] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-lg"
          >
            <span>Reserve Table Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
