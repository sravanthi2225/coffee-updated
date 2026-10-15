import { Router, Request, Response } from 'express';
import { StoreSlotService } from '../services/StoreSlotService';
import db from '../db/connection';

export const storeRouter = Router();

// GET /api/stores - List all stores, optionally sorted by user location
storeRouter.get('/', (req: Request, res: Response) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

  const coords = lat && lng && !isNaN(lat) && !isNaN(lng) ? { latitude: lat, longitude: lng } : undefined;
  const stores = StoreSlotService.getStores(coords);

  res.json({ success: true, stores });
});

// GET /api/stores/:id - Store detail + hours
storeRouter.get('/:id', (req: Request, res: Response) => {
  const store = db.prepare(`SELECT * FROM stores WHERE id = ?`).get(req.params.id);
  if (!store) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Store not found' } });
    return;
  }

  const hours = db.prepare(`SELECT * FROM store_hours WHERE store_id = ? ORDER BY day_of_week ASC`).all(req.params.id);
  res.json({ success: true, store: { ...store, hours } });
});

// GET /api/stores/:id/slots - 15-minute slot generator with capacity status
storeRouter.get('/:id/slots', (req: Request, res: Response) => {
  const dateStr = req.query.date as string | undefined;
  const slots = StoreSlotService.getStoreSlots(req.params.id, dateStr);
  res.json({ success: true, date: dateStr || new Date().toISOString().split('T')[0], slots });
});
