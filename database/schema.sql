-- -------------------------------------------------------------
-- BREW & BLOOM: DYNAMIC ORDER-AHEAD PLATFORM (LUCKIN MODEL)
-- Relational SQLite DDL Schema (28 Tables)
-- -------------------------------------------------------------

PRAGMA foreign_keys = ON;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER',
    referral_code TEXT NOT NULL UNIQUE,
    referred_by_user_id TEXT REFERENCES users(id),
    membership_tier TEXT NOT NULL DEFAULT 'BLUE', -- BLUE, SILVER, GOLD
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

CREATE TABLE IF NOT EXISTS otp_requests (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- Home, Work, Other
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    is_default BOOLEAN NOT NULL DEFAULT 0
);

-- 2. Store Network & Hours
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, BUSY, CLOSED
    avg_prep_time_minutes INTEGER NOT NULL DEFAULT 8,
    supports_pickup BOOLEAN NOT NULL DEFAULT 1,
    supports_delivery BOOLEAN NOT NULL DEFAULT 1,
    supports_dinein BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_hours (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sun, 1 = Mon ... 6 = Sat
    open_time TEXT NOT NULL,      -- "07:00"
    close_time TEXT NOT NULL      -- "22:00"
);

-- 3. Menu & Customization Hierarchy
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price REAL NOT NULL,
    image_url TEXT NOT NULL,
    is_bestseller BOOLEAN NOT NULL DEFAULT 0,
    is_new BOOLEAN NOT NULL DEFAULT 0,
    temperature_default TEXT DEFAULT 'hot', -- 'hot' or 'iced'
    calories INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS option_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,       -- "Cup Size", "Sweetness", "Milk Choice", "Extra Add-ons"
    min_selectable INTEGER NOT NULL DEFAULT 1,
    max_selectable INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,       -- "Regular", "Large (+₹40)", "Oat Milk (+₹50)"
    price_modifier REAL NOT NULL DEFAULT 0.0,
    is_default BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS item_option_groups (
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    group_id TEXT NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, group_id)
);

CREATE TABLE IF NOT EXISTS store_item_availability (
    store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    PRIMARY KEY (store_id, item_id)
);

-- 4. Dynamic Slots & Capacity
CREATE TABLE IF NOT EXISTS slots (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    slot_date TEXT NOT NULL,  -- "YYYY-MM-DD"
    start_time TEXT NOT NULL, -- "10:00"
    end_time TEXT NOT NULL,   -- "10:15"
    capacity_limit INTEGER NOT NULL DEFAULT 15
);

CREATE TABLE IF NOT EXISTS slot_reservations (
    id TEXT PRIMARY KEY,
    slot_id TEXT NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    drinks_count INTEGER NOT NULL,
    reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS table_bookings (
    id TEXT PRIMARY KEY,
    booking_reference TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    slot_id TEXT REFERENCES slots(id),
    booking_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    party_size INTEGER NOT NULL DEFAULT 2,
    table_type TEXT NOT NULL DEFAULT 'STANDARD',
    special_notes TEXT,
    preorder_items_json TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Persistent Carts
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES stores(id),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    customizations_json TEXT NOT NULL -- Serialized array of option IDs
);

-- 6. Vouchers & Promotional Engine
CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'PERCENTAGE', 'FLAT', 'FREE_ITEM'
    discount_value REAL NOT NULL,
    min_spend REAL NOT NULL DEFAULT 0.0,
    max_discount REAL,
    is_new_user_only BOOLEAN NOT NULL DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    usage_limit_per_user INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_vouchers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voucher_id TEXT NOT NULL REFERENCES vouchers(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESERVED', 'USED', 'EXPIRED'
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders & Financials
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    fulfilment_mode TEXT NOT NULL DEFAULT 'PICKUP', -- 'PICKUP', 'DELIVERY', 'DINEIN'
    slot_id TEXT REFERENCES slots(id),
    pickup_type TEXT NOT NULL DEFAULT 'ASAP',       -- 'ASAP', 'SCHEDULED'
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT', -- 'PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED', 'REFUNDED', 'EXPIRED'
    subtotal REAL NOT NULL,
    discount_amount REAL NOT NULL DEFAULT 0.0,
    tax_amount REAL NOT NULL,                       -- 5% GST
    delivery_fee REAL NOT NULL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    voucher_id TEXT REFERENCES vouchers(id),
    delivery_address_json TEXT,
    pickup_code TEXT NOT NULL,                      -- 4-digit numeric code
    pickup_code_hash TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id),
    item_name TEXT NOT NULL,
    unit_base_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item_options (
    id TEXT PRIMARY KEY,
    order_item_id TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    group_name TEXT NOT NULL,
    option_name TEXT NOT NULL,
    price_modifier REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    provider TEXT NOT NULL,                         -- 'MOCK', 'RAZORPAY'
    transaction_id TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL,                           -- 'PENDING', 'SUCCESS', 'FAILED'
    signature TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    payment_id TEXT NOT NULL REFERENCES payments(id),
    amount REAL NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE REFERENCES orders(id),
    invoice_number TEXT NOT NULL UNIQUE,
    gstin_number TEXT NOT NULL DEFAULT '29AABCU9603R1ZM',
    cgst_rate REAL NOT NULL DEFAULT 0.025,
    cgst_amount REAL NOT NULL,
    sgst_rate REAL NOT NULL DEFAULT 0.025,
    sgst_amount REAL NOT NULL,
    total_tax REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Operations, Loyalty & Auditing
CREATE TABLE IF NOT EXISTS staff_users (
    id TEXT PRIMARY KEY,
    store_id TEXT REFERENCES stores(id),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'BARISTA', -- 'BARISTA', 'STORE_MANAGER', 'ADMIN'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    order_id TEXT REFERENCES orders(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    order_id TEXT REFERENCES orders(id),
    points INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- 'ORDER_EARN', 'TIER_BONUS', 'REDEMPTION'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_user_id TEXT NOT NULL REFERENCES users(id),
    referred_user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'QUALIFIED', 'REWARDED'
    reward_voucher_id TEXT REFERENCES vouchers(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_type TEXT NOT NULL, -- 'USER', 'STAFF', 'SYSTEM'
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_slot_reservations_slot ON slot_reservations(slot_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user ON user_vouchers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone ON otp_requests(phone);
