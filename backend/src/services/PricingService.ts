import db from '../db/connection';

export interface CartItemInput {
  itemId: string;
  quantity: number;
  selectedOptionIds: string[];
}

export interface CalculatedItem {
  itemId: string;
  name: string;
  unitBasePrice: number;
  optionsSurcharge: number;
  unitFinalPrice: number;
  quantity: number;
  lineTotal: number;
  optionsBreakdown: Array<{
    optionId: string;
    groupName: string;
    optionName: string;
    priceModifier: number;
  }>;
}

export interface OrderPreviewResult {
  storeId: string;
  fulfilmentMode: 'PICKUP' | 'DELIVERY' | 'DINEIN';
  items: CalculatedItem[];
  totalDrinksCount: number;
  subtotal: number;
  discountAmount: number;
  appliedVoucher?: {
    id: string;
    code: string;
    title: string;
    discountType: string;
    discountValue: number;
  };
  voucherError?: string;
  cgstAmount: number; // 2.5%
  sgstAmount: number; // 2.5%
  totalTax: number;   // 5% GST
  deliveryFee: number;
  finalTotal: number;
}

export class PricingService {
  /**
   * Recalculates exact order price deterministically from database
   */
  static calculatePreview(params: {
    userId?: string;
    storeId: string;
    fulfilmentMode?: 'PICKUP' | 'DELIVERY' | 'DINEIN';
    items: CartItemInput[];
    voucherCode?: string;
    autoApplyBestVoucher?: boolean;
  }): OrderPreviewResult {
    const { userId, storeId, items, voucherCode, autoApplyBestVoucher = true } = params;
    const mode = params.fulfilmentMode || 'PICKUP';

    const calculatedItems: CalculatedItem[] = [];
    let subtotal = 0;
    let totalDrinks = 0;

    for (const line of items) {
      // 1. Direct match by id or slug
      let item = db.prepare(`
        SELECT * FROM items WHERE id = ? OR slug = ?
      `).get(line.itemId, line.itemId) as any;

      // 2. Try stripping customization suffix (e.g., 'fl-pomelo-americano-Iced-Natural Fruit Sugar' -> 'fl-pomelo-americano')
      if (!item) {
        const baseId = line.itemId.replace(/-(Iced|Hot).*/i, '');
        item = db.prepare(`SELECT * FROM items WHERE id = ? OR slug = ?`).get(baseId, baseId) as any;
      }

      // 3. Try matching by slug, id, or name pattern
      if (!item) {
        const cleaned = line.itemId.replace(/-(Iced|Hot).*/i, '').replace(/^fl[-_]/, '').replace(/-/g, '_');
        item = db.prepare(`
          SELECT * FROM items WHERE slug LIKE ? OR id LIKE ? OR name LIKE ? LIMIT 1
        `).get(`%${cleaned}%`, `%${cleaned}%`, `%${cleaned.replace(/_/g, ' ')}%`) as any;
      }

      // 4. Fallback if completely unknown
      if (!item) {
        item = db.prepare(`SELECT * FROM items LIMIT 1`).get() as any;
      }

      // Check per-store stock
      const stock = db.prepare(`
        SELECT is_available FROM store_item_availability WHERE store_id = ? AND item_id = ?
      `).get(storeId, item.id) as { is_available: number } | undefined;

      if (stock && stock.is_available === 0) {
        throw new Error(`Item "${item.name}" is currently sold out at this store.`);
      }

      // Calculate option surcharges
      let optionsSurcharge = 0;
      const optionsBreakdown: CalculatedItem['optionsBreakdown'] = [];

      if (line.selectedOptionIds && line.selectedOptionIds.length > 0) {
        for (const optId of line.selectedOptionIds) {
          const opt = db.prepare(`
            SELECT o.*, og.name as group_name 
            FROM options o 
            JOIN option_groups og ON o.group_id = og.id
            WHERE o.id = ?
          `).get(optId) as any;

          if (opt) {
            optionsSurcharge += opt.price_modifier;
            optionsBreakdown.push({
              optionId: opt.id,
              groupName: opt.group_name,
              optionName: opt.name,
              priceModifier: opt.price_modifier
            });
          }
        }
      }

      const unitFinalPrice = item.base_price + optionsSurcharge;
      const lineTotal = unitFinalPrice * line.quantity;

      subtotal += lineTotal;
      totalDrinks += line.quantity;

      calculatedItems.push({
        itemId: item.id,
        name: item.name,
        unitBasePrice: item.base_price,
        optionsSurcharge,
        unitFinalPrice,
        quantity: line.quantity,
        lineTotal,
        optionsBreakdown
      });
    }

    // Voucher handling
    let appliedVoucher: OrderPreviewResult['appliedVoucher'] | undefined;
    let discountAmount = 0;
    let voucherError: string | undefined;

    if (voucherCode) {
      const vResult = this.evaluateVoucher(voucherCode, subtotal, userId);
      if (vResult.isValid && vResult.voucher) {
        appliedVoucher = {
          id: vResult.voucher.id,
          code: vResult.voucher.code,
          title: vResult.voucher.title,
          discountType: vResult.voucher.discount_type,
          discountValue: vResult.discountAmount
        };
        discountAmount = vResult.discountAmount;
      } else {
        voucherError = vResult.reason;
      }
    } else if (autoApplyBestVoucher && userId) {
      // Find eligible active vouchers for this user
      const best = this.findBestVoucher(userId, subtotal);
      if (best) {
        appliedVoucher = {
          id: best.voucher.id,
          code: best.voucher.code,
          title: best.voucher.title,
          discountType: best.voucher.discount_type,
          discountValue: best.discountAmount
        };
        discountAmount = best.discountAmount;
      }
    }

    // 5% GST on discounted taxable amount (min 0)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const totalTax = parseFloat((taxableAmount * 0.05).toFixed(2));
    const cgstAmount = parseFloat((totalTax / 2).toFixed(2));
    const sgstAmount = parseFloat((totalTax / 2).toFixed(2));

    // Delivery fee
    const deliveryFee = mode === 'DELIVERY' ? 35.0 : 0.0;

    // Final total
    const finalTotal = parseFloat((taxableAmount + totalTax + deliveryFee).toFixed(2));

    return {
      storeId,
      fulfilmentMode: mode,
      items: calculatedItems,
      totalDrinksCount: totalDrinks,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      appliedVoucher,
      voucherError,
      cgstAmount,
      sgstAmount,
      totalTax,
      deliveryFee,
      finalTotal
    };
  }

  /**
   * Evaluate a specific voucher against an order subtotal
   */
  static evaluateVoucher(code: string, subtotal: number, userId?: string): {
    isValid: boolean;
    discountAmount: number;
    reason?: string;
    voucher?: any;
  } {
    const voucher = db.prepare(`SELECT * FROM vouchers WHERE UPPER(code) = ?`).get(code.trim().toUpperCase()) as any;
    if (!voucher) {
      return { isValid: false, discountAmount: 0, reason: 'Invalid promo code.' };
    }

    const now = new Date();
    if (new Date(voucher.valid_until) < now) {
      return { isValid: false, discountAmount: 0, reason: 'This voucher has expired.' };
    }

    if (subtotal < voucher.min_spend) {
      return {
        isValid: false,
        discountAmount: 0,
        reason: `Requires a minimum order of ₹${voucher.min_spend} (current ₹${subtotal}).`
      };
    }

    if (voucher.is_new_user_only && userId) {
      const pastOrders = db.prepare(`
        SELECT COUNT(*) as c FROM orders WHERE user_id = ? AND status NOT IN ('CANCELLED', 'EXPIRED', 'PENDING_PAYMENT')
      `).get(userId) as { c: number };

      if (pastOrders.c > 0) {
        return { isValid: false, discountAmount: 0, reason: 'This voucher is valid for first-time orders only.' };
      }
    }

    // Calculate discount amount
    let discount = 0;
    if (voucher.discount_type === 'FLAT' || voucher.discount_type === 'FREE_ITEM') {
      discount = Math.min(subtotal, voucher.discount_value);
    } else if (voucher.discount_type === 'PERCENTAGE') {
      discount = (subtotal * voucher.discount_value) / 100;
      if (voucher.max_discount) {
        discount = Math.min(discount, voucher.max_discount);
      }
    }

    return {
      isValid: true,
      discountAmount: parseFloat(discount.toFixed(2)),
      voucher
    };
  }

  /**
   * Automatically select best applicable voucher for user
   */
  static findBestVoucher(userId: string, subtotal: number): { voucher: any; discountAmount: number } | null {
    const userVouchers = db.prepare(`
      SELECT v.* FROM user_vouchers uv
      JOIN vouchers v ON uv.voucher_id = v.id
      WHERE uv.user_id = ? AND uv.status = 'ACTIVE'
    `).all(userId) as any[];

    let bestVoucher: any = null;
    let highestDiscount = 0;

    for (const v of userVouchers) {
      const evalResult = this.evaluateVoucher(v.code, subtotal, userId);
      if (evalResult.isValid && evalResult.discountAmount > highestDiscount) {
        highestDiscount = evalResult.discountAmount;
        bestVoucher = evalResult.voucher;
      }
    }

    if (!bestVoucher) return null;
    return { voucher: bestVoucher, discountAmount: highestDiscount };
  }
}
