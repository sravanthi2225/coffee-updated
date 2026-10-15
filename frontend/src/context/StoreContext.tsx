import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  avg_prep_time_minutes: number;
  supports_pickup: boolean;
  supports_delivery: boolean;
  supports_dinein: boolean;
  distanceKm?: number;
  isOpenNow: boolean;
}

export interface Slot {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacityLimit: number;
  reservedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
}

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  fulfilmentMode: 'PICKUP' | 'DELIVERY' | 'DINEIN';
  setFulfilmentMode: (mode: 'PICKUP' | 'DELIVERY' | 'DINEIN') => void;
  pickupType: 'ASAP' | 'SCHEDULED';
  setPickupType: (type: 'ASAP' | 'SCHEDULED') => void;
  selectedSlot: Slot | null;
  setSelectedSlot: (slot: Slot | null) => void;
  availableSlots: Slot[];
  isLoadingSlots: boolean;
  fetchSlots: (date?: string) => Promise<void>;
  requestLocationAndSort: () => Promise<void>;
  isStoreSelectorOpen: boolean;
  openStoreSelector: () => void;
  closeStoreSelector: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORE_STORAGE_KEY = 'bb_selected_store';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(() => {
    try {
      const saved = localStorage.getItem(STORE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [fulfilmentMode, setFulfilmentMode] = useState<'PICKUP' | 'DELIVERY' | 'DINEIN'>('PICKUP');
  const [pickupType, setPickupType] = useState<'ASAP' | 'SCHEDULED'>('ASAP');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  // Load stores on mount and auto-select nearest
  useEffect(() => {
    requestLocationAndSort();
  }, []);

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore
    }
    // Refresh slots if scheduled mode is active
    if (store && pickupType === 'SCHEDULED') {
      fetchSlotsForStore(store.id);
    }
  };

  const fetchSlotsForStore = async (storeId: string, date?: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await api.getStoreSlots(storeId, date);
      setAvailableSlots(res.slots || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchSlots = async (date?: string) => {
    if (selectedStore) {
      await fetchSlotsForStore(selectedStore.id, date);
    }
  };

  const requestLocationAndSort = async () => {
    let coords: { latitude: number; longitude: number } | undefined;

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch {
        // Geolocation denied or timed out; will fall back to default list
      }
    }

    try {
      const res = await api.getStores(coords);
      if (res.stores && res.stores.length > 0) {
        setStores(res.stores);
        // Pre-select nearest open store if none selected yet
        if (!selectedStore) {
          const nearestOpen = res.stores.find(s => s.isOpenNow) || res.stores[0];
          setSelectedStore(nearestOpen);
        } else {
          // Update selected store instance with fresh distance / status
          const updated = res.stores.find(s => s.id === selectedStore.id);
          if (updated) setSelectedStoreState(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
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
        requestLocationAndSort,
        isStoreSelectorOpen,
        openStoreSelector: () => setIsStoreSelectorOpen(true),
        closeStoreSelector: () => setIsStoreSelectorOpen(false)
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
