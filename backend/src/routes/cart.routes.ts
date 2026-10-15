import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection';
import { requireAuth } from '../middleware/auth';

export const cartRouter = Router();

// GET /api/cart - Fetch current user's synced cart
cartRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const cart = db.prepare(`SELECT * FROM carts WHERE user_id = ?`).get(userId) as any;
  if (!cart) {
    res.json({ success: true, cart: { items: [], storeId: null } });
    return;
  }

  const items = db.prepare(`
    SELECT ci.*, i.name, i.base_price, i.image_url, i.category_id
    FROM cart_items ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.cart_id = ?
  `).all(cart.id) as any[];

  const resolvedItems = items.map(item => {
    let options: string[] = [];
    try {
      options = JSON.parse(item.customizations_json);
    } catch {
      options = [];
    }
    return {
      cartItemId: item.id,
      itemId: item.item_id,
      name: item.name,
      basePrice: item.base_price,
      imageUrl: item.image_url,
      quantity: item.quantity,
      selectedOptionIds: options
    };
  });

  res.json({
    success: true,
    cart: {
      id: cart.id,
      storeId: cart.store_id,
      items: resolvedItems
    }
  });
});

// PUT /api/cart - Sync cart state from client
cartRouter.put('/', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { storeId, items } = req.body; // items: [{ itemId, quantity, selectedOptionIds }]

  const syncTx = db.transaction(() => {
    let cart = db.prepare(`SELECT id FROM carts WHERE user_id = ?`).get(userId) as any;
    if (!cart) {
      const cartId = `cart_${uuidv4().substring(0, 8)}`;
      db.prepare(`INSERT INTO carts (id, user_id, store_id) VALUES (?, ?, ?)`).run(cartId, userId, storeId || null);
      cart = { id: cartId };
    } else {
      db.prepare(`UPDATE carts SET store_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(storeId || null, cart.id);
      db.prepare(`DELETE FROM cart_items WHERE cart_id = ?`).run(cart.id);
    }

    if (Array.isArray(items) && items.length > 0) {
      const insertLine = db.prepare(`
        INSERT INTO cart_items (id, cart_id, item_id, quantity, customizations_json)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        const lineId = `ci_${uuidv4().substring(0, 8)}`;
        const json = JSON.stringify(item.selectedOptionIds || []);
        insertLine.run(lineId, cart.id, item.itemId, item.quantity || 1, json);
      }
    }
  });

  syncTx();
  res.json({ success: true, message: 'Cart synced successfully' });
});

// DELETE /api/cart - Clear cart
cartRouter.delete('/', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const cart = db.prepare(`SELECT id FROM carts WHERE user_id = ?`).get(userId) as any;
  if (cart) {
    db.prepare(`DELETE FROM cart_items WHERE cart_id = ?`).run(cart.id);
  }
  res.json({ success: true, message: 'Cart cleared' });
});
