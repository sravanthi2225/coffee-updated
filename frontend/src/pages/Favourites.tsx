import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

export const Favourites: React.FC = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const favoriteProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16 min-h-[70vh]">
      <SectionContainer bg="cream" className="!py-0">
        
        <SectionHeading
          overline="Your Saved Sanctuary"
          title="Your Favorites"
          subtitle="Your personal vault of morning rituals, favorite roasts, and artisanal bakery treats."
        />

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#F7F1E6] rounded-2xl overflow-hidden border border-[#EFE2CF] shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EFE2CF]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#2B1B14] hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5C6B4E]">
                      {product.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2B1B14] mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#5A3B2E]/80 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE2CF] flex items-center justify-between">
                    <span className="font-serif text-xl font-bold text-[#2B1B14] flex items-baseline">
                      <span className="text-[#C08A4E] text-base font-sans font-bold mr-0.5">₹</span>
                      {product.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/menu/${product.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5A3B2E] hover:text-[#2B1B14] hover:bg-[#EFE2CF] transition-colors"
                      >
                        Customize
                      </Link>
                      <button
                        type="button"
                        onClick={() => addToCart(product, undefined, 1)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2B1B14] hover:bg-[#C08A4E] text-white text-xs font-semibold transition-all shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#EFE2CF] text-[#C08A4E] flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10 opacity-70" />
            </div>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B14]">
              No favorites saved yet
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5A3B2E]/80 leading-relaxed font-sans">
              Whenever you discover a brew, cold drip, or croissant you cherish, tap the heart icon to save it here for swift ordering.
            </p>

            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B1B14] hover:bg-[#5A3B2E] text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Explore Specialty Coffee</span>
                <ArrowRight className="w-4 h-4 text-[#C08A4E]" />
              </Link>
            </div>
          </div>
        )}

      </SectionContainer>
    </main>
  );
};
