import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Ticket, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  QrCode, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  X,
  Plus,
  Minus,
  Trash2,
  Sliders
} from 'lucide-react';
import type { CartItem } from '../types/product';
import { ItemCustomizerModal } from '../components/ordering/ItemCustomizerModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../api/client';

export const OrderSummary: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart, updateQuantity, removeFromCart, updateCustomization } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { selectedStore, fulfilmentMode, pickupType, selectedSlot, openStoreSelector } = useStore();
  const { setActiveCustomerOrder, playChime } = useRealtime();

  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);

  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirmedCheck, setOrderConfirmedCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voucher Wallet Selection Drawer
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
  const [manualVoucherCode, setManualVoucherCode] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | undefined>(undefined);

  // Payment Modal / Sandbox State
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load user vouchers if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getVouchers().then(res => {
        if (res.success) setUserVouchers(res.vouchers || []);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // Recalculate preview from server
  useEffect(() => {
    if (!selectedStore || items.length === 0) {
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(true);
    setErrorMessage(null);

    const cartPayload = items.map(i => ({
      itemId: i.productId,
      quantity: i.quantity,
      selectedOptionIds: i.selectedOptionIds || []
    }));

    api.previewOrder({
      storeId: selectedStore.id,
      fulfilmentMode,
      slotId: selectedSlot?.slotId,
      items: cartPayload,
      voucherCode: appliedVoucherCode
    })
      .then(res => {
        if (res.success) {
          setPreview(res.preview);
        }
      })
      .catch(err => {
        setErrorMessage(err.message || 'Failed to calculate price preview.');
      })
      .finally(() => {
        setIsLoadingPreview(false);
      });
  }, [selectedStore?.id, fulfilmentMode, selectedSlot?.slotId, items, appliedVoucherCode]);

  const handleApplyVoucher = (code: string) => {
    setAppliedVoucherCode(code);
    setIsVoucherDrawerOpen(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucherCode(undefined);
  };

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!selectedStore) {
      openStoreSelector();
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    if (!orderConfirmedCheck) {
      setErrorMessage('Please confirm you have reviewed your order summary.');
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage(null);

    try {
      const cartPayload = items.map(i => ({
        itemId: i.productId,
        quantity: i.quantity,
        selectedOptionIds: i.selectedOptionIds || []
      }));

      const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const res = await api.createOrder({
        storeId: selectedStore.id,
        fulfilmentMode,
        slotId: selectedSlot?.slotId,
        pickupType,
        items: cartPayload,
        voucherCode: appliedVoucherCode || preview?.appliedVoucher?.code,
        idempotencyKey
      });

      if (res.success && res.paymentIntent) {
        setPaymentIntent(res.paymentIntent);
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCompleteMockPayment = async () => {
    if (!paymentIntent) return;
    setIsProcessingPayment(true);

    try {
      const res = await api.mockCompletePayment({
        orderId: paymentIntent.orderId,
        paymentId: paymentIntent.paymentId,
        transactionId: `TX_${Date.now()}`
      });

      if (res.success) {
        setActiveCustomerOrder({
          id: paymentIntent.orderId,
          orderNumber: (res as any).order?.order_number || paymentIntent.orderNumber,
          status: 'PAID',
          pickupCode: (res as any).order?.pickup_code || '4821',
          shelf: 'Shelf A-03',
          storeName: selectedStore?.name || 'Indiranagar Flagship',
          estimatedMinutes: selectedStore?.avg_prep_time_minutes || 8,
          updatedAt: new Date().toISOString()
        });
        playChime('order');
        clearCart();
        setIsPaymentModalOpen(false);
        navigate(`/order/${paymentIntent.orderId}/track`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleFailMockPayment = async () => {
    if (!paymentIntent) return;
    try {
      await api.mockFailPayment(paymentIntent.orderId, 'User simulated payment failure');
      setIsPaymentModalOpen(false);
      setErrorMessage('Payment failed or cancelled. Your time slot and voucher have been restored.');
    } catch {
      setIsPaymentModalOpen(false);
    }
  };

  if (items.length === 0 && !preview) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2A2723]/5 flex items-center justify-center text-[#2A2723]/40">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-[#2A2723]/60 mb-6">Explore our menu and add your favorite brews to order ahead.</p>
        <button
          onClick={() => navigate('/menu')}
          className="py-3 px-6 rounded-xl font-medium bg-[#2A2723] text-[#FBF4E9] text-xs uppercase tracking-wider"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Point of Truth Checkout</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2A2723]">Order Review & Payment</h1>
        <p className="text-xs text-[#2A2723]/70 mt-1">
          Every item, option surcharge, tax breakdown, and promotional voucher recalculated live from our server.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Store, Items & Customizations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fulfilment Store Banner */}
          <div className="p-5 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D46] px-2 py-0.5 rounded-full bg-[#8C6D46]/10 inline-block mb-1">
                  Fulfilment: {fulfilmentMode}
                </span>
                <h3 className="font-semibold text-base text-[#2A2723]">{selectedStore?.name}</h3>
                <p className="text-xs text-[#2A2723]/70 mt-0.5">{selectedStore?.address}</p>

                <div className="flex items-center gap-4 text-xs text-[#2A2723]/80 mt-3 pt-3 border-t border-[#2A2723]/10">
                  <span className="flex items-center gap-1 text-[#8C6D46] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {pickupType === 'ASAP'
                      ? `Ready in ~${selectedStore?.avg_prep_time_minutes || 8} min`
                      : `Slot: ${selectedSlot?.startTime} - ${selectedSlot?.endTime}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openStoreSelector}
                className="text-xs text-[#8C6D46] font-semibold underline hover:text-[#2A2723] flex-shrink-0"
              >
                Change
              </button>
            </div>
          </div>

          {/* Itemized Lines with Customizations & Interactive Quantity Adjust */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A2723]/8">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[#2A2723]/80">
                Handcrafted Items ({items.length})
              </h3>
              <span className="text-xs text-[#8C6D46] font-medium">
                Tap Customize to calibrate options
              </span>
            </div>

            <div className="divide-y divide-[#2A2723]/10">
              {items.map(item => (
                <div key={item.cartItemId} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-[#2A2723]/5 border border-[#2A2723]/10 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-[#2A2723] truncate">{item.name}</h4>
                        <span className="text-[11px] font-semibold text-[#8C6D46]">₹{item.price} each</span>
                      </div>

                      {/* Customization Details Pill Tags */}
                      {item.customization && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.customization.size && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#5A3B2E] font-medium border border-[#EADFCF]">
                              {item.customization.size}
                            </span>
                          )}
                          {item.customization.milk && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#5A3B2E] font-medium border border-[#EADFCF]">
                              {item.customization.milk}
                            </span>
                          )}
                          {item.customization.sweetness && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#5A3B2E] font-medium border border-[#EADFCF]">
                              {item.customization.sweetness}
                            </span>
                          )}
                          {(item.customization.extras || []).map((ex: string) => (
                            <span key={ex} className="text-[10px] px-2 py-0.5 rounded-md bg-[#EBF3E8] text-[#3F5A36] font-medium border border-[#CDE1C5]">
                              +{ex}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Customize Recipe Trigger Button */}
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => setCustomizingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-[#8C6D46] hover:text-[#2A2723] hover:bg-[#8C6D46]/10 transition-colors border border-[#8C6D46]/35 cursor-pointer active:scale-95 shadow-xs"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#C08A4E]" />
                          <span>Customize Recipe</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper, Line Item Subtotal & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#2A2723]/5">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#2A2723]/20 rounded-full bg-[#FDFBF7] p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#2A2723] hover:bg-[#2A2723]/10 transition-colors cursor-pointer active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-[#2A2723]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#2A2723] hover:bg-[#2A2723]/10 transition-colors cursor-pointer active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Total Price for line item */}
                    <div className="text-right min-w-[70px] font-serif font-bold text-base text-[#2A2723]">
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 rounded-full text-[#2A2723]/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Breakdown & Payment Initiation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Voucher Wallet Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2A2723]/80">
                <Ticket className="w-4 h-4 text-[#8C6D46]" />
                Voucher & Discounts
              </span>
              {preview?.appliedVoucher && (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            {preview?.appliedVoucher ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    {preview.appliedVoucher.code} Applied
                  </span>
                  <h5 className="font-semibold text-xs text-emerald-900">{preview.appliedVoucher.title}</h5>
                </div>
                <span className="font-serif font-bold text-sm text-emerald-700">
                  -₹{preview.discountAmount}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openAuthModal();
                  else setIsVoucherDrawerOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#8C6D46]/60 text-xs font-semibold text-[#8C6D46] hover:bg-[#8C6D46]/5 transition-colors flex items-center justify-between"
              >
                <span>Select Voucher from Wallet ({userVouchers.filter(v => v.status === 'ACTIVE').length} available)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {preview?.voucherError && (
              <p className="text-[11px] text-amber-700 mt-2">{preview.voucherError}</p>
            )}
          </div>

          {/* Server-Recalculated Price Summary */}
          <div className="p-6 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2A2723]/70 mb-2">
              Price Breakdown (INR)
            </h4>

            <div className="flex justify-between text-xs text-[#2A2723]/80">
              <span>Drink Subtotal</span>
              <span className="font-medium">₹{preview?.subtotal ?? 0}</span>
            </div>

            {preview?.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Voucher Savings ({preview.appliedVoucher?.code})</span>
                <span>-₹{preview.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-[#2A2723]/80">
              <span>5% GST (2.5% CGST + 2.5% SGST)</span>
              <span className="font-medium">₹{preview?.totalTax ?? 0}</span>
            </div>

            {fulfilmentMode === 'DELIVERY' && (
              <div className="flex justify-between text-xs text-[#2A2723]/80">
                <span>Artisan Delivery Fee</span>
                <span className="font-medium">₹{preview?.deliveryFee ?? 35}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#2A2723]/10 flex items-center justify-between">
              <div>
                <span className="font-serif text-base font-bold text-[#2A2723]">Grand Total</span>
                <span className="block text-[10px] text-[#2A2723]/60">Includes all applicable taxes</span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#2A2723]">
                ₹{preview?.finalTotal ?? 0}
              </span>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2 pt-2 text-xs text-[#2A2723]/80 cursor-pointer">
              <input
                type="checkbox"
                checked={orderConfirmedCheck}
                onChange={e => setOrderConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded text-[#8C6D46] focus:ring-[#C5A880]"
              />
              <span>I have checked my order items, customizations, and store pickup point.</span>
            </label>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isPlacingOrder || isLoadingPreview}
              onClick={handleCreateOrder}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-medium bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? 'Reserving Slot & Securing...' : `Proceed to Pay ₹${preview?.finalTotal ?? 0}`}
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Voucher Wallet Picker Drawer ── */}
      <AnimatePresence>
        {isVoucherDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FBF4E9] text-[#2A2723] rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-[#2A2723]/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2723]/10 mb-4">
                <h3 className="font-serif text-xl font-bold">Apply Voucher</h3>
                <button onClick={() => setIsVoucherDrawerOpen(false)} className="p-1 rounded-full hover:bg-[#2A2723]/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Manual Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter promo code e.g. LUCKIN50"
                  value={manualVoucherCode}
                  onChange={e => setManualVoucherCode(e.target.value.toUpperCase())}
                  className="flex-grow px-3.5 py-2.5 rounded-xl bg-white border border-[#2A2723]/15 text-xs uppercase font-medium focus:outline-none focus:border-[#8C6D46]"
                />
                <button
                  type="button"
                  onClick={() => handleApplyVoucher(manualVoucherCode)}
                  className="px-4 py-2.5 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs font-semibold hover:bg-[#3D3833]"
                >
                  Apply
                </button>
              </div>

              {/* Wallet List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {userVouchers.filter(v => v.status === 'ACTIVE').length === 0 ? (
                  <p className="text-center py-6 text-xs text-[#2A2723]/60">No active vouchers in wallet.</p>
                ) : (
                  userVouchers.filter(v => v.status === 'ACTIVE').map(v => (
                    <div
                      key={v.user_voucher_id}
                      onClick={() => handleApplyVoucher(v.code)}
                      className="p-3.5 rounded-2xl bg-white border border-[#2A2723]/15 hover:border-[#8C6D46] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-[#8C6D46]">{v.code}</span>
                        <h5 className="font-semibold text-xs text-[#2A2723]">{v.title}</h5>
                        <p className="text-[11px] text-[#2A2723]/60">{v.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#8C6D46] flex items-center gap-1">
                        Use <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Payment Gateway Sandbox Modal ── */}
      <AnimatePresence>
        {isPaymentModalOpen && paymentIntent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A2723] text-[#FBF4E9] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#C5A880]/30"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#FBF4E9]/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#C5A880]/20 text-[#C5A880]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#FBF4E9]">Artisan Payment Gateway</h3>
                    <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">
                      Sandbox Test Mode (Simulated)
                    </span>
                  </div>
                </div>
                <button onClick={handleFailMockPayment} className="p-1 rounded-full hover:bg-white/10 text-white/70">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1A17] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#FBF4E9]/60">Total Payable Amount</span>
                <h2 className="font-serif text-3xl font-bold text-[#FBF4E9] mt-0.5">₹{paymentIntent.amount}</h2>
                <span className="text-[11px] text-[#C5A880]">Order #{paymentIntent.orderId}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 mb-6">
                {[
                  { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, Paytm)' },
                  { id: 'CARD', label: 'Credit / Debit Cards (Visa, Mastercard, RuPay)' },
                  { id: 'NETBANKING', label: 'Net Banking (HDFC, ICICI, SBI)' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      selectedPaymentMethod === m.id
                        ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#FBF4E9]'
                        : 'bg-[#1C1A17] border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <span>{m.label}</span>
                    {selectedPaymentMethod === m.id && <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleCompleteMockPayment}
                  className="w-full py-3.5 px-6 rounded-xl font-medium bg-[#C5A880] text-[#1C1A17] hover:bg-[#B3956F] transition-all font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#C5A880]/20 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? 'Confirming with Gateway...' : `Simulate Successful Payment (₹${paymentIntent.amount})`}
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleFailMockPayment}
                  className="w-full py-2.5 px-4 rounded-xl text-xs text-red-400 hover:text-red-300 hover:underline"
                >
                  Simulate Failed / Cancelled Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
};
