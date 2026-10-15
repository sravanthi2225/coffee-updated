import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Play, 
  Square, 
  Flame, 
  Volume2, 
  Coffee, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useStore } from '../../context/StoreContext';

export const RealtimeControlCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBusyOrder, setIsBusyOrder] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const { 
    activeCustomerOrder, 
    triggerFastDemoOrder, 
    advanceActiveOrder, 
    isAutoSimulating, 
    toggleAutoSimulation, 
    toggleStoreRush, 
    playChime,
    liveStores
  } = useRealtime();

  const { selectedStore } = useStore();

  const currentStoreMetric = (liveStores?.find((s: any) => s.id === selectedStore?.id) || selectedStore) as any;
  const isRush = currentStoreMetric?.status === 'BUSY' || (currentStoreMetric?.inQueue ?? 0) >= 4;

  const handleFastOrder = async () => {
    setIsBusyOrder(true);
    setFeedbackMsg('Placing real-time demo order...');
    const order = await triggerFastDemoOrder();
    setIsBusyOrder(false);
    if (order) {
      setFeedbackMsg(`Order #${order.orderNumber} placed & queued!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleAdvance = async () => {
    if (!activeCustomerOrder) {
      await handleFastOrder();
      return;
    }
    setFeedbackMsg('Advancing order status...');
    await advanceActiveOrder();
    setFeedbackMsg('Status advanced via SSE!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleToggleRush = async () => {
    setFeedbackMsg('Toggling store rush status...');
    await toggleStoreRush(selectedStore?.id || 'store_indiranagar');
    setFeedbackMsg('Store rush status updated live!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* ── Control Panel Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="mb-3 w-84 sm:w-96 bg-[#131924]/95 border border-[#2D3B52] rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#243144] mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#0F4C81] text-[#FBBF24]">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    Luckin Real-Time Simulator
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono uppercase">
                      SSE Live
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Live operational controls & order lifecycle
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Feedback Toast */}
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0F4C81]/40 border border-[#38BDF8]/40 text-sky-200 text-xs px-3 py-1.5 rounded-xl mb-3 flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{feedbackMsg}</span>
              </motion.div>
            )}

            {/* Active Order Summary Card */}
            {activeCustomerOrder ? (
              <div className="bg-black/40 border border-[#2D3B52] rounded-2xl p-3 mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Current Active Order:</span>
                  <span className="font-mono font-bold text-[#FBBF24]">
                    #{activeCustomerOrder.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    Status: {activeCustomerOrder.status}
                  </span>
                  <span className="text-xs bg-[#0F4C81] px-2 py-0.5 rounded font-mono font-bold text-white">
                    PIN: {activeCustomerOrder.pickupCode}
                  </span>
                </div>
                {activeCustomerOrder.status === 'READY' && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    Ready on {activeCustomerOrder.shelf || 'Shelf A-03'}!
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-black/30 border border-dashed border-[#2D3B52] rounded-2xl p-3 text-center mb-4 text-xs text-slate-400">
                No active order right now. Click below to place one instantly!
              </div>
            )}

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              
              {/* 1. Fast Demo Order */}
              <button
                onClick={handleFastOrder}
                disabled={isBusyOrder}
                className="flex items-center justify-center gap-1.5 bg-[#8C6D46] hover:bg-[#745733] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                {isBusyOrder ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Coffee className="w-3.5 h-3.5 text-amber-200" />
                )}
                <span>1-Click Fast Order</span>
              </button>

              {/* 2. Step Next Status */}
              <button
                onClick={handleAdvance}
                disabled={!activeCustomerOrder}
                className="flex items-center justify-center gap-1.5 bg-[#0F4C81] hover:bg-[#0C3E69] disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-amber-300" />
                <span>Next Step (SSE)</span>
              </button>

              {/* 3. Auto-Simulate Toggle */}
              <button
                onClick={toggleAutoSimulation}
                className={`flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95 ${
                  isAutoSimulating
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-[#1E293B] hover:bg-[#2D3B52] text-slate-200'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Auto Loop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-Simulate (6s)</span>
                  </>
                )}
              </button>

              {/* 4. Toggle Store Rush */}
              <button
                onClick={handleToggleRush}
                className={`flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95 ${
                  isRush
                    ? 'bg-amber-600/30 border border-amber-500/50 text-amber-300'
                    : 'bg-[#1E293B] hover:bg-[#2D3B52] text-slate-200'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${isRush ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{isRush ? 'Store Rush: ON' : 'Toggle Rush'}</span>
              </button>

            </div>

            {/* Footer Links & Chime Test */}
            <div className="pt-3 border-t border-[#243144] flex items-center justify-between text-xs">
              <button
                onClick={() => playChime('ready')}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                title="Test Web Audio Ready Bell"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Audio Chime</span>
              </button>

              <a
                href="/barista"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                <span>Barista KDS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Trigger Button ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-[#0F4C81] via-[#1E293B] to-[#8C6D46] hover:from-[#0C3E69] text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#38BDF8]/40 font-bold text-xs tracking-wide group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <Zap className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        <span>⚡ Realtime Simulator</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </motion.button>

    </div>
  );
};
