import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Check, Flame, Snowflake, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../api/client';
import { LiveCupVisualizer } from '../realtime/LiveCupVisualizer';

export interface CustomizerItem {
  id: string;
  name: string;
  category_id?: string;
  category?: string;
  description: string;
  base_price: number;
  image_url: string;
  isAvailable?: boolean;
  calories?: number;
  optionGroups?: Array<{
    id: string;
    name: string;
    min_selectable: number;
    max_selectable: number;
    is_required: boolean;
    options: Array<{
      id: string;
      group_id: string;
      name: string;
      price_modifier: number;
      is_default: boolean;
    }>;
  }>;
}

interface DrinkCustomizerDrawerProps {
  item: CustomizerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrinkCustomizerDrawer: React.FC<DrinkCustomizerDrawerProps> = ({ item, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { selectedStore } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptionsByGroup, setSelectedOptionsByGroup] = useState<Record<string, string[]>>({});
  const [detailedItem, setDetailedItem] = useState<CustomizerItem | null>(null);
  const [specialNote, setSpecialNote] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  // Fetch full item details with option groups from DB
  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setSpecialNote('');

    api.getItemDetails(item.id, selectedStore?.id)
      .then(res => {
        if (res.success && res.item) {
          setDetailedItem(res.item);
          // Pre-select default options for required groups
          const defaults: Record<string, string[]> = {};
          for (const group of res.item.optionGroups || []) {
            const defOpt = group.options.find((o: any) => o.is_default) || group.options[0];
            if (defOpt) {
              defaults[group.id] = [defOpt.id];
            }
          }
          setSelectedOptionsByGroup(defaults);
        }
      })
      .catch(() => {
        setDetailedItem(item);
      });
  }, [item, selectedStore?.id]);

  const activeItem = detailedItem || item;

  // Compute live price with option modifiers
  const { unitPrice, totalPrice, optionsBreakdown, allSelectedIds } = useMemo(() => {
    if (!activeItem) return { unitPrice: 0, totalPrice: 0, optionsBreakdown: [], allSelectedIds: [] };

    let surcharge = 0;
    const breakdown: any[] = [];
    const allIds: string[] = [];

    for (const group of activeItem.optionGroups || []) {
      const selectedIds = selectedOptionsByGroup[group.id] || [];
      for (const optId of selectedIds) {
        const opt = group.options.find(o => o.id === optId);
        if (opt) {
          surcharge += opt.price_modifier;
          allIds.push(opt.id);
          breakdown.push({
            optionId: opt.id,
            groupName: group.name,
            optionName: opt.name,
            priceModifier: opt.price_modifier
          });
        }
      }
    }

    const unit = (activeItem.base_price || 0) + surcharge;
    return {
      unitPrice: unit,
      totalPrice: unit * quantity,
      optionsBreakdown: breakdown,
      allSelectedIds: allIds
    };
  }, [activeItem, selectedOptionsByGroup, quantity]);

  if (!isOpen || !activeItem) return null;

  const handleSelectOption = (group: any, opt: any) => {
    const current = selectedOptionsByGroup[group.id] || [];

    if (group.max_selectable === 1) {
      // Radio mode
      setSelectedOptionsByGroup({
        ...selectedOptionsByGroup,
        [group.id]: [opt.id]
      });
    } else {
      // Checkbox mode
      const exists = current.includes(opt.id);
      let updated: string[];
      if (exists) {
        updated = current.filter(id => id !== opt.id);
      } else {
        if (current.length >= group.max_selectable) return;
        updated = [...current, opt.id];
      }
      setSelectedOptionsByGroup({
        ...selectedOptionsByGroup,
        [group.id]: updated
      });
    }
  };

  const handleConfirmAddToCart = () => {
    // Generate legacy text labels for compatibility
    const sizeName = optionsBreakdown.find(o => o.groupName.includes('Size'))?.optionName || 'Regular';
    const milkName = optionsBreakdown.find(o => o.groupName.includes('Milk'))?.optionName || 'Whole Milk';
    const sweetName = optionsBreakdown.find(o => o.groupName.includes('Sweetness'))?.optionName || 'Standard (100%)';
    const extrasList = optionsBreakdown
      .filter(o => o.groupName.includes('Add-ons') || o.groupName.includes('Extras'))
      .map(o => o.optionName);

    const added = addToCart(
      {
        id: activeItem.id,
        name: activeItem.name,
        category: (activeItem.category_id || activeItem.category || 'coffee') as any,
        description: activeItem.description,
        price: activeItem.base_price,
        image: activeItem.image_url,
        flavorNotes: []
      },
      {
        size: sizeName,
        milk: milkName,
        sweetness: sweetName,
        extras: extrasList
      },
      quantity,
      allSelectedIds,
      optionsBreakdown
    );

    if (added) {
      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
        onClose();
      }, 600);
    } else {
      // Unauthenticated: Auth modal is opened with the pending item queued, close drawer smoothly
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-[#FBF4E9] text-[#2A2723] rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl relative border border-[#2A2723]/10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Top Hero Banner */}
          <div className="relative h-44 sm:h-52 bg-[#2A2723] flex-shrink-0">
            <img
              src={activeItem.image_url}
              alt={activeItem.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2723] via-[#2A2723]/40 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-[#FBF4E9]">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C5A880]/30 text-[#C5A880] inline-block mb-1">
                Handcrafted Precision
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">{activeItem.name}</h3>
              <p className="text-xs text-[#FBF4E9]/80 line-clamp-1 mt-0.5">{activeItem.description}</p>
            </div>
          </div>

          {/* Option Groups Scrollable Body */}
          <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Real-time Interactive Cup Preview */}
            <div className="bg-white/80 border border-[#2A2723]/10 rounded-2xl p-3 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D46] block text-center mb-1">
                Real-Time Cup Customization Preview
              </span>
              <LiveCupVisualizer
                temperature={optionsBreakdown.some(o => o.optionName.toLowerCase().includes('iced')) ? 'iced' : 'hot'}
                milkType={optionsBreakdown.find(o => o.groupName.toLowerCase().includes('milk'))?.optionName || 'Oat Milk'}
                sweetnessPercent={
                  optionsBreakdown.some(o => o.optionName.includes('0%')) ? 0 :
                  optionsBreakdown.some(o => o.optionName.includes('25%')) ? 25 :
                  optionsBreakdown.some(o => o.optionName.includes('75%')) ? 75 :
                  optionsBreakdown.some(o => o.optionName.includes('100%')) ? 100 : 50
                }
                shotsCount={optionsBreakdown.some(o => o.optionName.toLowerCase().includes('extra shot') || o.optionName.toLowerCase().includes('double')) ? 2 : 1}
                hasCaramelDrizzle={optionsBreakdown.some(o => o.optionName.toLowerCase().includes('caramel'))}
                hasColdFoam={optionsBreakdown.some(o => o.optionName.toLowerCase().includes('foam') || o.optionName.toLowerCase().includes('cream'))}
                size={optionsBreakdown.some(o => o.optionName.toLowerCase().includes('large')) ? 'Large' : 'Regular'}
                price={unitPrice}
                title={activeItem.name}
              />
            </div>

            {activeItem.optionGroups && activeItem.optionGroups.length > 0 ? (
              activeItem.optionGroups.map(group => {
                const currentSelected = selectedOptionsByGroup[group.id] || [];
                return (
                  <div key={group.id} className="pb-4 border-b border-[#2A2723]/10 last:border-0">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2A2723]/80">
                        {group.name} {group.is_required && <span className="text-red-500">*</span>}
                      </h4>
                      <span className="text-[11px] text-[#2A2723]/50">
                        {group.max_selectable === 1 ? 'Choose 1' : `Choose up to ${group.max_selectable}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {group.options.map(opt => {
                        const isSelected = currentSelected.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(group, opt)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-[#2A2723] text-[#FBF4E9] border-[#2A2723] shadow-sm'
                                : 'bg-white border-[#2A2723]/15 text-[#2A2723] hover:border-[#8C6D46]/60'
                            }`}
                          >
                            <span className="text-xs font-medium">{opt.name}</span>
                            {opt.price_modifier > 0 && (
                              <span
                                className={`text-[11px] font-semibold ${
                                  isSelected ? 'text-[#C5A880]' : 'text-[#8C6D46]'
                                }`}
                              >
                                +₹{opt.price_modifier}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-[#2A2723]/60">
                Standard artisan recipe served hot with organic whole milk.
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-[#2A2723]/80 uppercase tracking-wider mb-1.5">
                Special Barista Note
              </label>
              <input
                type="text"
                placeholder="e.g. Extra hot, splash of water, no sleeve..."
                value={specialNote}
                onChange={e => setSpecialNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#2A2723]/15 text-xs focus:outline-none focus:border-[#8C6D46]"
              />
            </div>
          </div>

          {/* Bottom Bar: Quantity & Live Price Add */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#2A2723]/10 flex items-center justify-between gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3 bg-[#2A2723]/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white text-[#2A2723] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-sm w-4 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white text-[#2A2723] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleConfirmAddToCart}
              className="flex-grow py-3 px-5 rounded-xl font-medium bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] transition-all flex items-center justify-between shadow-md"
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                {addedToast ? 'Added to Bag!' : 'Add to Order'}
              </span>
              <span className="font-serif font-bold text-sm">₹{totalPrice}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
