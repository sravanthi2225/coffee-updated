import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, CartCustomization } from '../types/product';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    customization?: Partial<CartCustomization>,
    quantity?: number,
    selectedOptionIds?: string[],
    optionsBreakdown?: any[]
  ) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateCustomization: (
    cartItemId: string,
    customization: Partial<CartCustomization>,
    newQuantity?: number,
    selectedOptionIds?: string[],
    optionsBreakdown?: any[]
  ) => void;
  clearCart: () => void;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  tax: number;
  total: number;
  itemCount: number;
  promoCode: string;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  pendingCartItem: {
    product: Product;
    customization?: Partial<CartCustomization>;
    quantity: number;
    selectedOptionIds?: string[];
    optionsBreakdown?: any[];
  } | null;
  clearPendingCartItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brew_and_bloom_cart';
const PROMO_STORAGE_KEY = 'brew_and_bloom_promo';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>(() => {
    try {
      return localStorage.getItem(PROMO_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Track pending item if unauthenticated user attempts to add to cart
  const [pendingCartItem, setPendingCartItem] = useState<{
    product: Product;
    customization?: Partial<CartCustomization>;
    quantity: number;
    selectedOptionIds?: string[];
    optionsBreakdown?: any[];
  } | null>(null);

  // When user successfully authenticates, automatically commit their pending coffee!
  useEffect(() => {
    if (isAuthenticated && pendingCartItem) {
      addToCart(
        pendingCartItem.product,
        pendingCartItem.customization,
        pendingCartItem.quantity,
        pendingCartItem.selectedOptionIds,
        pendingCartItem.optionsBreakdown
      );
      setPendingCartItem(null);
    }
  }, [isAuthenticated, pendingCartItem]);

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (promoCode) {
        localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist promo:', e);
    }
  }, [promoCode]);

  const addToCart = (
    product: Product,
    customization?: Partial<CartCustomization>,
    quantity: number = 1,
    selectedOptionIds?: string[],
    optionsBreakdown?: any[]
  ) => {
    // ── Guard: Require Authentication for Order-Ahead & Cart ──
    if (!isAuthenticated) {
      setPendingCartItem({
        product,
        customization,
        quantity,
        selectedOptionIds,
        optionsBreakdown
      });
      openAuthModal(`Sign in or create an account to customize and add ${product.name} to your bag.`);
      return false;
    }
    const defaultCustomization: CartCustomization = {
      size: customization?.size || product.sizes?.[0] || 'Standard',
      milk: customization?.milk || product.milkOptions?.[0] || 'Default',
      sweetness: customization?.sweetness || product.sweetnessOptions?.[0] || 'Standard',
      extras: customization?.extras || [],
    };

    // Calculate extra costs
    let extraCost = 0;
    if (optionsBreakdown && optionsBreakdown.length > 0) {
      extraCost = optionsBreakdown.reduce((sum, opt) => sum + (opt.priceModifier || 0), 0);
    } else {
      if (defaultCustomization.milk?.includes('+₹30') || defaultCustomization.milk?.includes('Oat')) extraCost += 45;
      if (defaultCustomization.size?.includes('Large')) extraCost += 40;
      extraCost += (defaultCustomization.extras.length) * 40;
    }

    const unitPrice = Math.round(product.price + extraCost);
    const optKey = selectedOptionIds ? selectedOptionIds.sort().join('-') : '';
    const cartItemId = `${product.id}-${defaultCustomization.size}-${defaultCustomization.milk}-${defaultCustomization.sweetness}-${optKey}`;

    setItems(prevItems => {
      const existing = prevItems.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prevItems.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevItems,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          category: product.category,
          basePrice: product.price,
          price: unitPrice,
          image: product.image,
          customization: defaultCustomization,
          quantity,
          selectedOptionIds,
          optionsBreakdown
        },
      ];
    });

    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateCustomization = (
    cartItemId: string,
    customization: Partial<CartCustomization>,
    newQuantity?: number,
    selectedOptionIds?: string[],
    optionsBreakdown?: any[]
  ) => {
    setItems(prev =>
      prev.map(item => {
        if (item.cartItemId !== cartItemId) return item;
        const merged: CartCustomization = {
          ...item.customization,
          ...customization
        };
        // Recalculate price modifier
        let extraCost = 0;
        if (optionsBreakdown && optionsBreakdown.length > 0) {
          extraCost = optionsBreakdown.reduce((sum, opt) => sum + (opt.priceModifier || 0), 0);
        } else {
          if (merged.milk?.includes('+₹30') || merged.milk?.includes('Oat') || merged.milk?.includes('Almond')) extraCost += 45;
          if (merged.size?.includes('Large')) extraCost += 40;
          extraCost += (merged.extras?.length || 0) * 40;
        }

        const unitPrice = Math.round(item.basePrice + extraCost);
        const optKey = selectedOptionIds ? selectedOptionIds.sort().join('-') : '';
        const newCartItemId = `${item.productId}-${merged.size}-${merged.milk}-${merged.sweetness}-${optKey}`;

        return {
          ...item,
          cartItemId: newCartItemId,
          price: unitPrice,
          customization: merged,
          quantity: newQuantity !== undefined ? newQuantity : item.quantity,
          selectedOptionIds: selectedOptionIds || item.selectedOptionIds,
          optionsBreakdown: optionsBreakdown || item.optionsBreakdown
        };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
  };

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  const discountRate = promoCode.toUpperCase() === 'LUCKIN50' ? 0.50 : (promoCode.toUpperCase() === 'BLOOM10' ? 0.10 : 0);
  const discountAmount = promoCode.toUpperCase() === 'FIRSTCUP' 
    ? Math.min(subtotal, 250) 
    : Number((subtotal * discountRate).toFixed(2));

  const tax = Number((Math.max(0, subtotal - discountAmount) * 0.05).toFixed(2));
  const total = Number((Math.max(0, subtotal - discountAmount) + tax).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyPromoCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (['FIRSTCUP', 'LUCKIN50', 'BREW100', 'MORNING20', 'BLOOM10'].includes(trimmed)) {
      setPromoCode(trimmed);
      return { success: true, message: `Voucher ${trimmed} applied successfully!` };
    }
    return { success: false, message: 'Invalid or expired voucher code.' };
  };

  const removePromoCode = () => {
    setPromoCode('');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCustomization,
        clearCart,
        subtotal,
        discountRate,
        discountAmount,
        tax,
        total,
        itemCount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        pendingCartItem,
        clearPendingCartItem: () => setPendingCartItem(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
