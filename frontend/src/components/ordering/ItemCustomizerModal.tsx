import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, Sparkles, Coffee, Droplets, Flame, Sliders } from 'lucide-react';
import type { CartItem, CartCustomization } from '../../types/product';

interface ItemCustomizerModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    cartItemId: string,
    customization: Partial<CartCustomization>,
    quantity: number,
    selectedOptionIds?: string[],
    optionsBreakdown?: any[]
  ) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [selectedMilk, setSelectedMilk] = useState('Whole Milk');
  const [selectedSweetness, setSelectedSweetness] = useState('Standard (100%)');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setSelectedSize(item.customization?.size || 'Standard');
      setSelectedMilk(item.customization?.milk || 'Whole Milk');
      setSelectedSweetness(item.customization?.sweetness || 'Standard (100%)');
      setSelectedExtras(item.customization?.extras || []);
      setQuantity(item.quantity || 1);
    }
  }, [item, isOpen]);

  // Escape key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!item) return null;

  const sizeOptions = [
    { label: 'Standard', extra: 0, desc: 'Regular 12oz cup' },
    { label: 'Large (16oz)', extra: 40, desc: 'Extended 16oz cup' }
  ];

  const milkOptions = [
    { label: 'Whole Milk', extra: 0, desc: 'Classic farm fresh whole milk' },
    { label: 'Oat Milk (+₹45)', extra: 45, desc: 'Swedish barista edition' },
    { label: 'Almond Milk (+₹45)', extra: 45, desc: 'Light roasted nutty finish' },
    { label: 'Soy Milk (+₹35)', extra: 35, desc: 'Creamy botanical protein' },
    { label: 'Black (No Milk)', extra: 0, desc: 'Pure unadorned extraction' }
  ];

  const sweetnessOptions = [
    { label: 'Standard (100%)', desc: 'Recipe default' },
    { label: 'Less Sweet (50%)', desc: 'Balanced sweetness' },
    { label: 'Zero Sugar (0%)', desc: 'No added sugars' },
    { label: 'Extra Sweet (125%)', desc: 'Caramelised indulgence' }
  ];

  const extrasOptions = [
    { label: 'Extra Espresso Shot (+₹40)', extra: 40, raw: 'Extra Espresso Shot' },
    { label: 'Vanilla Bean Cold Foam (+₹45)', extra: 45, raw: 'Vanilla Bean Cold Foam' },
    { label: 'Salted Caramel Drizzle (+₹30)', extra: 30, raw: 'Salted Caramel Drizzle' },
    { label: 'Dutch Cocoa Dusting (+₹20)', extra: 20, raw: 'Dutch Cocoa Dusting' }
  ];

  const toggleExtra = (rawExtra: string) => {
    setSelectedExtras(prev =>
      prev.includes(rawExtra)
        ? prev.filter(e => e !== rawExtra)
        : [...prev, rawExtra]
    );
  };

  // Calculate live unit price
  let extraCost = 0;
  if (selectedSize.includes('Large')) extraCost += 40;
  if (selectedMilk.includes('Oat') || selectedMilk.includes('+₹45')) extraCost += 45;
  if (selectedMilk.includes('Almond')) extraCost += 45;
  if (selectedMilk.includes('Soy') || selectedMilk.includes('+₹35')) extraCost += 35;
  extraCost += selectedExtras.length * 40;

  const unitPrice = Math.round((item.basePrice || item.price) + extraCost);
  const totalPrice = unitPrice * quantity;

  const handleSave = () => {
    onSave(
      item.cartItemId,
      {
        size: selectedSize,
        milk: selectedMilk.replace(/\s*\(\+₹\d+\)/, ''),
        sweetness: selectedSweetness,
        extras: selectedExtras
      },
      quantity
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center min-h-screen"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-lg my-auto bg-[#FDFBF7] text-[#241711] rounded-[26px] shadow-[0_24px_60px_rgba(20,10,5,0.45)] border border-[#2B1B14]/12 flex flex-col max-h-[min(92vh,720px)] overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#E28544] to-[#8C6D46] z-20" />

            {/* ── Fixed Header ── */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-3 border-b border-[#2A2723]/10 bg-[#FDFBF7] shrink-0 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover bg-[#2A2723]/5 border border-[#C5A880]/30 shadow-xs"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C08A4E]">
                    Calibrate Recipe
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2A2723] leading-tight">
                    {item.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2A2723]/10 hover:bg-[#2A2723]/20 active:scale-90 text-[#2A2723] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                aria-label="Close customizer"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

            {/* ── Scrollable Customizer Options ── */}
            <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4.5 custom-scrollbar flex-1">
              
              {/* Size Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-2">
                  Cup Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedSize(opt.label)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedSize.startsWith(opt.label.split(' ')[0])
                          ? 'bg-[#2A2723] text-[#FBF4E9] border-[#2A2723] shadow-sm'
                          : 'bg-white text-[#2A2723] border-[#2A2723]/15 hover:border-[#C5A880]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block">{opt.label}</span>
                        <span className="text-[10px] opacity-75">{opt.desc}</span>
                      </div>
                      {opt.extra > 0 && (
                        <span className="text-[11px] font-bold text-[#C5A880]">+₹{opt.extra}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Calibration */}
              <div>
                <label className="block text-[11px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-2">
                  Milk &amp; Dairy Choice
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {milkOptions.map(opt => {
                    const isSelected = selectedMilk.startsWith(opt.label.split(' ')[0]);
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedMilk(opt.label)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#2A2723] text-[#FBF4E9] border-[#2A2723] shadow-sm'
                            : 'bg-white text-[#2A2723] border-[#2A2723]/15 hover:border-[#C5A880]'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-xs block truncate">{opt.label}</span>
                          <span className="text-[10px] opacity-75 truncate">{opt.desc}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#C5A880] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sweetness Calibration */}
              <div>
                <label className="block text-[11px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-2">
                  Sweetness Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sweetnessOptions.map(opt => {
                    const isSelected = selectedSweetness.startsWith(opt.label.split(' ')[0]);
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedSweetness(opt.label)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2A2723] text-[#FBF4E9] border-[#2A2723] shadow-sm'
                            : 'bg-white text-[#2A2723] border-[#2A2723]/15 hover:border-[#C5A880]'
                        }`}
                      >
                        <span className="font-bold text-xs block">{opt.label}</span>
                        <span className="text-[10px] opacity-75">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add-on Extras */}
              <div>
                <label className="block text-[11px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-2">
                  Add-on Extras (+₹40 each)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extrasOptions.map(opt => {
                    const active = selectedExtras.some(e => e.includes(opt.raw) || opt.raw.includes(e));
                    return (
                      <button
                        key={opt.raw}
                        type="button"
                        onClick={() => toggleExtra(opt.raw)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-[#5C6B4E] text-white border-[#5C6B4E] shadow-sm'
                            : 'bg-white text-[#2A2723] border-[#2A2723]/15 hover:border-[#5C6B4E]'
                        }`}
                      >
                        <span className="font-semibold text-xs">{opt.raw}</span>
                        <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-[#8C6D46]'}`}>
                          +₹40
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── Fixed Footer with Quantity Stepper & Save CTA ── */}
            <div className="p-4 sm:p-5 border-t border-[#2A2723]/10 bg-[#FAF6F0] flex items-center justify-between gap-4 shrink-0">
              {/* Stepper */}
              <div className="flex items-center gap-1.5 border border-[#2A2723]/20 rounded-full bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#2A2723] hover:bg-[#2A2723]/10 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-[#2A2723]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#2A2723] hover:bg-[#2A2723]/10 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Save Button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8C6D46] block leading-none">
                    Item Total
                  </span>
                  <span className="font-serif font-bold text-lg text-[#2A2723]">
                    ₹{totalPrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-3 rounded-xl bg-[#2A2723] hover:bg-[#3D3833] text-[#FBF4E9] font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#C5A880]" />
                  <span>Update Order</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
