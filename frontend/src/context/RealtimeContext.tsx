import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export interface LiveStoreMetric {
  id: string;
  name: string;
  address: string;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  avg_prep_time_minutes: number;
  livePrepTime: number;
  inQueue: number;
  rushLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  supports_pickup: boolean;
  supports_delivery: boolean;
  supports_dinein: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  status: string;
  timeAgo: string;
}

export interface ActiveCustomerOrder {
  id: string;
  orderNumber: string;
  status: 'PAID' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COLLECTED';
  pickupCode: string;
  shelf?: string;
  storeName?: string;
  estimatedMinutes?: number;
  updatedAt: string;
}

interface RealtimeContextType {
  liveStores: LiveStoreMetric[];
  activityFeed: ActivityItem[];
  activeFlashDeal: any;
  dealCountdown: { minutes: number; seconds: number };
  activeCustomerOrder: ActiveCustomerOrder | null;
  setActiveCustomerOrder: (order: ActiveCustomerOrder | null) => void;
  isAutoSimulating: boolean;
  playChime: (type?: 'order' | 'ready' | 'rush') => void;
  triggerFastDemoOrder: () => Promise<ActiveCustomerOrder | null>;
  advanceActiveOrder: () => Promise<void>;
  toggleAutoSimulation: () => void;
  toggleStoreRush: (storeId?: string) => Promise<void>;
  dismissActiveOrder: () => void;
  refreshOverview: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

const ACTIVE_ORDER_KEY = 'bb_active_realtime_order';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveStores, setLiveStores] = useState<LiveStoreMetric[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [activeFlashDeal, setActiveFlashDeal] = useState<any>(null);
  const [dealCountdown, setDealCountdown] = useState({ minutes: 18, seconds: 42 });
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  const [activeCustomerOrder, setActiveCustomerOrderState] = useState<ActiveCustomerOrder | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ORDER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const simTimerRef = useRef<any>(null);

  const setActiveCustomerOrder = (
    orderOrUpdater: ActiveCustomerOrder | null | ((prev: ActiveCustomerOrder | null) => ActiveCustomerOrder | null)
  ) => {
    setActiveCustomerOrderState((prev) => {
      const next = typeof orderOrUpdater === 'function' ? orderOrUpdater(prev) : orderOrUpdater;
      if (next && next.status !== 'COLLECTED') {
        try {
          localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(next));
        } catch {}
      } else {
        localStorage.removeItem(ACTIVE_ORDER_KEY);
      }
      return next;
    });
  };

  const dismissActiveOrder = () => {
    setActiveCustomerOrder(null);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsAutoSimulating(false);
  };

  /**
   * High-End Web Audio API synthesized chimes (zero latency, zero external asset failure)
   */
  const playChime = (type: 'order' | 'ready' | 'rush' = 'order') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'ready') {
        // Multi-tone cheerful ready chime (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
        });
      } else if (type === 'rush') {
        // Warning double chime
        [440, 554.37].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.15);
          osc.stop(ctx.currentTime + idx * 0.15 + 0.4);
        });
      } else {
        // Soft barista bell ping (A5 -> E6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  const refreshOverview = async () => {
    try {
      const res = await api.getRealtimeOverview();
      if (res.success) {
        setLiveStores(res.stores || []);
        if (res.activityFeed && res.activityFeed.length > 0) {
          setActivityFeed(res.activityFeed);
        }
        if (res.activeFlashDeal) {
          setActiveFlashDeal(res.activeFlashDeal);
        }
      }
    } catch (e) {
      console.warn('Realtime overview fetch failed:', e);
    }
  };

  // Flash Deal countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setDealCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 19, seconds: 59 }; // reset
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and connect to Global SSE Stream
  useEffect(() => {
    refreshOverview();

    const sse = new EventSource('/api/realtime/stream');

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Store status changed (e.g. from Barista toggle)
        if (data.type === 'STORE_STATUS_UPDATED') {
          setLiveStores(prev => prev.map(s => {
            if (s.id === data.storeId) {
              return {
                ...s,
                status: data.status,
                livePrepTime: data.avg_prep_time_minutes,
                avg_prep_time_minutes: data.avg_prep_time_minutes,
                rushLevel: data.status === 'BUSY' ? 'HIGH' : 'LOW'
              };
            }
            return s;
          }));

          // Add to activity ticker
          if (data.message) {
            setActivityFeed(prev => [
              { id: `act_${Date.now()}`, text: data.message, status: data.status, timeAgo: 'Just now' },
              ...prev.slice(0, 9)
            ]);
          }
          playChime('rush');
        }

        // Live customer order activity
        if (data.type === 'LIVE_ACTIVITY') {
          if (data.text) {
            setActivityFeed(prev => [
              { id: `act_${Date.now()}`, text: data.text, status: data.event || 'NEW_ORDER', timeAgo: 'Just now' },
              ...prev.slice(0, 9)
            ]);
          }
        }

        // Order status changed
        if (data.type === 'ORDER_STATUS_CHANGED' || data.type === 'ORDER_STATUS_UPDATE') {
          setActiveCustomerOrder(prev => {
            if (!prev || prev.id !== data.orderId) return prev;
            const updated = {
              ...prev,
              status: data.status,
              pickupCode: data.pickupCode || prev.pickupCode,
              shelf: data.shelf || prev.shelf || 'Shelf A-02',
              updatedAt: new Date().toISOString()
            };
            if (data.status === 'READY') {
              playChime('ready');
            }
            return updated;
          });
        }
      } catch (e) {
        console.error('Realtime SSE Parse error:', e);
      }
    };

    return () => sse.close();
  }, []);

  // 1-Click Fast Demo Order
  const triggerFastDemoOrder = async (): Promise<ActiveCustomerOrder | null> => {
    try {
      const res = await api.simulateFastOrder('store_indiranagar');
      if (res.success && res.order) {
        const newOrder: ActiveCustomerOrder = {
          id: res.order.id,
          orderNumber: res.order.order_number,
          status: 'PAID',
          pickupCode: res.order.pickup_code || '4821',
          shelf: res.assignedShelf || 'Shelf A-03',
          storeName: 'Indiranagar Flagship',
          estimatedMinutes: 6,
          updatedAt: new Date().toISOString()
        };
        setActiveCustomerOrder(newOrder);
        playChime('order');
        await refreshOverview();
        return newOrder;
      }
    } catch (e) {
      console.error('Fast demo order failed:', e);
    }
    return null;
  };

  // Advance Order 1 step
  const advanceActiveOrder = async () => {
    if (!activeCustomerOrder) return;
    try {
      const res = await api.simulateAdvanceOrder(activeCustomerOrder.id);
      if (res.success) {
        if (res.status === 'COLLECTED') {
          playChime('order');
          setActiveCustomerOrder(null);
        } else {
          setActiveCustomerOrder({
            ...activeCustomerOrder,
            status: res.status as any,
            shelf: res.shelf || activeCustomerOrder.shelf,
            updatedAt: new Date().toISOString()
          });
          if (res.status === 'READY') {
            playChime('ready');
          } else {
            playChime('order');
          }
        }
        await refreshOverview();
      }
    } catch (e) {
      console.error('Advance order failed:', e);
    }
  };

  // Toggle Auto Simulation (steps order every 6 seconds)
  const toggleAutoSimulation = () => {
    if (isAutoSimulating) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      simTimerRef.current = null;
      setIsAutoSimulating(false);
    } else {
      setIsAutoSimulating(true);

      const runStep = async () => {
        // If no active order, create one
        let current = activeCustomerOrder;
        if (!current || current.status === 'COLLECTED') {
          current = await triggerFastDemoOrder();
          return;
        }

        // Advance to next status
        await advanceActiveOrder();
      };

      runStep();
      simTimerRef.current = setInterval(runStep, 6000);
    }
  };

  // Toggle Store Rush Status
  const toggleStoreRush = async (storeId?: string) => {
    try {
      await api.simulateToggleRush(storeId || 'store_indiranagar');
      await refreshOverview();
    } catch (e) {
      console.error('Toggle rush failed:', e);
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        liveStores,
        activityFeed,
        activeFlashDeal,
        dealCountdown,
        activeCustomerOrder,
        setActiveCustomerOrder,
        isAutoSimulating,
        playChime,
        triggerFastDemoOrder,
        advanceActiveOrder,
        toggleAutoSimulation,
        toggleStoreRush,
        dismissActiveOrder,
        refreshOverview
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within a RealtimeProvider');
  return context;
};
