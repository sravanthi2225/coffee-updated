import { Router, Request, Response } from 'express';
import db from '../db/connection';

export const menuRouter = Router();

// GET /api/menu?storeId= - Complete menu with categories, items, option groups, and store availability
menuRouter.get('/', (req: Request, res: Response) => {
  const storeId = req.query.storeId as string | undefined;

  const categories = db.prepare(`SELECT * FROM categories ORDER BY sort_order ASC`).all() as any[];
  const items = db.prepare(`SELECT * FROM items ORDER BY is_bestseller DESC, name ASC`).all() as any[];

  // Fetch option groups and options
  const optionGroups = db.prepare(`SELECT * FROM option_groups`).all() as any[];
  const options = db.prepare(`SELECT * FROM options ORDER BY price_modifier ASC`).all() as any[];
  const itemOptionGroupLinks = db.prepare(`SELECT * FROM item_option_groups`).all() as any[];

  // Store item stock map
  let outOfStockItemIds = new Set<string>();
  if (storeId) {
    const stockRows = db.prepare(`
      SELECT item_id FROM store_item_availability WHERE store_id = ? AND is_available = 0
    `).all(storeId) as any[];
    outOfStockItemIds = new Set(stockRows.map(r => r.item_id));
  }

  // Group options by option_group_id
  const optionsByGroup = new Map<string, any[]>();
  for (const opt of options) {
    if (!optionsByGroup.has(opt.group_id)) optionsByGroup.set(opt.group_id, []);
    optionsByGroup.get(opt.group_id)!.push(opt);
  }

  // Map option groups by ID
  const optionGroupsById = new Map<string, any>();
  for (const og of optionGroups) {
    optionGroupsById.set(og.id, {
      ...og,
      is_required: Boolean(og.is_required),
      options: optionsByGroup.get(og.id) || []
    });
  }

  // Map item option groups
  const itemGroupsMap = new Map<string, any[]>();
  for (const link of itemOptionGroupLinks) {
    if (!itemGroupsMap.has(link.item_id)) itemGroupsMap.set(link.item_id, []);
    const og = optionGroupsById.get(link.group_id);
    if (og) itemGroupsMap.get(link.item_id)!.push(og);
  }

  // Assemble items
  const itemsByCat = new Map<string, any[]>();
  for (const item of items) {
    if (!itemsByCat.has(item.category_id)) itemsByCat.set(item.category_id, []);
    itemsByCat.get(item.category_id)!.push({
      ...item,
      is_bestseller: Boolean(item.is_bestseller),
      is_new: Boolean(item.is_new),
      isAvailable: !outOfStockItemIds.has(item.id),
      optionGroups: itemGroupsMap.get(item.id) || []
    });
  }

  const result = categories.map(cat => ({
    ...cat,
    items: itemsByCat.get(cat.id) || []
  }));

  res.json({ success: true, menu: result });
});

// GET /api/menu/items/:id - Single item detail with options and availability
menuRouter.get('/items/:id', (req: Request, res: Response) => {
  const storeId = req.query.storeId as string | undefined;
  const item = db.prepare(`SELECT * FROM items WHERE id = ?`).get(req.params.id) as any;

  if (!item) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
    return;
  }

  let isAvailable = true;
  if (storeId) {
    const stock = db.prepare(`
      SELECT is_available FROM store_item_availability WHERE store_id = ? AND item_id = ?
    `).get(storeId, item.id) as { is_available: number } | undefined;
    if (stock && stock.is_available === 0) isAvailable = false;
  }

  // Get option groups for this item
  const groups = db.prepare(`
    SELECT og.* FROM option_groups og
    JOIN item_option_groups iog ON og.id = iog.group_id
    WHERE iog.item_id = ?
  `).all(item.id) as any[];

  for (const g of groups) {
    g.options = db.prepare(`SELECT * FROM options WHERE group_id = ? ORDER BY price_modifier ASC`).all(g.id);
  }

  res.json({
    success: true,
    item: {
      ...item,
      is_bestseller: Boolean(item.is_bestseller),
      is_new: Boolean(item.is_new),
      isAvailable,
      optionGroups: groups
    }
  });
});
