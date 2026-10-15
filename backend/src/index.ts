import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { runMigrations } from './db/migrate';
import { authRouter } from './routes/auth.routes';
import { storeRouter } from './routes/store.routes';
import { menuRouter } from './routes/menu.routes';
import { cartRouter } from './routes/cart.routes';
import { orderRouter } from './routes/order.routes';
import { paymentRouter } from './routes/payment.routes';
import { accountRouter } from './routes/account.routes';
import { baristaRouter } from './routes/barista.routes';
import { adminRouter } from './routes/admin.routes';
import { realtimeRouter } from './routes/realtime.routes';
import { startOrderReaper } from './cron/orderReaper';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'https://coffee-updated.vercel.app'
    ].filter(Boolean);
    if (allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Boot: Run Database Migrations
runMigrations();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/menu', menuRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/account', accountRouter);
app.use('/api/barista', baristaRouter);
app.use('/api/admin', adminRouter);
app.use('/api/realtime', realtimeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    smsProvider: process.env.SMS_PROVIDER || 'MOCK',
    paymentProvider: process.env.PAYMENT_PROVIDER || 'MOCK'
  });
});

// Start Background Reaper
startOrderReaper();

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`☕ Brew & Bloom Artisan Order-Ahead Server Active`);
  console.log(`🚀 Port: http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (WAL mode)`);
  console.log(`🔒 Auth: JWT httpOnly cookies`);
  console.log(`📡 Realtime: Server-Sent Events enabled`);
  console.log(`======================================================\n`);
});
