import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ArrowRight, Check } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [justAdded, setJustAdded] = useState(false);
  const favorite = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCart(product, undefined, 1);
    if (added !== false) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col justify-between bg-white rounded-[26px] overflow-hidden border border-[#EFE5D8] shadow-[0_8px_24px_rgba(43,27,20,0.05)] hover:shadow-[0_20px_42px_rgba(43,27,20,0.11)] hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Product Image Stage */}
      <Link to={`/menu/${product.id}`} className="block relative w-full aspect-[4/3] overflow-hidden bg-[#F4ECE1]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Category Pill */}
        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#5A3B2E] shadow-sm border border-black/5">
          {product.category}
        </span>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border border-black/5 transition-all shadow-sm ${
            favorite
              ? 'bg-[#5C6B4E] text-white scale-105'
              : 'bg-white/90 text-[#2B1B14] hover:text-[#C08A4E] hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Product Details Section */}
      <div className="p-5 sm:p-5.5 flex flex-col flex-grow justify-between space-y-3.5">
        <div className="space-y-2">
          {/* Rating preview */}
          {product.rating && (
            <div className="flex items-center gap-1.5 text-xs text-[#8C7A6B]">
              <Star className="w-3.5 h-3.5 fill-[#C08A4E] text-[#C08A4E]" />
              <span className="font-bold text-[#2B1B14]">{product.rating.toFixed(1)}</span>
              <span className="text-[#8C7A6B]/80 font-normal">({product.reviewsCount})</span>
            </div>
          )}

          <Link to={`/menu/${product.id}`}>
            <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#2B1B14] group-hover:text-[#C08A4E] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#735E50] line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        </div>

        {/* Flavor Notes Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {product.flavorNotes.slice(0, 3).map((note) => (
            <span
              key={note}
              className="text-[10px] px-2.5 py-1 rounded-md bg-[#F6EFE5] text-[#5A3B2E] font-medium border border-[#EADFCF]/70"
            >
              {note}
            </span>
          ))}
        </div>

        {/* Price & Action Row (Matching Reference Image Exactly) */}
        <div className="pt-3.5 border-t border-[#F0E6D8] flex items-center justify-between gap-2">
          <div className="shrink-0">
            <span className="text-[9.5px] text-[#8C7A6B] uppercase tracking-wider font-bold block">
              PRICE
            </span>
            <span className="font-serif text-xl sm:text-[22px] font-bold text-[#1C0E07] flex items-baseline">
              <span className="text-base font-sans font-bold mr-0.5 text-[#1C0E07]">₹</span>
              {product.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add to Cart Pill Button with Cart Icon */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                justAdded
                  ? 'bg-[#5C6B4E] text-white'
                  : 'bg-[#180A04] hover:bg-[#2C1408] text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#C59B63]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H21L19 14H8L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6L4 2H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="18" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            {/* Amber Circular Arrow Button */}
            <Link
              to={`/menu/${product.id}`}
              className="w-8 h-8 rounded-full bg-[#D4A373] hover:bg-[#C28E5C] text-[#180A04] flex items-center justify-center transition-all shadow-sm shrink-0 hover:scale-105 active:scale-95"
              title="View details & customize"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </Link>
          </div>
        </div>

      </div>
    </motion.article>
  );
};
