# PROMPT FOR ANTIGRAVITY: Convert my static coffee website into a dynamic order-ahead coffee platform (Luckin-style workflow)

## 0. How I want you to work
1. First inspect the existing static project files. Keep my current branding, layout, colors, fonts and page structure. Do NOT redesign from scratch; upgrade it.
2. Before writing code, produce a short implementation plan (artifact) listing: tech stack, folder structure, database schema, API routes, pages, and build phases. Then build phase by phase.
3. After each phase, run the app and test it in the browser. At the end, give me a walkthrough recording/screenshots of the full flow: sign-up -> store -> menu -> customize -> cart -> checkout -> payment -> order tracking -> pickup QR -> invoice.
4. Default stack (change only if my project already uses a framework): Node.js + Express, SQLite (via better-sqlite3) or PostgreSQL, vanilla JS/HTML/CSS (or keep my existing framework) on the front end, JWT in httpOnly cookies for sessions, Server-Sent Events or WebSocket for live order status. Everything must run locally with `npm install && npm start`. Provide a `.env.example`.
5. All third-party services (SMS OTP, payment gateway, maps) must sit behind adapter modules with a MOCK implementation for development and a clearly marked place to plug in real keys (e.g. Razorpay test mode / UPI for payments, MSG91 or Twilio for SMS).

## 1. Business strategy to copy (Luckin Coffee model)
- App-first / account-first: customers cannot just walk up and order; they order and pay through the digital flow, with no cashier. Our website replaces the app.
- Order ahead, skip the queue: choose drink -> choose store -> pay online -> get notified -> collect with a QR/pickup code.
- Acquisition hook: new-user first-cup offer (voucher issued automatically on sign-up) + referral reward ("Double the Fun" style: friend signs up and places first order, both get a reward).
- Retention: vouchers/coupons wallet, membership tiers with points, daily/weekly deals, reorder in one tap.
- Single-screen confidence: the final order screen is the "point of truth" showing store, fulfilment mode, every customization, price breakdown and applied voucher BEFORE payment.
- Operations: orders flow straight to a barista/kitchen dashboard; store prep time and availability are shown to the customer.

## 2. Roles
- Customer (public site + account)
- Barista/Store staff (order queue dashboard, scan QR, mark ready)
- Admin (menu, prices, stores, vouchers, tiers, reports)

## 3. Customer workflow (build every step)

### Step 1: Landing page (dynamic)
- Hero banner with the new-user offer, loaded from DB (admin-editable).
- Featured/bestseller drinks, today's deals, nearest store widget.
- "Order now" CTA: if not logged in, route to sign-up/login and return to the same place afterwards (preserve intent).

### Step 2: Account creation and login
- Phone number as primary identity (with country code, default +91). Optional email.
- OTP flow: send OTP -> 6-digit input -> verify. Rules: OTP expires in 5 min, max 5 attempts, resend cooldown 60 s with visible countdown, rate-limit per phone and per IP. In dev/mock mode, print the OTP to server console and show a "Dev OTP" hint only when `NODE_ENV=development`.
- First login = registration: ask name, optional email, optional referral code, consent checkbox for terms/privacy.
- On successful registration: create user, generate their own referral code, auto-issue the "New User First Cup" voucher into their wallet, show a welcome screen with the voucher.
- Returning login: phone + OTP. Session persists (30 days), logout, "delete my account" in settings (soft delete + confirm).
- Edge cases: wrong OTP, expired OTP, duplicate phone, OTP delivery failure message with retry, invalid referral code (do not block signup).

### Step 3: Store selection
- Stores table with name, address, lat/lng, opening hours, status (open/busy/closed), average prep time, supported modes (pickup, delivery, dine-in).
- On entering the order flow ask for location permission; if granted, sort stores by distance and preselect the nearest open one. If denied, show a searchable dropdown/list.
- Show for each store: distance, open/closed, current estimated prep time ("Ready in ~8 min").
- Selected store is saved in session/cart. Changing store re-validates cart items (an item can be unavailable at that store; flag and offer to remove).

### Step 4: Fulfilment mode and pickup timing (this is the "pre-booking" part)
- Mode: Self-pickup (default, recommended for first orders), Delivery (address book + delivery fee + radius check), optional Dine-in.
- Pickup timing: "ASAP" (default, shows estimated ready time) or "Schedule for later" with time slots.
- Slots: generated per store in 10-15 min steps within opening hours, up to 24 h ahead. Each slot has a capacity (max orders or max drinks per slot, configurable per store); full slots are shown as disabled. Reserve the slot when the order is created and release it if payment fails/expires or the order is cancelled.
- Note: Luckin itself is mainly order-ahead for ASAP pickup; scheduled slots are an extension we add for pre-booking.

### Step 5: Menu browsing
- Categories (Coffee, Tea, Fruit drinks, Bakery, etc.) from DB, with search, filters (hot/iced, dairy-free, price) and bestseller/new tags.
- Item card: image, name, price, tags, availability at the selected store, "Add" button.
- Item detail drawer/page with customization:
  - Size, temperature (hot/iced), sweetness levels (e.g. 0/25/50/75/100%), ice level, milk type, extra shot, syrups/toppings, special note.
  - Live price update when options with surcharges are chosen.
  - Required options must be selected before "Add to cart"; show validation.
- Out-of-stock items greyed out; stock/availability managed per store.

### Step 6: Cart
- Persistent cart (server-side for logged-in users, localStorage for guests then merged on login).
- Edit quantity, edit customization, remove, "clear cart". Show every customization clearly under each line item.
- Upsell row (add a pastry), subtotal, voucher input/selection, estimated tax.
- Block checkout if: store closed, selected slot expired/full, item unavailable, cart empty. Show clear messages.

### Step 7: Order preview and checkout (the "point of truth" screen)
- Server-side `POST /api/orders/preview` recalculates everything from DB prices (never trust client prices): items, option surcharges, discounts, tax (GST breakdown), delivery fee, total.
- Voucher wallet: list eligible vouchers, auto-apply the best one, allow manual change or removal, show reason when a voucher is not applicable (min spend, expired, first-order-only, item restrictions). One voucher per order unless configured otherwise.
- Show a final summary: store + address, mode, pickup time/slot, all items with customizations, price breakdown, voucher applied, total payable. Checkbox/confirmation "I have checked my order".
- Payment methods: UPI, cards, net banking, wallets (via gateway adapter, test mode), optional "Pay at counter" only if admin enables it.

### Step 8: Payment and order creation
- Create order in `PENDING_PAYMENT` with an expiry (e.g. 10 min), reserve the slot and voucher, then open the payment gateway.
- Use idempotency keys so double-clicks never create duplicate orders or double charges.
- Payment webhook/callback verifies signature -> mark `PAID` -> consume the voucher -> push the order to the barista queue -> trigger notifications.
- Failure paths: payment failed, user closed the gateway, timeout. Release slot + voucher, show "Retry payment" or "Change method". Orders stuck in PENDING_PAYMENT auto-expire via a background job.
- Refund flow: full refund for cancellations before preparation starts and for failed fulfilment; refund status shown to the user.

### Step 9: Order tracking and pickup
- Status machine: `PENDING_PAYMENT -> PAID -> ACCEPTED -> PREPARING -> READY -> COLLECTED` (plus `CANCELLED`, `REFUNDED`, `EXPIRED`; for delivery add `OUT_FOR_DELIVERY -> DELIVERED`).
- Live tracking page (SSE/WebSocket) with progress bar, estimated ready time and store details.
- On `READY`: send SMS/WhatsApp (adapter) + in-app notification + browser notification: "Your drink is ready".
- Pickup proof: generate a unique 4-digit pickup code and a QR code per order. Customer shows the QR at the counter; barista scans or types the code to mark `COLLECTED`. A code works once, only for the right store.
- Cancellation rules: customer can cancel only before `PREPARING`; after that the button is disabled with an explanation.

### Step 10: Billing and invoice
- Generate an invoice per paid order: invoice number, date/time, store name/GSTIN placeholder, itemized lines with customizations, discount, GST split (CGST/SGST), delivery fee, total, payment method + transaction id.
- "Download PDF" and "Email invoice" buttons. Invoice is also visible in order history.
- Orders can be re-ordered in one tap (re-validates price and availability).

### Step 11: Account area
- Profile, saved addresses, order history with filters, voucher wallet (active/used/expired), membership tier and points progress, referral page (code + share link + rewards earned), notification preferences.
- Membership: points per spend; tiers (e.g. Blue -> Silver -> Gold) with upgrade vouchers; points credited when order becomes `COLLECTED`.
- Referral: both sides get a reward voucher after the referred user's first completed order; prevent self-referral and duplicates.

## 4. Barista / store dashboard
- Login for staff scoped to one store.
- Live queue (new orders with sound/visual alert), grouped by status and sorted by pickup time; show items with all customizations and notes clearly.
- Buttons: Accept, Start preparing, Mark ready, Scan/enter pickup code -> Collected, Cancel with reason (triggers refund).
- Toggle store status (open/busy/closed), adjust prep time, mark items out of stock.

## 5. Admin panel
- CRUD for categories, items, option groups and surcharges, per-store availability, stores and hours, slot capacity.
- CRUD for vouchers (type: % / flat / free item, min spend, validity, new-user only, usage limits), banners, membership rules.
- Reports: orders per day, revenue, top items, voucher usage, peak hours.

## 6. Data model (create migrations + seed data)
users, otp_requests, sessions, addresses, stores, store_hours, categories, items, option_groups, options, item_option_groups, store_item_availability, carts, cart_items, vouchers, user_vouchers, orders, order_items, order_item_options, slots, slot_reservations, payments, refunds, invoices, notifications, loyalty_ledger, referrals, staff_users, audit_log.
Seed: 3 stores, 5 categories, ~20 drinks/bakery items with options, the new-user voucher, a few deal vouchers, one admin and one barista account.

## 7. API (REST, JSON, validated)
Auth: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/me`.
Catalog: `GET /api/stores`, `GET /api/stores/:id/slots?date=`, `GET /api/menu?storeId=`, `GET /api/items/:id`.
Cart/Order: `GET/PUT /api/cart`, `POST /api/orders/preview`, `POST /api/orders`, `GET /api/orders/:id`, `GET /api/orders/:id/stream`, `POST /api/orders/:id/cancel`, `GET /api/orders/:id/invoice`.
Payments: `POST /api/payments/create`, `POST /api/payments/webhook`.
Account: vouchers, loyalty, referrals, addresses, history.
Staff/Admin: protected routes with role checks.

## 8. Non-functional requirements
- Server is the source of truth for prices, stock, vouchers, tax and slot capacity. Use DB transactions for order creation, slot reservation and voucher use (no overselling slots, no double voucher use).
- Security: input validation (zod/joi), rate limiting, CSRF protection, secure cookies, hashed OTPs, no secrets in front-end code, audit log for staff actions, role-based access.
- UX: mobile-first, loading/empty/error states for every screen, accessible forms, toast messages, keep the user's cart through login.
- Performance: cache menu, paginate history, optimistic UI only where safe.
- Timezone: store hours and slots in Asia/Kolkata; store timestamps in UTC.
- Currency: INR, GST shown on invoice.

## 9. Acceptance criteria (verify each in the browser)
1. New user signs up with phone + OTP, receives the first-cup voucher automatically.
2. Nearest store is auto-selected with location permission; manual selection works without it.
3. User customizes a drink (size, sweetness, milk, add-on) and the price updates correctly.
4. User picks a scheduled pickup slot; a full slot cannot be booked; slot is released on cancel/payment failure.
5. Preview screen shows correct totals and applies the best voucher; server recalculation matches the UI.
6. Payment success moves the order to PAID and appears instantly on the barista dashboard; failure allows retry without duplicate orders.
7. Customer sees live status changes and gets a "ready" notification; barista scans the QR/code once to complete.
8. Invoice with GST breakdown can be downloaded as PDF from order history.
9. Referral and loyalty points are credited correctly after collection.
10. Cancel before preparing triggers a refund; cancel after preparing is blocked.
11. No console errors; works on mobile and desktop widths.

Start with the plan artifact now, then implement Phase 1 (database + auth + OTP), Phase 2 (stores, menu, customization, cart), Phase 3 (slots, preview, vouchers, payment), Phase 4 (order tracking, barista dashboard, QR pickup), Phase 5 (invoice, loyalty, referral, admin), Phase 6 (testing and polish).
