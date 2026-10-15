import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Plus, Minus, ShoppingBag, Check, Flame, MapPin } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { SectionContainer } from '../components/layout/SectionContainer';

export const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const favorite = isFavorite(product.id);

  // Customization state
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || 'Standard'
  );
  const [selectedMilk, setSelectedMilk] = useState<string>(
    product.milkOptions?.[0] || 'Whole Milk'
  );
  const [selectedSweetness, setSelectedSweetness] = useState<string>(
    product.sweetnessOptions?.[0] || 'Standard (100%)'
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const toggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  // Price Calculation
  let extraCost = 0;
  if (selectedMilk.includes('+₹30') || selectedMilk.includes('Oat')) extraCost += 30;
  if (selectedSize.includes('Large')) extraCost += 40;
  extraCost += selectedExtras.length * 40;
  const unitPrice = Math.round(product.price + extraCost);
  const totalPrice = Math.round(unitPrice * quantity);

  const handleAddToCart = () => {
    const added = addToCart(
      product,
      {
        size: selectedSize,
        milk: selectedMilk,
        sweetness: selectedSweetness,
        extras: selectedExtras,
      },
      quantity
    );

    if (added !== false) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2400);
    }
  };

  return (
    <main className="py-8 sm:py-12">
      <SectionContainer bg="cream" className="!py-0">
        
        {/* Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A3B2E] hover:text-[#2B1B14] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>

          <span className="text-xs uppercase tracking-widest text-[#5C6B4E] font-bold">
            {product.category}
          </span>
        </div>

        {/* Split Desktop / Stacked Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Product Imagery Stage */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden bg-[#EFE2CF] shadow-xl border border-[#E5D5BF]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Floating Favorite Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-label="Save to favorites"
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                  favorite
                    ? 'bg-[#5C6B4E] text-white'
                    : 'bg-[#FBF4E9]/80 text-[#2B1B14] hover:bg-[#FBF4E9]'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Origin & Method Badges */}
            <div className="grid grid-cols-2 gap-3">
              {product.origin && (
                <div className="p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#EFE2CF] flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#C08A4E] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A3B2E]/70 block">Origin</span>
                    <span className="text-xs font-serif font-bold text-[#2B1B14]">{product.origin}</span>
                  </div>
                </div>
              )}
              {product.brewMethod && (
                <div className="p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#EFE2CF] flex items-center gap-3">
                  <Flame className="w-4 h-4 text-[#5C6B4E] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5A3B2E]/70 block">Extraction</span>
                    <span className="text-xs font-serif font-bold text-[#2B1B14]">{product.brewMethod}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Customizers */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {product.rating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#2B1B14]">
                    <Star className="w-4 h-4 fill-[#C08A4E] text-[#C08A4E]" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-[#5A3B2E]/60 font-normal">
                      ({product.reviewsCount} café reviews)
                    </span>
                  </div>
                )}
                {product.calories && (
                  <span className="text-xs text-[#5A3B2E]/70">
                    • {product.calories} kcal
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B14] leading-tight">
                {product.name}
              </h1>

              <p className="font-serif text-2xl font-bold text-[#C08A4E] pt-1 flex items-baseline gap-1">
                <span>₹</span>
                <span>{unitPrice}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-[#5A3B2E] leading-relaxed font-sans border-b border-[#EFE2CF] pb-5">
              {product.description}
            </p>

            {/* Flavor Notes */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B4E] block mb-2">
                Sensory Flavor Notes
              </span>
              <div className="flex flex-wrap gap-2">
                {product.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 rounded-full bg-[#EFE2CF] text-[#2B1B14] text-xs font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A3B2E] block">
                  Select Size
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSize === s
                          ? 'bg-[#2B1B14] text-white border-[#2B1B14]'
                          : 'bg-[#F7F1E6] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C08A4E]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Milk Options */}
            {product.milkOptions && product.milkOptions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A3B2E] block">
                  Milk / Plant Blend
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {product.milkOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMilk(m)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                        selectedMilk === m
                          ? 'bg-[#2B1B14] text-white border-[#2B1B14]'
                          : 'bg-[#F7F1E6] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C08A4E]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sweetness Options */}
            {product.sweetnessOptions && product.sweetnessOptions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A3B2E] block">
                  Sweetness Calibration
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {product.sweetnessOptions.map((sw) => (
                    <button
                      key={sw}
                      type="button"
                      onClick={() => setSelectedSweetness(sw)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSweetness === sw
                          ? 'bg-[#2B1B14] text-white border-[#2B1B14]'
                          : 'bg-[#F7F1E6] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C08A4E]'
                      }`}
                    >
                      {sw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras Selection */}
            {product.availableExtras && product.availableExtras.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A3B2E] block">
                  Add Extras (+ ₹40 each)
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.availableExtras.map((ex) => {
                    const active = selectedExtras.includes(ex);
                    return (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => toggleExtra(ex)}
                        className={`py-1.5 px-3 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-[#5C6B4E] text-white border-[#5C6B4E]'
                            : 'bg-[#F7F1E6] text-[#5A3B2E] border-[#EFE2CF] hover:border-[#C08A4E]'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                        <span>{ex}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Final Add to Cart Button */}
            <div className="pt-6 border-t border-[#EFE2CF] space-y-4">
              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex items-center border border-[#EFE2CF] rounded-full bg-[#F7F1E6] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-[#2B1B14]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right flex-grow">
                  <span className="text-[10px] uppercase font-bold text-[#5A3B2E]/70 block">Total</span>
                  <span className="font-serif text-2xl font-bold text-[#2B1B14]">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-full bg-[#2B1B14] hover:bg-[#C08A4E] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                {addedToast ? 'Added to Cart!' : `Add ${quantity} to Cart • ₹${totalPrice}`}
              </button>
            </div>

          </div>

        </div>

      </SectionContainer>
    </main>
  );
};
