-- -------------------------------------------------------------
-- BREW & BLOOM: COMPREHENSIVE SEED DATA
-- -------------------------------------------------------------

-- 1. Stores
INSERT OR REPLACE INTO stores (id, name, address, latitude, longitude, status, avg_prep_time_minutes, supports_pickup, supports_delivery, supports_dinein)
VALUES
('store_indiranagar', 'Brew & Bloom — Indiranagar Flagship', '742, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038', 12.971891, 77.641154, 'OPEN', 8, 1, 1, 1),
('store_koramangala', 'Brew & Bloom — Koramangala Greenhouse', '12, 80 Feet Road, 4th Block, Koramangala, Bengaluru, KA 560034', 12.935192, 77.624481, 'OPEN', 10, 1, 1, 0),
('store_mgroad', 'Brew & Bloom — The Old Roastery Pier', '45 MG Road, Near Trinity Metro Station, Bengaluru, KA 560001', 12.974512, 77.618021, 'OPEN', 6, 1, 1, 1);

-- Store Hours (7 days a week 07:00 to 22:30)
INSERT OR REPLACE INTO store_hours (id, store_id, day_of_week, open_time, close_time)
VALUES
('sh_ind_0', 'store_indiranagar', 0, '07:00', '22:30'),
('sh_ind_1', 'store_indiranagar', 1, '07:00', '22:30'),
('sh_ind_2', 'store_indiranagar', 2, '07:00', '22:30'),
('sh_ind_3', 'store_indiranagar', 3, '07:00', '22:30'),
('sh_ind_4', 'store_indiranagar', 4, '07:00', '22:30'),
('sh_ind_5', 'store_indiranagar', 5, '07:00', '23:00'),
('sh_ind_6', 'store_indiranagar', 6, '07:00', '23:00'),
('sh_kor_0', 'store_koramangala', 0, '07:30', '22:00'),
('sh_kor_1', 'store_koramangala', 1, '07:30', '22:00'),
('sh_kor_2', 'store_koramangala', 2, '07:30', '22:00'),
('sh_kor_3', 'store_koramangala', 3, '07:30', '22:00'),
('sh_kor_4', 'store_koramangala', 4, '07:30', '22:00'),
('sh_kor_5', 'store_koramangala', 5, '07:30', '22:30'),
('sh_kor_6', 'store_koramangala', 6, '07:30', '22:30'),
('sh_mgr_0', 'store_mgroad', 0, '06:30', '23:00'),
('sh_mgr_1', 'store_mgroad', 1, '06:30', '23:00'),
('sh_mgr_2', 'store_mgroad', 2, '06:30', '23:00'),
('sh_mgr_3', 'store_mgroad', 3, '06:30', '23:00'),
('sh_mgr_4', 'store_mgroad', 4, '06:30', '23:00'),
('sh_mgr_5', 'store_mgroad', 5, '06:30', '23:30'),
('sh_mgr_6', 'store_mgroad', 6, '06:30', '23:30');

-- 2. Categories
INSERT OR REPLACE INTO categories (id, name, slug, sort_order, image_url)
VALUES
('cat_espresso', 'Espresso & Velvet Lattes', 'espresso-lattes', 1, '/images/types/latte.jpg'),
('cat_coldbrew', 'Signature Cold Brews', 'cold-brews', 2, '/images/types/cold-brew.jpg'),
('cat_pour_over', 'Single-Origin Pour Over', 'pour-over', 3, '/images/types/chemex.jpg'),
('cat_teas', 'Artisan Teas & Botanicals', 'artisan-teas', 4, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'),
('cat_bakery', 'Hearth Bakery & Treats', 'hearth-bakery', 5, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80');

-- 3. Option Groups
INSERT OR REPLACE INTO option_groups (id, name, min_selectable, max_selectable, is_required)
VALUES
('og_size', 'Cup Size', 1, 1, 1),
('og_temp', 'Temperature', 1, 1, 1),
('og_sweetness', 'Sweetness Level', 1, 1, 1),
('og_milk', 'Milk Selection', 1, 1, 1),
('og_extras', 'Artisan Add-ons', 0, 4, 0);

-- Options
INSERT OR REPLACE INTO options (id, group_id, name, price_modifier, is_default)
VALUES
-- Sizes
('opt_size_reg', 'og_size', 'Regular (12oz)', 0.0, 1),
('opt_size_large', 'og_size', 'Large (16oz)', 40.0, 0),
('opt_size_venti', 'og_size', 'Grand Reserve (20oz)', 75.0, 0),

-- Temperature
('opt_temp_hot', 'og_temp', 'Hot & Steamy', 0.0, 1),
('opt_temp_iced', 'og_temp', 'Chilled over Ice', 15.0, 0),

-- Sweetness
('opt_sw_100', 'og_sweetness', 'Standard Sweetness (100%)', 0.0, 1),
('opt_sw_70', 'og_sweetness', 'Subtle Touch (70%)', 0.0, 0),
('opt_sw_30', 'og_sweetness', 'Gentle Whisper (30%)', 0.0, 0),
('opt_sw_0', 'og_sweetness', 'Unsweetened (0%)', 0.0, 0),

-- Milk
('opt_milk_whole', 'og_milk', 'Whole Farm Milk', 0.0, 1),
('opt_milk_oat', 'og_milk', 'Oatly Barista Oat Milk', 45.0, 0),
('opt_milk_almond', 'og_milk', 'Organic Almond Milk', 45.0, 0),
('opt_milk_soy', 'og_milk', 'Creamy Soy Milk', 35.0, 0),
('opt_milk_none', 'og_milk', 'Black / No Milk', 0.0, 0),

-- Extras
('opt_ext_shot', 'og_extras', 'Extra Single-Origin Espresso Shot', 50.0, 0),
('opt_ext_vanilla', 'og_extras', 'Madagascar Vanilla Bean Syrup', 35.0, 0),
('opt_ext_caramel', 'og_extras', 'Salted Fleur de Sel Caramel Drizzle', 30.0, 0),
('opt_ext_coldfoam', 'og_extras', 'Silky Vanilla Sweet Cold Foam', 55.0, 0);

-- 4. Items (20 items across 5 categories)
INSERT OR REPLACE INTO items (id, category_id, name, slug, description, base_price, image_url, is_bestseller, is_new, temperature_default, calories)
VALUES
-- Espresso & Lattes
('item_vanilla_latte', 'cat_espresso', 'Vanilla Bean Velvet Latte', 'vanilla-bean-velvet-latte', 'Double shot of single-origin espresso blended with micro-foamed milk and Madagascar vanilla bean syrup.', 295, '/images/types/latte.jpg', 1, 0, 'hot', 190),
('item_classic_espresso', 'cat_espresso', 'Classic Espresso Intenso', 'classic-espresso-intenso', 'Rich, concentrated double shot crowned with a dense, tiger-striped hazelnut crema.', 195, '/images/types/espresso.jpg', 0, 0, 'hot', 5),
('item_cappuccino', 'cat_espresso', 'Signature Cappuccino', 'signature-cappuccino', 'Intense espresso, velvety steamed milk, and a pillowy dome of glossy milk foam dusted with Dutch cocoa.', 260, '/images/types/cappuccino.jpg', 1, 0, 'hot', 140),
('item_flat_white', 'cat_espresso', 'Artisan Flat White', 'artisan-flat-white', 'A double ristretto extraction poured under a thin microfoam layer with feather-light latte art.', 275, '/images/types/flat-white.jpg', 0, 0, 'hot', 120),
('item_spanish_latte', 'cat_espresso', 'Dulce Spanish Latte', 'dulce-spanish-latte', 'Espresso over condensed milk and textured whole milk with a dash of Sri Lankan cinnamon.', 310, '/images/types/latte.jpg', 1, 1, 'hot', 240),

-- Cold Brews
('item_classic_coldbrew', 'cat_coldbrew', '24-Hour Kyoto Cold Brew', 'kyoto-cold-brew', 'Steeped for 24 hours in ice-cold mountain spring water for a silky, naturally sweet dark chocolate finish.', 250, '/images/types/cold-brew.jpg', 1, 0, 'iced', 10),
('item_nitro_coldbrew', 'cat_coldbrew', 'Cascara Nitro Cold Brew', 'nitro-cold-brew', 'Infused with nitrogen for a cascading velvet head and creamy Guinness-like mouthfeel with zero dairy.', 290, '/images/types/cold-brew.jpg', 1, 1, 'iced', 15),
('item_coconut_coldbrew', 'cat_coldbrew', 'Raw Coconut Cloud Cold Brew', 'raw-coconut-cold-brew', 'Cold brew topped with fresh tender coconut water and a salted coconut milk cloud.', 320, '/images/types/cold-brew.jpg', 0, 1, 'iced', 110),
('item_tonic_coldbrew', 'cat_coldbrew', 'Sparkling Yuzu Espresso Tonic', 'espresso-tonic', 'Fever-Tree Mediterranean tonic water layered with chilled espresso and candied Japanese yuzu.', 280, '/images/types/cold-brew.jpg', 0, 0, 'iced', 85),

-- Pour Over
('item_chemex_ethiopia', 'cat_pour_over', 'Ethiopia Yirgacheffe Chemex', 'ethiopia-chemex', 'Notes of jasmine blossoms, bergamot, and sweet Meyer lemon with tea-like clarity.', 340, '/images/types/chemex.jpg', 1, 0, 'hot', 0),
('item_aeropress_colombia', 'cat_pour_over', 'Colombia Huila AeroPress', 'colombia-aeropress', 'Clean, full-bodied cup with juicy red apple, dark honey, and roasted hazelnut.', 310, '/images/types/aeropress.jpg', 0, 0, 'hot', 0),
('item_v60_panama', 'cat_pour_over', 'Panama Geisha Reserve V60', 'panama-geisha-v60', 'Award-winning microlot offering complex floral notes of peach nectar and wild jasmine.', 480, '/images/types/chemex.jpg', 0, 1, 'hot', 0),

-- Artisan Teas
('item_matcha_latte', 'cat_teas', 'Ceremonial Uji Matcha Latte', 'matcha-latte', 'Stone-ground first-harvest green tea from Kyoto, whisked with oat milk and agave nectar.', 320, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', 1, 0, 'hot', 150),
('item_masala_chai', 'cat_teas', 'Heritage Spiced Golden Chai', 'heritage-chai', 'Single-estate Assam black tea slow-simmered with crushed green cardamom, ginger, and clover honey.', 210, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', 0, 0, 'hot', 130),
('item_hibiscus_refresher', 'cat_teas', 'Wild Hibiscus Rose Refresher', 'hibiscus-refresher', 'Tart Egyptian hibiscus petals brewed with dried Persian rose buds and fresh mint leaves over crushed ice.', 240, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', 0, 1, 'iced', 70),

-- Hearth Bakery
('item_butter_croissant', 'cat_bakery', 'French Butter Croissant', 'butter-croissant', 'Layers of European cultured butter baked to golden flakiness with a honeyed honeycomb interior.', 190, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 1, 0, 'hot', 280),
('item_pain_au_chocolat', 'cat_bakery', 'Dark Valrhona Pain au Chocolat', 'pain-au-chocolat', 'Folded pastry enveloping two batons of 70% dark Valrhona French chocolate.', 230, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80', 0, 0, 'hot', 320),
('item_almond_frangipane', 'cat_bakery', 'Toasted Almond Frangipane Tart', 'almond-tart', 'Buttery pastry filled with sweet almond cream, crowned with toasted sliced almonds and powdered sugar.', 260, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 0, 0, 'hot', 340),
('item_banana_bread', 'cat_bakery', 'Toasted Espresso Walnut Bread', 'banana-walnut-bread', 'Warm spiced banana slice infused with espresso syrup, toasted California walnuts, and whipped honey butter.', 210, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80', 0, 0, 'hot', 260),
('item_cinnamon_roll', 'cat_bakery', 'Warm Cardamom & Brown Sugar Brioche', 'cardamom-brioche', 'Soft Swedish-style cardamom twist topped with pearl sugar and warm vanilla glaze.', 240, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80', 1, 0, 'hot', 360),

-- Flagship Menu Series Items
('fl-coconut-latte', 'cat_espresso', 'Coconut Latte', 'coconut-latte', 'Brew & Bloom flagship signature. Pure cold-pressed coconut milk paired with dark-roasted espresso for a silky, tropical finish.', 260, '/images/menu/drinks/coconut-latte.jpg', 1, 0, 'iced', 145),
('fl-velvet-latte', 'cat_espresso', 'Velvet Latte', 'velvet-latte', 'Engineered for supreme smoothness using micro-filtrated velvet milk that coats the palate with luxurious vanilla-butter notes.', 250, '/images/menu/drinks/velvet-latte.jpg', 1, 0, 'hot', 160),
('fl-little-butter-latte', 'cat_espresso', 'Little Butter Latte', 'little-butter-latte', 'Brown butter caramelized aromatics melted into hot steamed milk and double espresso shots with rich golden nuances.', 270, '/images/menu/drinks/little-butter-latte.jpg', 0, 1, 'hot', 185),
('fl-creamy-dreamy-latte', 'cat_espresso', 'Creamy Dreamy Latte', 'creamy-dreamy-latte', 'Fluffy cloud-like foam layered over aromatic double shot espresso for an ethereal, light yet satisfying morning sip.', 260, '/images/menu/drinks/creamy-dreamy-latte.jpg', 0, 0, 'hot', 140),
('fl-vanilla-creamy-latte', 'cat_espresso', 'Vanilla Flavored Creamy Latte', 'vanilla-creamy-latte', 'Infused with natural Madagascar bourbon vanilla syrup and silky steamed whole milk.', 275, '/images/menu/drinks/vanilla-creamy-latte.jpg', 0, 0, 'hot', 175),
('fl-coconut-velvet-latte', 'cat_espresso', 'Coconut Velvet Latte', 'coconut-velvet-latte', 'The ultimate dual-texture harmony: rich cold-pressed coconut milk blended with micro-velvet cream and dark espresso.', 285, '/images/menu/drinks/coconut-velvet-latte.jpg', 0, 0, 'iced', 155),

('fl-americano', 'cat_espresso', 'Americano', 'americano', 'Double espresso pulled with rich golden crema poured over pure mountain spring water. Clean, bold, zero sugar.', 195, '/images/menu/drinks/americano.jpg', 1, 0, 'hot', 10),
('fl-latte', 'cat_espresso', 'Classic Latte', 'classic-latte', 'Harmonious balance of double espresso and silky micro-foamed milk with delicate natural sweetness.', 240, '/images/menu/drinks/classic-latte.jpg', 1, 0, 'hot', 130),
('fl-caramel-macchiato', 'cat_espresso', 'Caramel Macchiato', 'caramel-macchiato', 'Fresh steamed milk stained with intense espresso shots and finished with buttery crosshatch caramel sauce.', 270, '/images/menu/drinks/caramel-macchiato.jpg', 1, 0, 'hot', 190),
('fl-flat-white', 'cat_espresso', 'Flat White', 'flat-white', 'Double ristretto extraction creating higher concentration of sweet espresso oils topped with glossy micro-foam.', 250, '/images/menu/drinks/flat-white.jpg', 0, 0, 'hot', 125),
('fl-caffe-mocha', 'cat_espresso', 'Caffè Mocha', 'caffe-mocha', 'Dutch alkalized cocoa folded into espresso and hot textured milk, crowned with fresh whipped cream and cocoa powder.', 270, '/images/menu/drinks/caffe-mocha.jpg', 0, 0, 'hot', 220),
('fl-extra-strong-americano', 'cat_espresso', 'Extra Strong Americano', 'extra-strong-americano', 'Quad-shot espresso payload for uncompromising morning alertness and robust dark roast character.', 220, '/images/menu/drinks/extra-strong-americano.jpg', 0, 0, 'iced', 15),

('fl-orange-americano', 'cat_coldbrew', 'Orange Americano', 'orange-americano', 'The cult favorite. 100% freshly pressed orange juice with sunny pulp layered beneath chilled bold espresso shots.', 280, '/images/menu/drinks/orange-americano.jpg', 1, 0, 'iced', 95),
('fl-pomelo-americano', 'cat_coldbrew', 'Pomelo Americano', 'pomelo-americano', 'Ruby grapefruit and fragrant Asian pomelo juice meeting chilled Arabica espresso for an exotic, bittersweet spark.', 280, '/images/menu/drinks/pomelo-americano.jpg', 1, 0, 'iced', 90),
('fl-apple-fizzy-americano', 'cat_coldbrew', 'Apple Fizzy Americano', 'apple-fizzy-americano', 'Crisp green Fuji apple nectar paired with lively sparkling soda bubbles and layered with dark roast espresso.', 290, '/images/menu/drinks/apple-fizzy-americano.jpg', 0, 0, 'iced', 85),
('fl-grape-fizzy-americano', 'cat_coldbrew', 'Grape Fizzy Americano', 'grape-fizzy-americano', 'Deep purple Concord grape juice and fine effervescence delivering vibrant fruity tartness with coffee punch.', 290, '/images/menu/drinks/grape-fizzy-americano.jpg', 0, 0, 'iced', 90),

('fl-matcha-latte', 'cat_teas', 'Brew & Bloom Matcha Latte', 'matcha-latte', 'Vibrant emerald stone-ground Uji matcha whisked to order and blended with sweet, micro-foamed whole milk.', 290, '/images/menu/drinks/matcha-latte.jpg', 1, 0, 'hot', 150),
('fl-matcha-frappe', 'cat_teas', 'Matcha Cloud Frappe', 'matcha-frappe', 'Ice-blended matcha delight crowned with an airy swirl of whipped vanilla cream and powdered green tea dusting.', 330, '/images/menu/drinks/matcha-frappe.jpg', 1, 0, 'iced', 230),
('fl-matcha-oat-latte', 'cat_teas', 'Matcha Oat Latte', 'matcha-oat-latte', '100% plant-based luxury. Earthy stone-ground green tea whisked into creamy barista-grade oat milk.', 310, '/images/menu/drinks/matcha-oat-latte.jpg', 0, 0, 'hot', 135),
('fl-coconut-matcha-latte', 'cat_teas', 'Coconut Matcha Latte', 'coconut-matcha-latte', 'Tropical coconut creaminess intertwining with the subtle vegetal bitterness of ceremonial matcha.', 310, '/images/menu/drinks/coconut-matcha-latte.jpg', 0, 0, 'iced', 145),

('fl-yirgacheffe-americano', 'cat_pour_over', 'Yirgacheffe SOE Americano', 'yirgacheffe-americano', 'Pure expression of Ethiopian terroir. Crystal iced extraction showcasing jasmine blossoms, lemon zest, and white peach finish.', 260, '/images/menu/drinks/yirgacheffe-americano.jpg', 1, 0, 'iced', 10),
('fl-yirgacheffe-flat-white', 'cat_pour_over', 'Yirgacheffe SOE Flat White', 'yirgacheffe-flat-white', 'Delicate floral single-origin espresso blended with silky micro-foam, tasting like lemon curd and toasted brioche.', 295, '/images/menu/drinks/yirgacheffe-flat-white.jpg', 1, 0, 'hot', 135),
('fl-yirgacheffe-latte', 'cat_pour_over', 'Yirgacheffe SOE Latte', 'yirgacheffe-latte', 'Smooth, fragrant specialty latte bringing out sweet bergamot nuances paired with velvety dairy.', 295, '/images/menu/drinks/yirgacheffe-latte.jpg', 0, 0, 'hot', 140);

-- Link Option Groups to Coffee Items
INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_size' FROM items WHERE category_id IN ('cat_espresso', 'cat_coldbrew', 'cat_teas');

INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_temp' FROM items WHERE category_id IN ('cat_espresso', 'cat_coldbrew', 'cat_teas');

INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_sweetness' FROM items WHERE category_id IN ('cat_espresso', 'cat_coldbrew', 'cat_teas');

INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_milk' FROM items WHERE category_id IN ('cat_espresso', 'cat_teas');

INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_extras' FROM items WHERE category_id IN ('cat_espresso', 'cat_coldbrew');

-- Link Bakery Items with warm/serve option
INSERT OR IGNORE INTO option_groups (id, name, min_selectable, max_selectable, is_required)
VALUES ('og_bakery_prep', 'Serving Temperature', 1, 1, 1);
INSERT OR IGNORE INTO options (id, group_id, name, price_modifier, is_default)
VALUES ('opt_bakery_warm', 'og_bakery_prep', 'Warmed & Toasted', 0.0, 1),
       ('opt_bakery_room', 'og_bakery_prep', 'Ambient Temperature', 0.0, 0);
INSERT OR REPLACE INTO item_option_groups (item_id, group_id)
SELECT id, 'og_bakery_prep' FROM items WHERE category_id = 'cat_bakery';

-- Make all items available across all 3 stores
INSERT OR REPLACE INTO store_item_availability (store_id, item_id, is_available)
SELECT s.id, i.id, 1 FROM stores s CROSS JOIN items i;

-- 5. Promotional Vouchers (Luckin Model)
INSERT OR REPLACE INTO vouchers (id, code, title, description, discount_type, discount_value, min_spend, max_discount, is_new_user_only, valid_from, valid_until, usage_limit_per_user)
VALUES
('v_first_cup', 'FIRSTCUP', 'New User First Cup On Us', 'Enjoy up to ₹250 off your first handcrafted drink!', 'FLAT', 250.0, 0.0, 250.0, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1),
('v_luckin_50', 'LUCKIN50', '50% Off Luckin Welcome Pass', '50% discount on order totals above ₹200 (up to ₹150 off)', 'PERCENTAGE', 50.0, 200.0, 150.0, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 3),
('v_brew_100', 'BREW100', 'Flat ₹100 Off Coffee Run', 'Save ₹100 instantly on orders over ₹399', 'FLAT', 100.0, 399.0, 100.0, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 5),
('v_morning_20', 'MORNING20', 'Morning Perk 20% Off', '20% off all orders above ₹150 (up to ₹80)', 'PERCENTAGE', 20.0, 150.0, 80.0, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 10);

-- 6. Demo Users & Staff Accounts
-- Passwords: 'admin123' / 'barista123'
INSERT OR REPLACE INTO staff_users (id, store_id, username, password_hash, role)
VALUES
('staff_admin', NULL, 'admin', 'admin123', 'ADMIN'),
('staff_barista_indira', 'store_indiranagar', 'barista_indira', 'barista123', 'BARISTA'),
('staff_barista_kora', 'store_koramangala', 'barista_kora', 'barista123', 'BARISTA');

-- Seed Demo Customer User (Aarav Sharma) — Password: 'coffee123'
INSERT OR REPLACE INTO users (id, phone, name, email, password_hash, role, referral_code, referred_by_user_id, membership_tier, loyalty_points)
VALUES
('usr_aarav', '+919876543210', 'Aarav Sharma', 'aarav@brewbloom.coffee', 'd33755bb3dc4f119c1515b8266deac20:dbed4d8fbe5f7d34701fea04a3fc95923314e36ee5a88945d90334a4098a6c4ca49e2fe589fbaffcdbfb52390f38c27f691e92ba983704e27625fa2896d030ec', 'CUSTOMER', 'AARAV2026', NULL, 'SILVER', 380);

-- Auto-issue new user voucher to demo customer
INSERT OR REPLACE INTO user_vouchers (id, user_id, voucher_id, status)
VALUES
('uv_aarav_1', 'usr_aarav', 'v_first_cup', 'ACTIVE'),
('uv_aarav_2', 'usr_aarav', 'v_luckin_50', 'ACTIVE');
