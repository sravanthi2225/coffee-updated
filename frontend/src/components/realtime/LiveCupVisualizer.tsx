import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Snowflake, Coffee } from 'lucide-react';

interface LiveCupVisualizerProps {
  temperature?: 'hot' | 'iced';
  milkType?: string;
  sweetnessPercent?: number;
  shotsCount?: number;
  hasCaramelDrizzle?: boolean;
  hasColdFoam?: boolean;
  size?: 'Regular' | 'Large';
  price?: number;
  title?: string;
}

export const LiveCupVisualizer: React.FC<LiveCupVisualizerProps> = ({
  temperature = 'iced',
  milkType = 'Oat Milk',
  sweetnessPercent = 50,
  shotsCount = 1,
  hasCaramelDrizzle = false,
  hasColdFoam = false,
  size = 'Regular',
  price = 240,
  title = 'Artisan Brew'
}) => {
  const isIced = temperature === 'iced';

  // Dynamic milk color palette
  const getMilkColor = () => {
    const m = (milkType || '').toLowerCase();
    if (m.includes('oat')) return '#E3CAAB'; // creamy oat tan
    if (m.includes('coconut')) return '#F4F4F5'; // cloud coconut white
    if (m.includes('almond')) return '#EFE5D5'; // light almond
    if (m.includes('black') || m.includes('none')) return '#28170D'; // pure dark espresso
    return '#FFF9EE'; // rich whole milk
  };

  const milkColor = getMilkColor();
  const espressoColor = shotsCount >= 2 ? '#1A0C06' : '#3B1E12';

  return (
    <div className="relative w-full max-w-xs mx-auto p-4 flex flex-col items-center">
      
      {/* Real-time Badge indicators */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
          isIced 
            ? 'bg-sky-500/10 text-sky-600 border border-sky-300/40' 
            : 'bg-amber-500/10 text-amber-700 border border-amber-300/40'
        }`}>
          {isIced ? <Snowflake className="w-3 h-3 text-sky-500" /> : <Flame className="w-3 h-3 text-amber-500" />}
          <span className="uppercase text-[10px] tracking-wider">{temperature}</span>
        </span>

        <span className="font-mono font-bold bg-[#1E1815] text-[#FBBF24] px-2.5 py-0.5 rounded-lg text-sm shadow-sm">
          ₹{price}
        </span>
      </div>

      {/* ── Cup Container ── */}
      <div className="relative w-44 h-56 flex flex-col items-center justify-end select-none">
        
        {/* Steam Animation for Hot */}
        {!isIced && (
          <div className="absolute -top-7 flex gap-3 text-amber-400/40 pointer-events-none">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [-5, -24], opacity: [0, 0.7, 0], x: [0, i % 2 === 0 ? 6 : -6] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
                className="w-1.5 h-7 rounded-full bg-gradient-to-t from-amber-400/30 to-transparent blur-[1px]"
              />
            ))}
          </div>
        )}

        {/* ── Cup Geometry (SVG + Glass Layers) ── */}
        <div className={`relative w-36 ${size === 'Large' ? 'h-48' : 'h-42'} rounded-b-3xl border-2 transition-all duration-500 overflow-hidden shadow-xl ${
          isIced 
            ? 'border-sky-300/50 bg-white/20 backdrop-blur-md rounded-t-md' 
            : 'border-[#4A3B32] bg-[#FAF6F0] rounded-t-lg'
        }`}>
          
          {/* Liquid Contents Stack */}
          <div className="absolute inset-0 flex flex-col justify-end">
            
            {/* Top Foam Layer */}
            {(hasColdFoam || !isIced) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: hasColdFoam ? 28 : 16 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-[#FFFDF5] border-b border-amber-200/50 relative z-20 flex items-center justify-center overflow-hidden"
              >
                {/* Caramel drizzle squiggles */}
                {hasCaramelDrizzle && (
                  <div className="w-full h-full flex items-center justify-around">
                    <span className="w-6 h-1 bg-[#B45309] rounded-full rotate-12" />
                    <span className="w-7 h-1 bg-[#B45309] rounded-full -rotate-12" />
                    <span className="w-6 h-1 bg-[#B45309] rounded-full rotate-45" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Espresso & Milk Layer Blend */}
            <div 
              className="w-full flex-grow relative transition-colors duration-500 overflow-hidden"
              style={{
                background: isIced 
                  ? `linear-gradient(180deg, ${espressoColor} 0%, ${milkColor} 70%)` 
                  : `linear-gradient(180deg, ${espressoColor} 20%, ${milkColor} 100%)`
              }}
            >
              {/* Floating Ice Cubes for Iced */}
              {isIced && (
                <div className="absolute inset-0 p-2 flex flex-wrap gap-2 justify-center items-center pointer-events-none">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -3, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
                      transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.3 }}
                      className="w-7 h-7 rounded-lg bg-white/40 border border-white/60 shadow-sm backdrop-blur-[2px]"
                    />
                  ))}
                </div>
              )}

              {/* Espresso Shots Density Tint */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  backgroundColor: '#1E0E06',
                  opacity: Math.min(0.65, (shotsCount - 1) * 0.22)
                }}
              />
            </div>

            {/* Bottom Sediment / Sweetener indicator */}
            {sweetnessPercent > 0 && (
              <div 
                className="w-full bg-amber-600/30 transition-all duration-300"
                style={{ height: `${(sweetnessPercent / 100) * 10}px` }}
              />
            )}

          </div>

          {/* Glass Gloss & Reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10 pointer-events-none" />

          {/* Cup Brand Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-serif tracking-widest text-white/50 font-bold rotate-90 sm:rotate-0">
              BREW & BLOOM
            </span>
          </div>

        </div>

        {/* Hot Cup Handle */}
        {!isIced && (
          <div className="absolute top-10 -right-4 w-7 h-14 rounded-r-2xl border-4 border-[#4A3B32] border-l-0 pointer-events-none" />
        )}

        {/* Hot Cup Saucer */}
        {!isIced && (
          <div className="w-48 h-3 bg-[#4A3B32] rounded-full shadow-md mt-0.5" />
        )}

      </div>

      {/* Dynamic Taste Profile Summary */}
      <div className="mt-3 text-center">
        <h5 className="font-bold text-xs text-[#2A2723]">
          {milkType} • {shotsCount} Shot{shotsCount > 1 ? 's' : ''} • {sweetnessPercent}% Sweet
        </h5>
        <p className="text-[10px] text-stone-500">
          Estimated: {110 + (shotsCount * 5) + (sweetnessPercent * 0.8)} kcal • ~{shotsCount * 68}mg Caffeine
        </p>
      </div>

    </div>
  );
};
