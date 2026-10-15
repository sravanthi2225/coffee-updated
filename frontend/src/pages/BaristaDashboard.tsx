import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Flame, 
  AlertTriangle, 
  RefreshCw, 
  Volume2, 
  Sliders, 
  X, 
  LogOut,
  Search
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

export const BaristaDashboard: React.FC = () => {
  const { staffUser, isStaffAuthenticated, staffLogin, logout } = useAuth();
  const { playChime } = useRealtime();

  // Login form state
  const [username, setUsername] = useState('barista_indira');
  const [password, setPassword] = useState('barista123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard queue state
  const [queue, setQueue] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('store_indiranagar');
  const [storeMeta, setStoreMeta] = useState<any>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Manual pickup PIN entry modal
  const [pickupPinInput, setPickupPinInput] = useState('');
  const [collectionStatus, setCollectionStatus] = useState<string | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  // Store adjustment modal
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);
  const [newPrepTime, setNewPrepTime] = useState(8);

  const fetchQueue = async () => {
    try {
      const res = await api.getBaristaQueue(activeStoreId);
      if (res.success) {
        setQueue(res.queue || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isStaffAuthenticated) return;

    fetchQueue();

    // Listen to live queue SSE stream
    const sse = new EventSource(`/api/barista/stream?storeId=${activeStoreId}`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'QUEUE_UPDATE') {
          // Play notification chime
          playChime('order');
          fetchQueue();
        }
      } catch (e) {
        console.error('SSE error:', e);
      }
    };

    return () => sse.close();
  }, [isStaffAuthenticated, activeStoreId]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await staffLogin(username, password);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid staff credentials');
    }
  };

  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.updateBaristaOrderStatus(orderId, nextStatus);
      fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const handleCollectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupPinInput || pickupPinInput.length !== 4) {
      setCollectionStatus('PIN must be 4 digits.');
      return;
    }

    try {
      const res = await api.collectBaristaOrder(activeStoreId, pickupPinInput.trim());
      if (res.success) {
        setCollectionStatus(`Order #${res.order?.order_number} marked as COLLECTED!`);
        setPickupPinInput('');
        fetchQueue();
        setTimeout(() => setIsPickupModalOpen(false), 1200);
      }
    } catch (err: any) {
      setCollectionStatus(err.message || 'Verification failed. Incorrect code or store.');
    }
  };

  const handleUpdateStoreStatus = async (status: string) => {
    try {
      await api.updateStoreStatus(activeStoreId, status);
      alert(`Store marked as ${status}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePrepTime = async () => {
    try {
      await api.updateStoreStatus(activeStoreId, undefined, Number(newPrepTime));
      setIsStoreSettingsOpen(false);
      alert(`Prep time updated to ${newPrepTime} mins`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isStaffAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <div className="bg-[#2A2723] text-[#FBF4E9] p-8 rounded-3xl border border-[#C5A880]/30 shadow-2xl">
          <div className="flex items-center gap-2 mb-2 text-[#C5A880]">
            <Coffee className="w-6 h-6" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">Store Terminal</span>
          </div>
          <h2 className="font-serif text-2xl font-bold mb-1">Barista Portal Login</h2>
          <p className="text-xs text-[#FBF4E9]/70 mb-6">Staff authentication for live ticket queues & counter scanner.</p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#FBF4E9]/80 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-white/10 text-xs text-[#FBF4E9] focus:outline-none focus:border-[#C5A880]"
              />
              <span className="text-[10px] text-[#FBF4E9]/40 mt-1 block">Default: barista_indira / barista123</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FBF4E9]/80 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-white/10 text-xs text-[#FBF4E9] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-[#C5A880] text-[#1C1A17] font-semibold text-xs uppercase tracking-wider hover:bg-[#B3956F] transition-all"
            >
              Enter Barista Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter columns
  const paidOrders = queue.filter(o => o.status === 'PAID');
  const preppingOrders = queue.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING');
  const readyOrders = queue.filter(o => o.status === 'READY');

  return (
    <div className="min-h-screen bg-[#1C1A17] text-[#FBF4E9] p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#C5A880]/20 text-[#C5A880]">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold">Barista Live Queue</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE SSE CONNECTED
              </span>
            </div>
            <p className="text-xs text-[#FBF4E9]/60">Indiranagar Flagship • Staff: {staffUser?.username}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsPickupModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-[#C5A880] text-[#1C1A17] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#B3956F] shadow-lg shadow-[#C5A880]/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Verify Pickup PIN / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStoreSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
            title="Store operational controls"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={fetchQueue}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-500/20"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Column Ticket Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMN 1: NEW PAID ORDERS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Incoming Orders ({paidOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {paidOrders.map(order => (
              <div
                key={order.id}
                className="bg-[#2A2723] p-5 rounded-2xl border border-amber-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C5A880]">#{order.order_number}</span>
                    <h4 className="font-semibold text-sm text-[#FBF4E9]">{order.customer_name}</h4>
                    <span className="text-[10px] text-[#FBF4E9]/60">{order.fulfilment_mode}</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#FBF4E9]">₹{order.total_amount}</span>
                </div>

                {/* Items */}
                <div className="bg-[#1C1A17] p-3 rounded-xl space-y-1.5 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="text-[#FBF4E9]/90">
                      <div className="font-semibold">{item.item_name} × {item.quantity}</div>
                      {item.options && (
                        <div className="text-[11px] text-[#C5A880]">
                          {item.options.map((o: any) => o.option_name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAdvanceStatus(order.id, 'ACCEPTED')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors"
                >
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: IN PREPARATION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Brewing Station ({preppingOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {preppingOrders.map(order => (
              <div
                key={order.id}
                className="bg-[#2A2723] p-5 rounded-2xl border border-sky-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C5A880]">#{order.order_number}</span>
                    <h4 className="font-semibold text-sm text-[#FBF4E9]">{order.customer_name}</h4>
                    <span className="text-[10px] text-sky-300 font-bold uppercase">{order.status}</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#FBF4E9]">₹{order.total_amount}</span>
                </div>

                {/* Items */}
                <div className="bg-[#1C1A17] p-3 rounded-xl space-y-1.5 text-xs">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="text-[#FBF4E9]/90">
                      <div className="font-semibold">{item.item_name} × {item.quantity}</div>
                      {item.options && (
                        <div className="text-[11px] text-[#C5A880]">
                          {item.options.map((o: any) => o.option_name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {order.status === 'ACCEPTED' ? (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(order.id, 'PREPARING')}
                      className="col-span-2 py-2.5 rounded-xl bg-sky-500 text-black font-semibold text-xs hover:bg-sky-400 transition-colors"
                    >
                      Start Brewing
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(order.id, 'READY')}
                      className="col-span-2 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-colors"
                    >
                      Mark Ready for Counter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: READY FOR PICKUP */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Counter Pickup Tray ({readyOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="bg-[#2A2723] p-5 rounded-2xl border border-emerald-500/40 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#C5A880]">#{order.order_number}</span>
                    <h4 className="font-semibold text-sm text-[#FBF4E9]">{order.customer_name}</h4>
                    <span className="text-[10px] text-emerald-300 font-bold">READY AT TRAY</span>
                  </div>
                  <div className="bg-[#1C1A17] px-2.5 py-1 rounded-lg border border-[#C5A880]/30 font-mono text-sm font-bold text-[#C5A880]">
                    PIN: {order.pickup_code}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPickupPinInput(order.pickup_code);
                    setIsPickupModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-colors"
                >
                  Confirm Handover (PIN {order.pickup_code})
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pickup Code / QR Verification Modal ── */}
      <AnimatePresence>
        {isPickupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A2723] text-[#FBF4E9] rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#C5A880]/30 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsPickupModalOpen(false);
                  setCollectionStatus(null);
                }}
                className="absolute top-5 right-5 p-1 rounded-full text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold mb-1">Verify Counter Handover</h3>
              <p className="text-xs text-[#FBF4E9]/60 mb-5">
                Type the customer's 4-digit pickup code or scan from their mobile screen.
              </p>

              {collectionStatus && (
                <div className="mb-4 p-3 rounded-xl bg-white/10 text-xs font-medium text-[#C5A880]">
                  {collectionStatus}
                </div>
              )}

              <form onSubmit={handleCollectOrder} className="space-y-4">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 8134"
                  value={pickupPinInput}
                  onChange={e => setPickupPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 rounded-2xl bg-[#1C1A17] border border-white/20 text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={pickupPinInput.length !== 4}
                  className="w-full py-3 rounded-xl bg-[#C5A880] text-[#1C1A17] font-semibold text-xs uppercase tracking-wider hover:bg-[#B3956F] disabled:opacity-50"
                >
                  Verify & Complete Order
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Store Operational Controls Modal ── */}
      <AnimatePresence>
        {isStoreSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A2723] text-[#FBF4E9] rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/10 shadow-2xl relative"
            >
              <button
                onClick={() => setIsStoreSettingsOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold mb-4">Store Operational Status</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-2">
                    Current Store Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['OPEN', 'BUSY', 'CLOSED'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStoreStatus(st)}
                        className="py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20 text-white"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-2">
                    Estimated Prep Time (Minutes)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={3}
                      max={45}
                      value={newPrepTime}
                      onChange={e => setNewPrepTime(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1A17] border border-white/20 text-sm font-semibold"
                    />
                    <button
                      onClick={handleUpdatePrepTime}
                      className="px-4 py-2 rounded-xl bg-[#C5A880] text-black font-semibold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
