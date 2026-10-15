import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coffee,
  Plus,
  Minus,
  AlertCircle,
  QrCode,
  Share2,
  Compass,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';

export const BookSlot: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const { stores, selectedStore, setSelectedStore } = useStore();

  // Wizard Steps: 1. DETAILS -> 2. PREORDER -> 3. CONFIRMATION
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [activeStoreId, setActiveStoreId] = useState(selectedStore?.id || 'store_indiranagar');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [tableType, setTableType] = useState<'STANDARD' | 'WINDOW_ALCOVE' | 'BARISTA_BAR' | 'OUTDOOR_PATIO'>('STANDARD');
  const [specialNotes, setSpecialNotes] = useState('');
  const [preorderItems, setPreorderItems] = useState<{ productId: string; name: string; price: number; quantity: number }[]>([]);

  // Slots Loading & Data
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync store selection
  useEffect(() => {
    if (selectedStore?.id && selectedStore.id !== activeStoreId) {
      setActiveStoreId(selectedStore.id);
    }
  }, [selectedStore]);

  // Fetch slots on store or date change
  useEffect(() => {
    if (!activeStoreId) return;
    setIsLoadingSlots(true);
    setSelectedSlot(null);

    api.getStoreSlots(activeStoreId, bookingDate)
      .then(res => {
        if (res.success) {
          setSlots(res.slots || []);
        }
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [activeStoreId, bookingDate]);

  // Pre-order drink helper
  const handleTogglePreorder = (product: typeof PRODUCTS[0]) => {
    setPreorderItems(prev => {
      const exists = prev.find(p => p.productId === product.id);
      if (exists) {
        return prev.filter(p => p.productId !== product.id);
      } else {
        return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
    });
  };

  const handleUpdatePreorderQty = (productId: string, delta: number) => {
    setPreorderItems(prev =>
      prev.map(p => {
        if (p.productId === productId) {
          const newQty = Math.max(1, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      })
    );
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in to confirm your tasting lounge table reservation.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select a preferred time slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.createBooking({
        storeId: activeStoreId,
        slotId: selectedSlot.slotId,
        bookingDate,
        startTime: selectedSlot.startTime,
        partySize,
        tableType,
        specialNotes: specialNotes.trim() || undefined,
        preorderItems: preorderItems.length > 0 ? preorderItems : undefined
      });

      if (res.success) {
        setConfirmedBooking(res.booking);
        setStep(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStore = stores.find(s => s.id === activeStoreId) || selectedStore || stores[0];

  // Quick Date options (Today, Tomorrow, Day+2, Day+3)
  const quickDates = [0, 1, 2, 3].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  return (
    <div className="min-h-screen bg-[#FBF4E9] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C6D46]/10 text-[#8C6D46] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisan Tasting Lounge Pre-Booking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1B14]">
            Reserve Your Pause
          </h1>
          <p className="text-sm text-[#5A3B2E]/80 mt-1 max-w-xl">
            Book a lounge table, select your ambiance, and optionally queue your barista pour before arrival.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ── STEP 1: STORE, DATE, GUESTS & TIME SLOT ── */}
        {step === 1 && (
          <div className="space-y-8">
            
            {/* 1. Store Selection Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#2B1B14]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B1B14]/10">
                <span className="text-xs font-bold text-[#2B1B14] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8C6D46]" /> 1. Select Roastery Sanctuary
                </span>
                <span className="text-xs text-[#8C6D46] font-semibold">{stores.length} Outlets Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stores.map(store => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setActiveStoreId(store.id);
                      setSelectedStore(store);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeStoreId === store.id
                        ? 'bg-[#FAF4EB] border-[#8C6D46] ring-2 ring-[#8C6D46]/20 shadow-sm'
                        : 'bg-white border-[#2B1B14]/10 hover:border-[#8C6D46]/40'
                    }`}
                  >
                    <h3 className="font-serif font-bold text-sm text-[#2B1B14] line-clamp-1">{store.name}</h3>
                    <p className="text-[11px] text-[#5A3B2E]/70 line-clamp-2 mt-1">{store.address}</p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold uppercase tracking-wider">
                      Dine-in Open
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Date Selection */}
            <div className="bg-white p-6 rounded-3xl border border-[#2B1B14]/10 shadow-sm space-y-4">
              <span className="text-xs font-bold text-[#2B1B14] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#2B1B14]/10">
                <CalendarIcon className="w-4 h-4 text-[#8C6D46]" /> 2. Choose Reservation Date
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickDates.map(qd => (
                  <button
                    key={qd.dateStr}
                    type="button"
                    onClick={() => setBookingDate(qd.dateStr)}
                    className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      bookingDate === qd.dateStr
                        ? 'bg-[#2B1B14] text-[#FBF4E9] border-[#2B1B14] shadow-md'
                        : 'bg-[#FDFBF7] text-[#2B1B14] border-[#2B1B14]/10 hover:border-[#8C6D46]'
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider opacity-80">{qd.dayName}</span>
                    <span className="font-serif text-lg font-bold block mt-0.5">{qd.formattedDate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Party Size & Table Ambiance */}
            <div className="bg-white p-6 rounded-3xl border border-[#2B1B14]/10 shadow-sm space-y-5">
              <span className="text-xs font-bold text-[#2B1B14] uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#2B1B14]/10">
                <Users className="w-4 h-4 text-[#8C6D46]" /> 3. Party Size &amp; Atmosphere
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Party Size Stepper */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF4EB] border border-[#EADFCF]">
                  <div>
                    <h4 className="font-bold text-xs text-[#2B1B14]">Number of Guests</h4>
                    <p className="text-[11px] text-[#5A3B2E]/70">Includes complimentary table pour-over tasting</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPartySize(Math.max(1, partySize - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-[#2B1B14]/15 flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-serif font-bold text-base text-[#2B1B14] w-6 text-center">{partySize}</span>
                    <button
                      type="button"
                      onClick={() => setPartySize(Math.min(8, partySize + 1))}
                      className="w-8 h-8 rounded-full bg-white border border-[#2B1B14]/15 flex items-center justify-center text-[#2B1B14] hover:bg-[#EFE2CF] active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Table Ambiance Choice */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'STANDARD', label: 'Main Hall' },
                    { id: 'WINDOW_ALCOVE', label: 'Window Alcove' },
                    { id: 'BARISTA_BAR', label: 'Barista Bar' },
                    { id: 'OUTDOOR_PATIO', label: 'Garden Patio' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTableType(t.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        tableType === t.id
                          ? 'bg-[#8C6D46] text-[#FBF4E9] border-[#8C6D46]'
                          : 'bg-[#FDFBF7] text-[#2B1B14] border-[#2B1B14]/10 hover:border-[#8C6D46]/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Time Slots Grid */}
            <div className="bg-white p-6 rounded-3xl border border-[#2B1B14]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B1B14]/10">
                <span className="text-xs font-bold text-[#2B1B14] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8C6D46]" /> 4. Select Available Time Slot
                </span>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Filling Fast
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-300" /> Full
                  </span>
                </div>
              </div>

              {isLoadingSlots ? (
                <div className="py-12 text-center text-xs text-[#5A3B2E]/60 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin" />
                  <span>Loading live sanctuary slot capacity...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5A3B2E]/60">
                  No slots currently generated for this date. Please choose another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {slots.map(s => {
                    const isSelected = selectedSlot?.slotId === s.slotId;
                    const isFillingFast = s.remainingCapacity <= 4 && s.remainingCapacity > 0;
                    const isFull = s.remainingCapacity <= 0 || !s.isAvailable;

                    return (
                      <button
                        key={s.slotId}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlot(s)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          isFull
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-[#2B1B14] text-[#FBF4E9] border-[#2B1B14] shadow-md ring-2 ring-[#8C6D46]/40'
                            : isFillingFast
                            ? 'bg-amber-50/50 border-amber-300 text-[#2B1B14] hover:border-amber-500'
                            : 'bg-[#FDFBF7] border-[#2B1B14]/10 text-[#2B1B14] hover:border-[#8C6D46]'
                        }`}
                      >
                        <span className="font-serif font-bold text-sm block">{s.startTime}</span>
                        <span className="text-[10px] font-semibold block mt-0.5 opacity-80">
                          {isFull ? 'Full' : `${s.remainingCapacity} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <Link
                to="/menu"
                className="text-xs font-bold uppercase tracking-wider text-[#5A3B2E] hover:text-[#2B1B14] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Browse Drink Menu
              </Link>

              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
                className="py-3.5 px-6 rounded-2xl bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Continue to Optional Pre-Order</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 2: OPTIONAL PRE-ORDER DRINKS & SUMMARY ── */}
        {step === 2 && (
          <div className="space-y-8">
            
            <div className="bg-white p-6 rounded-3xl border border-[#2B1B14]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B1B14]/10">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2B1B14]">Queue Drinks in Advance (Optional)</h3>
                  <p className="text-xs text-[#5A3B2E]/70 mt-0.5">
                    Pre-ordered beverages will be freshly extracted as soon as you are seated.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8C6D46] px-3 py-1 rounded-full bg-[#8C6D46]/10">
                  {preorderItems.length} Selected
                </span>
              </div>

              {/* Popular Menu Picks for Quick Add */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {PRODUCTS.slice(0, 6).map(prod => {
                  const itemInPreorder = preorderItems.find(p => p.productId === prod.id);

                  return (
                    <div
                      key={prod.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        itemInPreorder
                          ? 'bg-[#FAF4EB] border-[#8C6D46]'
                          : 'bg-[#FDFBF7] border-[#2B1B14]/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-xs text-[#2B1B14] truncate">{prod.name}</h4>
                          <span className="text-xs font-bold text-[#8C6D46]">₹{prod.price}</span>
                        </div>
                      </div>

                      {itemInPreorder ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdatePreorderQty(prod.id, -1)}
                            className="w-7 h-7 rounded-full bg-white border border-[#2B1B14]/15 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs w-4 text-center">{itemInPreorder.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePreorderQty(prod.id, 1)}
                            className="w-7 h-7 rounded-full bg-white border border-[#2B1B14]/15 flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePreorder(prod)}
                          className="px-3 py-1.5 rounded-xl border border-[#8C6D46] text-[#8C6D46] hover:bg-[#8C6D46] hover:text-[#FBF4E9] text-xs font-bold transition-all"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Special dietary or celebration note */}
              <div className="pt-3">
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  Special Occasion or Dietary Note (Optional)
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Anniversary celebration, prefer quiet alcove table"
                  className="w-full px-4 py-2.5 bg-[#FAF4EB] rounded-xl border border-[#2B1B14]/15 text-xs text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
              </div>
            </div>

            {/* Reservation Summary Card */}
            <div className="bg-[#2B1B14] text-[#FBF4E9] p-6 rounded-3xl border border-[#C5A880]/30 shadow-lg space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#C5A880] pb-2 border-b border-white/10">
                Reservation Overview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#FBF4E9]/60 block">Sanctuary</span>
                  <span className="font-bold text-sm">{activeStore.name}</span>
                </div>
                <div>
                  <span className="text-[#FBF4E9]/60 block">Date &amp; Time</span>
                  <span className="font-bold text-sm">{bookingDate} at {selectedSlot?.startTime}</span>
                </div>
                <div>
                  <span className="text-[#FBF4E9]/60 block">Guests</span>
                  <span className="font-bold text-sm">{partySize} Guests ({tableType})</span>
                </div>
                <div>
                  <span className="text-[#FBF4E9]/60 block">Pre-ordered Items</span>
                  <span className="font-bold text-sm">
                    {preorderItems.reduce((s, i) => s + i.quantity, 0)} Drink(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-2xl border border-[#2B1B14]/20 hover:bg-[#FAF4EB] text-xs font-bold uppercase tracking-wider text-[#2B1B14] transition-all"
              >
                &larr; Back to Slot Selector
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateBooking}
                className="py-3.5 px-7 rounded-2xl bg-[#8C6D46] hover:bg-[#725735] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Confirming Table...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Table Reservation</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 3: RESERVATION CONFIRMATION SCREEN ── */}
        {step === 3 && confirmedBooking && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 sm:p-10 rounded-3xl border border-[#8C6D46]/30 shadow-2xl text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D46]">
                Reservation Confirmed
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1B14] mt-1">
                Your Table is Awaiting
              </h2>
              <p className="text-xs text-[#5A3B2E]/70 mt-1">
                We look forward to hosting you at {confirmedBooking.store_name}.
              </p>
            </div>

            {/* Pass Card with Mock QR Code */}
            <div className="p-6 rounded-2xl bg-[#FAF4EB] border border-[#EADFCF] text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B1B14]/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5A3B2E]/60">Booking Reference</span>
                  <div className="font-mono text-xl font-black text-[#8C6D46]">
                    {confirmedBooking.booking_reference}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#2B1B14]/10 shadow-xs">
                  <QrCode className="w-8 h-8 text-[#2B1B14]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#5A3B2E]/60 text-[11px] block">Sanctuary</span>
                  <span className="font-bold text-[#2B1B14]">{confirmedBooking.store_name}</span>
                </div>
                <div>
                  <span className="text-[#5A3B2E]/60 text-[11px] block">Date &amp; Arrival Time</span>
                  <span className="font-bold text-[#2B1B14]">{confirmedBooking.booking_date} at {confirmedBooking.start_time}</span>
                </div>
                <div>
                  <span className="text-[#5A3B2E]/60 text-[11px] block">Party Size</span>
                  <span className="font-bold text-[#2B1B14]">{confirmedBooking.party_size} Guests</span>
                </div>
                <div>
                  <span className="text-[#5A3B2E]/60 text-[11px] block">Table Type</span>
                  <span className="font-bold text-[#2B1B14]">{confirmedBooking.table_type}</span>
                </div>
              </div>
            </div>

            {/* Mock SMS / Notification Alert */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900">
                <strong>SMS &amp; Calendar notification dispatched:</strong> A confirmation code has been registered to your profile.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/account"
                className="flex-1 py-3 px-5 rounded-xl bg-[#2B1B14] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider hover:bg-[#3D281D] transition-all text-center"
              >
                View in Account Dashboard
              </Link>
              <Link
                to="/menu"
                className="flex-1 py-3 px-5 rounded-xl border border-[#2B1B14]/20 text-[#2B1B14] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF4EB] transition-all text-center"
              >
                Browse Menu
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
