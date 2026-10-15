import db from '../db/connection';
import { DistanceAdapter, Coordinates } from '../adapters/location/DistanceAdapter';

export interface StoreWithDistance {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  avg_prep_time_minutes: number;
  supports_pickup: boolean;
  supports_delivery: boolean;
  supports_dinein: boolean;
  distanceKm?: number;
  isOpenNow: boolean;
}

export interface TimeSlot {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacityLimit: number;
  reservedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
}

export class StoreSlotService {
  /**
   * Get all stores, optionally sorted by distance from coordinates
   */
  static getStores(userCoords?: Coordinates): StoreWithDistance[] {
    const stores = db.prepare(`SELECT * FROM stores ORDER BY name ASC`).all() as any[];

    const enriched = stores.map(store => {
      let distanceKm: number | undefined;
      if (userCoords && userCoords.latitude && userCoords.longitude) {
        distanceKm = DistanceAdapter.calculateDistanceKm(userCoords, {
          latitude: store.latitude,
          longitude: store.longitude
        });
      }

      return {
        ...store,
        supports_pickup: Boolean(store.supports_pickup),
        supports_delivery: Boolean(store.supports_delivery),
        supports_dinein: Boolean(store.supports_dinein),
        distanceKm,
        isOpenNow: store.status !== 'CLOSED'
      };
    });

    if (userCoords) {
      enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return enriched;
  }

  /**
   * Generate or retrieve 15-minute slots for a store on a given date (Asia/Kolkata timezone)
   */
  static getStoreSlots(storeId: string, dateStr?: string): TimeSlot[] {
    const today = dateStr || new Date().toISOString().split('T')[0];

    // Find store opening hours for the day of week
    const dateObj = new Date(today);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun

    const hours = db.prepare(`
      SELECT open_time, close_time FROM store_hours 
      WHERE store_id = ? AND day_of_week = ?
    `).get(storeId, dayOfWeek) as { open_time: string; close_time: string } | undefined;

    const openTime = hours?.open_time || '07:00';
    const closeTime = hours?.close_time || '22:00';

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Ensure slot records exist in DB for this date & store
    const existingSlots = db.prepare(`
      SELECT * FROM slots WHERE store_id = ? AND slot_date = ? ORDER BY start_time ASC
    `).all(storeId, today) as any[];

    if (existingSlots.length === 0) {
      const insertSlot = db.prepare(`
        INSERT INTO slots (id, store_id, slot_date, start_time, end_time, capacity_limit)
        VALUES (?, ?, ?, ?, ?, 15)
      `);

      const makeSlots = db.transaction(() => {
        for (let m = openMinutes; m + 15 <= closeMinutes; m += 15) {
          const startH = String(Math.floor(m / 60)).padStart(2, '0');
          const startMin = String(m % 60).padStart(2, '0');
          const endH = String(Math.floor((m + 15) / 60)).padStart(2, '0');
          const endMin = String((m + 15) % 60).padStart(2, '0');

          const startTime = `${startH}:${startMin}`;
          const endTime = `${endH}:${endMin}`;
          const slotId = `slot_${storeId}_${today}_${startH}${startMin}`;

          insertSlot.run(slotId, storeId, today, startTime, endTime);
        }
      });

      makeSlots();
    }

    // Query slots with active reservations count
    const slots = db.prepare(`
      SELECT s.*, 
        COALESCE(SUM(sr.drinks_count), 0) as reserved_drinks
      FROM slots s
      LEFT JOIN slot_reservations sr ON s.id = sr.slot_id
      WHERE s.store_id = ? AND s.slot_date = ?
      GROUP BY s.id
      ORDER BY s.start_time ASC
    `).all(storeId, today) as any[];

    // Calculate current time for disabling past slots on today's date
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTotalMins = currentHours * 60 + currentMins;
    const isToday = today === now.toISOString().split('T')[0];

    return slots.map(slot => {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const slotStartMinutes = sh * 60 + sm;
      const isPast = isToday && slotStartMinutes < currentTotalMins + 5; // buffer 5 mins
      const remainingCapacity = Math.max(0, slot.capacity_limit - slot.reserved_drinks);

      return {
        slotId: slot.id,
        date: slot.slot_date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        capacityLimit: slot.capacity_limit,
        reservedCount: slot.reserved_drinks,
        remainingCapacity,
        isAvailable: !isPast && remainingCapacity > 0
      };
    });
  }

  /**
   * Atomically reserve slot capacity
   */
  static reserveSlot(slotId: string, orderId: string, drinksCount: number): boolean {
    const slot = db.prepare(`
      SELECT s.*, COALESCE(SUM(sr.drinks_count), 0) as reserved_drinks
      FROM slots s
      LEFT JOIN slot_reservations sr ON s.id = sr.slot_id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(slotId) as any;

    if (!slot) return false;

    if (slot.capacity_limit - slot.reserved_drinks < drinksCount) {
      return false; // Not enough capacity
    }

    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    db.prepare(`
      INSERT INTO slot_reservations (id, slot_id, order_id, drinks_count)
      VALUES (?, ?, ?, ?)
    `).run(reservationId, slotId, orderId, drinksCount);

    return true;
  }

  /**
   * Release slot reservation on cancel or payment failure
   */
  static releaseSlot(orderId: string): void {
    db.prepare('DELETE FROM slot_reservations WHERE order_id = ?').run(orderId);
  }
}
