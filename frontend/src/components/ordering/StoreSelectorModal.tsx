import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  Navigation, 
  Check, 
  Search, 
  Bike, 
  ShoppingBag, 
  UtensilsCrossed, 
  Calendar 
} from 'lucide-react';
import { useStore, Store } from '../../context/StoreContext';
import { useRealtime } from '../../context/RealtimeContext';

export const StoreSelectorModal: React.FC = () => {
  const {
    stores,
    selectedStore,
    setSelectedStore,
    fulfilmentMode,
    setFulfilmentMode,
    pickupType,
    setPickupType,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    isLoadingSlots,
    fetchSlots,
    isStoreSelectorOpen,
    closeStoreSelector,
    requestLocationAndSort
  } = useStore();

  const { liveStores } = useRealtime();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'STORES' | 'TIMING'>('STORES');

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
  };

  return (
    <AnimatePresence>
      {isStoreSelectorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#FBF4E9] text-[#2A2723] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative border border-[#2A2723]/10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2723]/10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                  Order-Ahead Fulfilment
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2A2723]">Choose Store & Timing</h3>
              </div>
              <button
                onClick={closeStoreSelector}
                className="p-2 rounded-full hover:bg-[#2A2723]/10 text-[#2A2723]/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 my-4 p-1.5 bg-[#2A2723]/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setFulfilmentMode('PICKUP')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  fulfilmentMode === 'PICKUP'
                    ? 'bg-[#2A2723] text-[#FBF4E9] shadow-sm'
                    : 'text-[#2A2723]/70 hover:text-[#2A2723]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Self-Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfilmentMode('DELIVERY')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  fulfilmentMode === 'DELIVERY'
                    ? 'bg-[#2A2723] text-[#FBF4E9] shadow-sm'
                    : 'text-[#2A2723]/70 hover:text-[#2A2723]'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Delivery (₹35)</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfilmentMode('DINEIN')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  fulfilmentMode === 'DINEIN'
                    ? 'bg-[#2A2723] text-[#FBF4E9] shadow-sm'
                    : 'text-[#2A2723]/70 hover:text-[#2A2723]'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Dine-In</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#2A2723]/10 mb-4">
              <button
                onClick={() => setActiveTab('STORES')}
                className={`pb-2.5 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                  activeTab === 'STORES'
                    ? 'border-[#8C6D46] text-[#8C6D46]'
                    : 'border-transparent text-[#2A2723]/50 hover:text-[#2A2723]'
                }`}
              >
                Store Outlets ({stores.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('TIMING');
                  fetchSlots();
                }}
                className={`pb-2.5 px-4 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                  activeTab === 'TIMING'
                    ? 'border-[#8C6D46] text-[#8C6D46]'
                    : 'border-transparent text-[#2A2723]/50 hover:text-[#2A2723]'
                }`}
              >
                Pickup Timing ({pickupType})
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-grow overflow-y-auto pr-1">
              {activeTab === 'STORES' && (
                <div className="space-y-3">
                  {/* Search and GPS refresh */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-grow relative">
                      <Search className="w-4 h-4 text-[#2A2723]/40 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search store name or area..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#2A2723]/15 text-xs focus:outline-none focus:border-[#8C6D46]"
                      />
                    </div>
                    <button
                      onClick={requestLocationAndSort}
                      title="Sort by nearest GPS"
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-[#2A2723]/15 text-[#8C6D46] hover:bg-[#2A2723]/5 transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Nearest</span>
                    </button>
                  </div>

                  {filteredStores.map(store => {
                    const isSelected = selectedStore?.id === store.id;
                    const liveMetric = liveStores?.find(l => l.id === store.id);
                    const inQueue = liveMetric?.inQueue ?? 0;
                    const livePrep = liveMetric?.livePrepTime || store.avg_prep_time_minutes;
                    const isRush = liveMetric?.rushLevel === 'HIGH' || store.status === 'BUSY';

                    return (
                      <div
                        key={store.id}
                        onClick={() => handleSelectStore(store)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-[#8C6D46]/10 border-[#8C6D46] shadow-sm'
                            : 'bg-white/80 border-[#2A2723]/10 hover:border-[#8C6D46]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-sm text-[#2A2723]">{store.name}</h4>
                              {store.status !== 'CLOSED' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isRush ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}>
                                  {isRush ? '🔥 High Demand' : '⚡ Fast Track'}
                                </span>
                              )}
                              {store.status === 'CLOSED' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                                  CLOSED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#2A2723]/70 mb-2 leading-relaxed">{store.address}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#2A2723]/80">
                              <span className="flex items-center gap-1 text-[#8C6D46] font-semibold">
                                <Clock className="w-3.5 h-3.5" />
                                Ready in ~{livePrep} min ({inQueue} in queue)
                              </span>

                              {store.distanceKm !== undefined && (
                                <span className="flex items-center gap-1 text-[#2A2723]/60">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {store.distanceKm} km away
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#8C6D46] text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'TIMING' && (
                <div className="space-y-4">
                  {/* Mode select: ASAP vs Scheduled */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPickupType('ASAP');
                        setSelectedSlot(null);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        pickupType === 'ASAP'
                          ? 'bg-[#8C6D46]/10 border-[#8C6D46]'
                          : 'bg-white border-[#2A2723]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Clock className="w-5 h-5 text-[#8C6D46]" />
                        {pickupType === 'ASAP' && <Check className="w-4 h-4 text-[#8C6D46]" />}
                      </div>
                      <h4 className="font-semibold text-sm text-[#2A2723]">ASAP (Luckin Express)</h4>
                      <p className="text-xs text-[#2A2723]/70 mt-1">
                        Ready in ~{selectedStore?.avg_prep_time_minutes || 8} mins from order placement.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickupType('SCHEDULED');
                        fetchSlots();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        pickupType === 'SCHEDULED'
                          ? 'bg-[#8C6D46]/10 border-[#8C6D46]'
                          : 'bg-white border-[#2A2723]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Calendar className="w-5 h-5 text-[#8C6D46]" />
                        {pickupType === 'SCHEDULED' && <Check className="w-4 h-4 text-[#8C6D46]" />}
                      </div>
                      <h4 className="font-semibold text-sm text-[#2A2723]">Schedule for Later</h4>
                      <p className="text-xs text-[#2A2723]/70 mt-1">
                        Reserve a guaranteed 15-min preparation time slot today.
                      </p>
                    </button>
                  </div>

                  {/* 15-Minute Slot Carousel if Scheduled */}
                  {pickupType === 'SCHEDULED' && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-[#2A2723]/70 mb-3">
                        Available 15-Min Slots for Today:
                      </h5>

                      {isLoadingSlots ? (
                        <div className="py-8 text-center text-xs text-[#2A2723]/60">Checking store capacity...</div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map(slot => {
                            const isChosen = selectedSlot?.slotId === slot.slotId;
                            return (
                              <button
                                key={slot.slotId}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                  !slot.isAvailable
                                    ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500'
                                    : isChosen
                                    ? 'bg-[#2A2723] text-[#FBF4E9] border-[#2A2723] shadow-sm'
                                    : 'bg-white border-[#2A2723]/15 text-[#2A2723] hover:border-[#8C6D46]'
                                }`}
                              >
                                <span className="block font-semibold text-xs">{slot.startTime}</span>
                                <span className="block text-[10px] opacity-75">
                                  {slot.isAvailable ? `${slot.remainingCapacity} left` : 'Full'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[#2A2723]/10 flex items-center justify-between">
              <div className="text-xs text-[#2A2723]/70">
                Selected: <strong className="text-[#2A2723]">{selectedStore?.name}</strong> ({fulfilmentMode})
              </div>
              <button
                onClick={closeStoreSelector}
                className="py-2.5 px-6 rounded-xl font-medium bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] transition-colors text-xs"
              >
                Confirm Store Selection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
