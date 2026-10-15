import { Response } from 'express';

interface OrderSubscriber {
  orderId: string;
  res: Response;
}

interface BaristaSubscriber {
  storeId?: string; // If undefined, receives all stores (Admin)
  res: Response;
}

export class SseService {
  private static orderSubscribers: OrderSubscriber[] = [];
  private static baristaSubscribers: BaristaSubscriber[] = [];
  private static globalFeedSubscribers: Response[] = [];

  /**
   * Subscribe client to live order updates
   */
  static subscribeOrder(orderId: string, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sub = { orderId, res };
    this.orderSubscribers.push(sub);

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', orderId })}\n\n`);

    res.on('close', () => {
      this.orderSubscribers = this.orderSubscribers.filter(s => s !== sub);
    });
  }

  /**
   * Subscribe Barista dashboard to live store queue events
   */
  static subscribeBarista(res: Response, storeId?: string): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sub = { storeId, res };
    this.baristaSubscribers.push(sub);

    res.write(`data: ${JSON.stringify({ type: 'BARISTA_CONNECTED', storeId })}\n\n`);

    res.on('close', () => {
      this.baristaSubscribers = this.baristaSubscribers.filter(s => s !== sub);
    });
  }

  /**
   * Subscribe customer clients to global store radar & real-time activity feed
   */
  static subscribeGlobalFeed(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    this.globalFeedSubscribers.push(res);

    // Initial connected packet
    res.write(`data: ${JSON.stringify({ type: 'GLOBAL_FEED_CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    res.on('close', () => {
      this.globalFeedSubscribers = this.globalFeedSubscribers.filter(s => s !== res);
    });
  }

  /**
   * Broadcast status change to customer tracking this order
   */
  static notifyOrderStatus(orderId: string, payload: any): void {
    const message = `data: ${JSON.stringify({ type: 'ORDER_STATUS_UPDATE', orderId, ...payload })}\n\n`;
    for (const sub of this.orderSubscribers) {
      if (sub.orderId === orderId) {
        try {
          sub.res.write(message);
        } catch {
          // Client disconnected
        }
      }
    }

    // Also broadcast to global feed so floating tracker across all pages can update immediately
    this.notifyGlobalFeed({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      ...payload
    });
  }

  /**
   * Broadcast new order / status update to active Barista dashboards
   */
  static notifyBaristaQueue(storeId: string, event: string, orderData: any): void {
    const message = `data: ${JSON.stringify({ type: 'QUEUE_UPDATE', event, storeId, order: orderData })}\n\n`;
    for (const sub of this.baristaSubscribers) {
      if (!sub.storeId || sub.storeId === storeId) {
        try {
          sub.res.write(message);
        } catch {
          // Client disconnected
        }
      }
    }
  }

  /**
   * Broadcast real-time events to all connected clients (store radar, live order activity, flash deals)
   */
  static notifyGlobalFeed(payload: any): void {
    const message = `data: ${JSON.stringify({ timestamp: new Date().toISOString(), ...payload })}\n\n`;
    for (const client of this.globalFeedSubscribers) {
      try {
        client.write(message);
      } catch {
        // Disconnected client
      }
    }
  }
}

