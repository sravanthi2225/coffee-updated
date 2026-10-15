import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Tag, Check, ArrowLeft, Sliders, Sparkles, Ticket } from 'lucide-react';
import { SectionContainer } from '../components/layout/SectionContainer';
import { SectionHeading } from '../components/layout/SectionHeading';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ItemCustomizerModal } from '../components/ordering/ItemCustomizerModal';
import type { CartItem } from '../types/product';

export const Cart: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    items,
    updateQuantity,
    removeFromCart,
    updateCustomization,
    subtotal,
    discountAmount,
    tax,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyPromoCode(couponInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  return (
    <main className="pt-24 sm:pt-28 pb-12 sm:pb-16 min-h-[70vh]">
      <SectionContainer bg="cream" className="!py-0">
        
        <SectionHeading
          overline="Review &amp; Customize"
          title="Your Cart"
          subtitle="Carefully prepared for your next pause. Verify your customizations, adjust cup quantities, or apply seasonal café vouchers."
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE2CF] text-xs font-semibold text-[#5A3B2E]/70 uppercase tracking-wider">
                <span>Selected Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <Link to="/menu" className="text-[#C08A4E] hover:underline flex items-center gap-1 font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Add More Items
                </Link>
              </div>

              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-4 sm:p-6 rounded-2xl bg-[#F7F1E6] border border-[#EFE2CF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-[#EFE2CF] flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#5C6B4E]">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B1B14]">
                        {item.name}
                      </h3>

                      {/* Customization Details */}
                      <div className="text-xs text-[#5A3B2E]/80 space-y-0.5 font-sans">
                        <p>{item.customization.size} • {item.customization.milk}</p>
                        {item.customization.sweetness && (
                          <p className="text-[11px] text-[#5A3B2E]/70">
                            Sweetness: {item.customization.sweetness}
                          </p>
                        )}
                        {item.customization.extras && item.customization.extras.length > 0 && (
                          <p className="text-[11px] text-[#C08A4E]">
                            +{item.customization.extras.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <p className="font-serif text-sm font-bold text-[#2B1B14]">
                          ₹{item.price} each
                        </p>
                        <button
                          type="button"
                          onClick={() => setCustomizingItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-[#8C6D46] hover:text-[#2B1B14] hover:bg-[#8C6D46]/10 transition-colors border border-[#8C6D46]/30 cursor-pointer active:scale-95 shadow-xs"
                        >
                          <Sliders className="w-3 h-3 text-[#C08A4E]" />
                          <span>Customize</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Line Item Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFE2CF]">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#EFE2CF] rounded-full bg-white p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-[#2B1B14]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right">
                      <span className="font-serif text-lg font-bold text-[#2B1B14] block">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-2 text-[#5A3B2E]/60 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Continue Shopping Link */}
              <div className="pt-4">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A3B2E] hover:text-[#2B1B14]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Exploring Menu</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary (4 cols) */}
            <div className="lg:col-span-4 bg-[#F7F1E6] p-6 sm:p-8 rounded-3xl border border-[#EFE2CF] shadow-lg sticky top-28 space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#2B1B14] pb-3 border-b border-[#EFE2CF]">
                Order Summary
              </h3>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-semibold text-[#5A3B2E] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C08A4E]" />
                  Promo / Gift Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Try BLOOM10"
                    className="w-full px-3.5 py-2 text-xs uppercase tracking-wider rounded-xl bg-white border border-[#EFE2CF] text-[#2B1B14] focus:outline-none focus:border-[#C08A4E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2B1B14] hover:bg-[#5A3B2E] text-white text-xs font-semibold transition-all"
                  >
                    Apply
                  </button>
                </div>

                {promoCode && (
                  <div className="flex items-center justify-between text-xs bg-[#5C6B4E]/15 text-[#5C6B4E] px-3 py-1.5 rounded-lg">
                    <span className="font-semibold">Code: {promoCode} (10% off)</span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-rose-600 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {promoMessage && (
                  <p className={`text-xs ${promoMessage.isError ? 'text-rose-600' : 'text-[#5C6B4E]'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Cost Calculations */}
              <div className="space-y-3 pt-2 border-t border-[#EFE2CF] text-xs">
                <div className="flex justify-between text-[#5A3B2E]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2B1B14]">₹{Math.round(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#5C6B4E]">
                    <span>Discount (BLOOM10)</span>
                    <span className="font-semibold">-₹{Math.round(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#5A3B2E]">
                  <span>Estimated Tax (5% GST)</span>
                  <span className="font-semibold text-[#2B1B14]">₹{Math.round(tax)}</span>
                </div>

                <div className="pt-3 border-t border-[#EFE2CF] flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#2B1B14]">Estimated Total</span>
                  <span className="font-serif text-2xl font-bold text-[#2B1B14]">
                    ₹{Math.round(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('Sign in or create an account to proceed with your order.');
                    return;
                  }
                  navigate('/order-summary');
                }}
                className="w-full py-4 rounded-full bg-[#C08A4E] hover:bg-[#D4A369] text-[#2B1B14] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98"
              >
                <span>{isAuthenticated ? 'Proceed to Order Summary' : 'Sign in to Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-[#5A3B2E]/60 italic">
                  ☕ Ready for pickup in 10–15 minutes
                </span>
              </div>
            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="py-16 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#EFE2CF] text-[#5A3B2E] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10 opacity-60" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1B14]">
                Your coffee cup is waiting
              </h3>
              <p className="text-xs sm:text-sm text-[#5A3B2E]/80 leading-relaxed font-sans">
                Your cart is currently empty. Explore our seasonal espresso blends, hand-whisked matcha, and fresh hearth bakery.
              </p>
            </div>

            {!isAuthenticated && (
              <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#C5A880]/30 shadow-sm text-left">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-[#C5A880]/20 text-[#8C6D46]">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B14]">New to Brew & Bloom?</h4>
                    <p className="text-[11px] text-[#5A3B2E]/80">Create an account & get Flat ₹250 Off your first cup.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('Sign in or register to claim your new member perks.')}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C08A4E]" />
                  <span>Sign In / Create Account</span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B1B14] hover:bg-[#5A3B2E] text-[#FBF4E9] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4 text-[#C08A4E]" />
              </Link>
            </div>
          </div>
        )}

      </SectionContainer>
      
      {/* Recipe Calibration & Quantity Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onSave={(cartItemId, customization, qty) => {
          updateCustomization(cartItemId, customization, qty);
          setCustomizingItem(null);
        }}
      />
    </main>
  );
};
