import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Coffee, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  X, 
  FileText, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

export const FloatingOrderTracker: React.FC = () => {
  const { activeCustomerOrder, dismissActiveOrder } = useRealtime();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  if (!activeCustomerOrder) return null;

  const isReady = activeCustomerOrder.status === 'READY';
  const isPreparing = activeCustomerOrder.status === 'PREPARING';
  const isAccepted = activeCustomerOrder.status === 'ACCEPTED';
  const isPaid = activeCustomerOrder.status === 'PAID';

  const statusLabel = () => {
    switch (activeCustomerOrder.status) {
      case 'PAID': return 'Order Placed & Queued';
      case 'ACCEPTED': return 'Order Accepted by Barista';
      case 'PREPARING': return 'Brewing & Pulling Shots';
      case 'READY': return 'Ready at Pickup Locker!';
      case 'COLLECTED': return 'Order Collected';
      default: return 'Order In Progress';
    }
  };

  const statusDescription = () => {
    switch (activeCustomerOrder.status) {
      case 'PAID': return 'Assigned to Indiranagar Flagship Barista';
      case 'ACCEPTED': return 'Beans measured & grinder active';
      case 'PREPARING': return 'Crafting your artisanal beverage (~3 min left)';
      case 'READY': return `Placed on ${activeCustomerOrder.shelf || 'Shelf A-03'}. Tap QR code to collect.`;
      case 'COLLECTED': return 'Enjoy your handcrafted coffee!';
      default: return '';
    }
  };

  return (
    <>
      {/* ── Fixed Floating Luckin Bottom Order Pill ── */}
      <aside aria-label="Active order status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className={`rounded-2xl shadow-2xl backdrop-blur-md border overflow-hidden transition-all duration-300 ${
            isReady
              ? 'bg-gradient-to-r from-[#181E29] via-[#0F4C81] to-[#181E29] border-[#FBBF24]/60 text-white ring-4 ring-[#FBBF24]/20'
              : 'bg-[#181E29]/95 border-[#334155] text-white'
          }`}
        >
          {/* Main Bar Content */}
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            
            {/* Status Icon & Live Spinner */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                isReady 
                  ? 'bg-[#FBBF24] text-[#1E1815]' 
                  : isPreparing
                  ? 'bg-[#0F4C81] text-amber-300'
                  : 'bg-[#334155] text-slate-200'
              }`}>
                {isReady ? (
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                ) : isPreparing ? (
                  <Flame className="w-6 h-6 animate-pulse text-amber-400" />
                ) : (
                  <Coffee className="w-5 h-5" />
                )}
                
                {/* Pulsing beacon */}
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#181E29] ${
                  isReady ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
                }`} />
              </div>

              {/* Order Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isReady ? 'bg-[#FBBF24] text-[#1E1815]' : 'bg-[#0F4C81] text-white'
                  }`}>
                    {activeCustomerOrder.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400 truncate hidden sm:inline">
                    {activeCustomerOrder.storeName || 'Indiranagar Flagship'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="font-bold text-sm tracking-tight truncate">
                    {statusLabel()}
                  </h4>
                  {isReady && (
                    <span className="bg-emerald-500 text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                      Ready Now
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 truncate">
                  {statusDescription()}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Pickup PIN & QR Button */}
              <button
                onClick={() => setShowQrModal(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 ${
                  isReady 
                    ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1E1815]' 
                    : 'bg-[#334155] hover:bg-[#475569] text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="font-mono tracking-wider font-extrabold">
                  {activeCustomerOrder.pickupCode}
                </span>
              </button>

              {/* Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand Details'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Dismiss */}
              <button
                onClick={dismissActiveOrder}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-colors"
                title="Dismiss Order Bar"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* ── Expanded Drawer Content ── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[#334155]/60 bg-black/40 px-4 py-3 text-xs"
              >
                {/* 4-Step Progress Bar */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { step: 1, label: 'Placed', active: isPaid || isAccepted || isPreparing || isReady },
                    { step: 2, label: 'Accepted', active: isAccepted || isPreparing || isReady },
                    { step: 3, label: 'Brewing', active: isPreparing || isReady },
                    { step: 4, label: 'Ready', active: isReady }
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center gap-1">
                      <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                        s.active ? (isReady ? 'bg-[#FBBF24]' : 'bg-[#38BDF8]') : 'bg-slate-700'
                      }`} />
                      <span className={`text-[10px] font-medium ${
                        s.active ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Locker / Shelf Location Highlight */}
                {isReady && (
                  <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-xl p-2.5 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider block">
                        Pickup Location
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {activeCustomerOrder.shelf || 'Shelf A-03'} (Indiranagar Flagship)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">4-Digit Pickup PIN</span>
                      <span className="font-mono text-base font-extrabold text-[#FBBF24] tracking-widest">
                        {activeCustomerOrder.pickupCode}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/order/${activeCustomerOrder.id}/track`)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <span>Full Tracking Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => navigate(`/order/${activeCustomerOrder.id}/invoice`)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Invoice</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    Real-time SSE Live Connected
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </aside>

      {/* ── High-Contrast QR Code Pickup Modal ── */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181E29] border border-[#334155] rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block mb-1">
                Show at Pickup Counter
              </span>
              <h3 className="text-xl font-bold font-serif mb-1">
                Order #{activeCustomerOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                {activeCustomerOrder.storeName || 'Indiranagar Flagship'} • {activeCustomerOrder.shelf || 'Shelf A-03'}
              </p>

              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-2xl shadow-xl inline-block mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    orderId: activeCustomerOrder.id,
                    orderNumber: activeCustomerOrder.orderNumber,
                    pickupCode: activeCustomerOrder.pickupCode
                  })}
                  size={190}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Big PIN Code */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                  Pickup PIN Code
                </span>
                <span className="font-mono text-3xl font-extrabold text-[#FBBF24] tracking-widest">
                  {activeCustomerOrder.pickupCode}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Barista will scan this QR code or enter your 4-digit PIN to release your fresh beverage.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
