import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { SseService } from '../services/SseService';
import { OrderService } from '../services/OrderService';
import { v4 as uuidv4 } from 'uuid';

export const realtimeRouter = Router();

// GET /api/realtime/stream - Global real-time SSE stream for customer apps & dashboards
realtimeRouter.get('/stream', (req: Request, res: Response) => {
  SseService.subscribeGlobalFeed(res);
});

// GET /api/realtime/overview - Live queue metrics, store radar, and recent activity
realtimeRouter.get('/overview', (req: Request, res: Response) => {
  try {
    // 1. Calculate active queue count per store
    const queueCounts = db.prepare(`
      SELECT store_id, COUNT(*) as in_queue
      FROM orders
      WHERE status IN ('PAID', 'ACCEPTED', 'PREPARING')
      GROUP BY store_id
    `).all() as { store_id: string; in_queue: number }[];

    const queueMap: Record<string, number> = {};
    for (const q of queueCounts) {
      queueMap[q.store_id] = q.in_queue;
    }

    // 2. Fetch all stores with enriched live rush levels
    const stores = db.prepare(`SELECT * FROM stores ORDER BY name ASC`).all() as any[];
    const enrichedStores = stores.map(store => {
      const inQueue = queueMap[store.id] || 0;
      let rushLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (inQueue >= 6 || store.status === 'BUSY') {
        rushLevel = 'HIGH';
      } else if (inQueue >= 3) {
        rushLevel = 'MEDIUM';
      }

      return {
        ...store,
        inQueue,
        rushLevel,
        livePrepTime: store.status === 'BUSY' ? Math.max(store.avg_prep_time_minutes, 14) : store.avg_prep_time_minutes,
        supports_pickup: Boolean(store.supports_pickup),
        supports_delivery: Boolean(store.supports_delivery),
        supports_dinein: Boolean(store.supports_dinein)
      };
    });

    // 3. Recent activity ticker items
    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
             s.name as store_name,
             u.name as customer_name
      FROM orders o
      JOIN stores s ON o.store_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 8
    `).all() as any[];

    // Fallback social proof activity if DB is fresh
    const sampleNames = ['Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Kabir', 'Meera'];
    const sampleDrinks = ['Iced Coconut Cloud Latte', 'Spanish Brown Sugar Latte', 'Velvet Cold Brew', 'Pistachio Espresso Tonic', 'Cortado'];
    const sampleStores = ['Indiranagar Flagship', 'Koramangala Roastery', 'Lavelle Road Atelier'];

    const activityFeed = recentOrders.map((o, idx) => ({
      id: o.id,
      text: `${o.customer_name || sampleNames[idx % sampleNames.length]} ordered ${sampleDrinks[idx % sampleDrinks.length]} at ${o.store_name}`,
      status: o.status,
      timeAgo: 'Just now'
    }));

    if (activityFeed.length === 0) {
      sampleNames.slice(0, 4).forEach((name, i) => {
        activityFeed.push({
          id: `sample_${i}`,
          text: `${name} ordered ${sampleDrinks[i]} at ${sampleStores[i % sampleStores.length]}`,
          status: 'PREPARING',
          timeAgo: `${(i + 1) * 2}m ago`
        });
      });
    }

    // 4. Luckin Flash Deals
    const activeFlashDeal = {
      title: 'LUCKIN RUSH HOUR',
      tagline: '50% Off First Drink + Buy 1 Get 1 on All Iced Lattes',
      code: 'FIRSTCUP',
      discountPercent: 50,
      bannerBg: 'bg-gradient-to-r from-[#0F4C81] via-[#1E293B] to-[#8C6D46]',
      expiresInSeconds: 1140 // ~19 mins live timer
    };

    res.json({
      success: true,
      stores: enrichedStores,
      activityFeed,
      activeFlashDeal,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/realtime/simulate/fast-order - 1-Click Fast Order for demonstration
realtimeRouter.post('/simulate/fast-order', async (req: Request, res: Response) => {
  try {
    const { storeId = 'store_indiranagar', drinkName = 'Iced Coconut Cloud Latte' } = req.body;

    // Get an item from DB
    const item = db.prepare(`SELECT * FROM items WHERE is_bestseller = 1 LIMIT 1`).get() as any 
      || db.prepare(`SELECT * FROM items LIMIT 1`).get() as any;

    if (!item) {
      res.status(400).json({ success: false, error: 'No items in database' });
      return;
    }

    // Find or create test guest user
    let user = db.prepare(`SELECT * FROM users WHERE phone = '+919876543210'`).get() as any;
    if (!user) {
      const newUserId = `usr_${uuidv4().substring(0, 8)}`;
      db.prepare(`
        INSERT INTO users (id, phone, name, email, referral_code, membership_tier, loyalty_points)
        VALUES (?, '+919876543210', 'Alex Rivera', 'alex@demo.coffee', 'DEMO777', 'SILVER', 150)
      `).run(newUserId);
      user = { id: newUserId, name: 'Alex Rivera', phone: '+919876543210' };
    }

    // Create Order directly
    const createResult = await OrderService.createOrder({
      userId: user.id,
      storeId,
      fulfilmentMode: 'PICKUP',
      pickupType: 'ASAP',
      items: [{
        itemId: item.id,
        quantity: 1,
        selectedOptionIds: []
      }],
      voucherCode: 'FIRSTCUP'
    });

    // Automatically complete payment to move to PAID
    const paidOrder = await OrderService.handlePaymentSuccess(
      createResult.order.id,
      `pay_sim_${Date.now()}`,
      `tx_sim_${Date.now()}`
    );

    // Assign Shelf Locker
    const shelves = ['Shelf A-01', 'Shelf A-03', 'Shelf B-02', 'Shelf C-05'];
    const assignedShelf = shelves[Math.floor(Math.random() * shelves.length)];

    // Notify global feed of real-time activity
    SseService.notifyGlobalFeed({
      type: 'LIVE_ACTIVITY',
      event: 'NEW_ORDER',
      text: `${user.name} ordered ${item.name} at Indiranagar Flagship`,
      orderId: paidOrder.id,
      orderNumber: paidOrder.order_number,
      assignedShelf
    });

    res.json({
      success: true,
      order: paidOrder,
      assignedShelf,
      message: 'Demo order created and paid successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/realtime/simulate/advance - Advance order to next status
realtimeRouter.post('/simulate/advance', async (req: Request, res: Response) => {
  try {
    const { orderId, targetStatus } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: 'orderId is required' });
      return;
    }

    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    let nextStatus = targetStatus;
    if (!nextStatus) {
      if (order.status === 'PAID') nextStatus = 'ACCEPTED';
      else if (order.status === 'ACCEPTED') nextStatus = 'PREPARING';
      else if (order.status === 'PREPARING') nextStatus = 'READY';
      else if (order.status === 'READY') nextStatus = 'COLLECTED';
      else {
        res.json({ success: true, order, message: `Order already ${order.status}` });
        return;
      }
    }

    if (nextStatus === 'COLLECTED') {
      const collectRes = await OrderService.verifyPickupAndCollect(order.store_id, order.pickup_code);
      res.json({ success: true, order: collectRes.order, status: 'COLLECTED' });
      return;
    }

    const updated = await OrderService.updateOrderStatus(orderId, nextStatus);

    // Shelf Locker assignment on READY
    const shelf = `Shelf A-0${Math.floor(1 + Math.random() * 4)}`;
    if (nextStatus === 'READY') {
      SseService.notifyGlobalFeed({
        type: 'ORDER_READY_FOR_PICKUP',
        orderId,
        orderNumber: order.order_number,
        pickupCode: order.pickup_code,
        shelf
      });
    }

    res.json({
      success: true,
      order: updated,
      status: nextStatus,
      shelf: nextStatus === 'READY' ? shelf : undefined
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/realtime/simulate/toggle-rush - Toggle store busy status / prep time
realtimeRouter.post('/simulate/toggle-rush', (req: Request, res: Response) => {
  try {
    const { storeId = 'store_indiranagar' } = req.body;
    const store = db.prepare(`SELECT * FROM stores WHERE id = ?`).get(storeId) as any;
    if (!store) {
      res.status(404).json({ success: false, error: 'Store not found' });
      return;
    }

    const newStatus = store.status === 'BUSY' ? 'OPEN' : 'BUSY';
    const newPrep = newStatus === 'BUSY' ? 16 : 8;

    db.prepare(`UPDATE stores SET status = ?, avg_prep_time_minutes = ? WHERE id = ?`).run(newStatus, newPrep, storeId);

    const updated = db.prepare(`SELECT * FROM stores WHERE id = ?`).get(storeId) as any;

    // Broadcast store status change immediately to all connected browsers!
    SseService.notifyGlobalFeed({
      type: 'STORE_STATUS_UPDATED',
      storeId,
      status: newStatus,
      avg_prep_time_minutes: newPrep,
      message: `${store.name} is now ${newStatus} (~${newPrep} min prep time)`
    });

    res.json({
      success: true,
      store: updated,
      message: `Store updated to ${newStatus} (~${newPrep} min prep)`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
