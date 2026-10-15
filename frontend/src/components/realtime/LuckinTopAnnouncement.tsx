import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Tag, Check, Sparkles } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

export const LuckinTopAnnouncement: React.FC = () => {
  const { dealCountdown, activityFeed } = useRealtime();
  const [copied, setCopied] = useState(false);

  // Pick top activity text
  const currentActivity = activityFeed && activityFeed.length > 0 
    ? activityFeed[0].text 
    : 'Rohan in Indiranagar just ordered Iced Coconut Cloud Latte';

  // Format countdown
  const mm = String(dealCountdown?.minutes ?? 18).padStart(2, '0');
  const ss = String(dealCountdown?.seconds ?? 42).padStart(2, '0');

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('FIRSTCUP');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D1117] text-white text-[11px] sm:text-xs border-b border-[#21262D] w-full select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-1.5 flex items-center justify-between gap-3">
        
        {/* Left: Luckin Flash Craze Deal */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 bg-[#0F4C81] text-white font-extrabold px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm">
            <Zap className="w-2.5 h-2.5 text-[#FBBF24]" />
            Flash Deal
          </span>
          <span className="font-medium text-[#E2E8F0] hidden sm:inline">
            Flat 50% Off First Order + BOGO on Cold Brews
          </span>
          <div className="flex items-center gap-1 font-mono text-[#FBBF24] bg-black/60 px-1.5 py-0.5 rounded border border-[#30363D]">
            <Clock className="w-2.5 h-2.5 text-amber-300" />
            <span className="font-bold text-[10px] sm:text-xs">{mm}:{ss}</span>
          </div>

          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-[#8C6D46] hover:bg-[#745733] text-white px-2 py-0.5 rounded font-semibold transition-colors shadow-sm"
            title="Click to copy promo code"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Tag className="w-2.5 h-2.5 text-amber-200" />
                <span>FIRSTCUP</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Live Real-time Social Proof Feed Ticker */}
        <div className="flex items-center gap-2 overflow-hidden text-right min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentActivity}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate"
            >
              {currentActivity}
            </motion.span>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
