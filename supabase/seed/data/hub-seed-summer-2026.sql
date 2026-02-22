-- ============================================================
-- HUB SEED: Summer 2026 Events & Specials
-- Memorial Day (May 22) through Labor Day (Sep 7)
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SPECIALS (active deals, no date logic needed)
-- ============================================================

-- Town Bar weekly food specials
INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Monday Mac & Cheese Night', 'Five Cheese Mac $18 · Broccoli Cheddar $20 · Buffalo Chicken $22 · Steak & Cheese $24', 18.00, 'manual'
FROM restaurants WHERE name = 'Town Bar';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Tuesday Taco Night', '3 tacos for $18 — fried fish, shrimp, or chicken. Pairs with Trivia at 7PM.', 18.00, 'manual'
FROM restaurants WHERE name = 'Town Bar';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Wednesday Slider Night', '$3 sliders — Buffalo Chicken, Chicken Parm, Big Mac, Green Goddess, Thai Chili Shrimp.', 3.00, 'manual'
FROM restaurants WHERE name = 'Town Bar';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, '$4 Draft Town Lights', 'Town Lights draft beer, $4 all day every day.', 4.00, 'manual'
FROM restaurants WHERE name = 'Town Bar';

-- Lookout Tavern specials
INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Tuesday Burger Night', 'All burgers $10. Walk-in only.', 10.00, 'manual'
FROM restaurants WHERE name = 'Lookout Tavern';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Sunday Sushi Night', '25% off all sushi items. Chef Tony Ni — voted Best Sushi on the Vineyard.', NULL, 'manual'
FROM restaurants WHERE name = 'Lookout Tavern';

-- Coop de Ville specials
INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Monday Madness Lobster Rolls', 'Lobster rolls every Monday, $27.', 27.00, 'manual'
FROM restaurants WHERE name = 'Coop de Ville';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Tuesday Lobsterfest', 'Steamed lobster with corn, $25 dine-in.', 25.00, 'manual'
FROM restaurants WHERE name = 'Coop de Ville';

INSERT INTO specials (restaurant_id, deal_name, description, price, source)
SELECT id, 'Wednesday BBQ Bash', 'Ribs, BBQ chicken, cornbread, beans, coleslaw. $27/person, $47/two.', 27.00, 'manual'
FROM restaurants WHERE name = 'Coop de Ville';


-- ============================================================
-- EVENTS (individual rows per date, Memorial Day → Labor Day)
-- ============================================================

-- Offshore Ale: Wednesday Live Music (6-8PM)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Live Music Wednesday',
  'Weekly live music at Offshore Ale. Local artists rotate — Mike Benjamin, Sean McMahon, and more.',
  d::date,
  '18:00'::time,
  '20:00'::time,
  'live_music',
  'weekly',
  3,
  'manual'
FROM restaurants r, generate_series('2026-05-22'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Offshore Ale Company' AND EXTRACT(dow FROM d) = 3;

-- Offshore Ale: Thursday Live Music — Johnny Hoy (6:30-8:30PM)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Johnny Hoy & Delanie Pickering',
  'Thursday night live music at Offshore Ale. Blues, swing, and island vibes.',
  d::date,
  '18:30'::time,
  '20:30'::time,
  'live_music',
  'weekly',
  4,
  'manual'
FROM restaurants r, generate_series('2026-05-22'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Offshore Ale Company' AND EXTRACT(dow FROM d) = 4;

-- Town Bar: Tuesday Trivia (7PM)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Trivia Night',
  'Hosted by DJ Dyno Mike. Taco specials while you play — 3 for $18.',
  d::date,
  '19:00'::time,
  NULL,
  'trivia',
  'weekly',
  2,
  'manual'
FROM restaurants r, generate_series('2026-05-22'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Town Bar' AND EXTRACT(dow FROM d) = 2;

-- Noman's: Thursday Bingo (5-8PM)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Bingo Night',
  'Bingo with Jarrett Campbell + DJ Rockwell. It''s fun. We promise.',
  d::date,
  '17:00'::time,
  '20:00'::time,
  'other',
  'weekly',
  4,
  'manual'
FROM restaurants r, generate_series('2026-05-22'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Noman''s' AND EXTRACT(dow FROM d) = 4;

-- Noman's: Friday — Free Style Fridays (DJ, 6-9:30PM)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Free Style Fridays',
  'DJ SMOOTH B on the decks. Dance party, rain or shine. Free shuttle from OB Steamship.',
  d::date,
  '18:00'::time,
  '21:30'::time,
  'other',
  'weekly',
  5,
  'manual'
FROM restaurants r, generate_series('2026-05-22'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Noman''s' AND EXTRACT(dow FROM d) = 5;

-- Noman's: Sunday — Football Sundays (1-7PM, starts September)
INSERT INTO events (restaurant_id, event_name, description, event_date, start_time, end_time, event_type, recurring_pattern, recurring_day_of_week, source)
SELECT
  r.id,
  'Football Sundays',
  'Big screen coverage. Pitcher specials and wings.',
  d::date,
  '13:00'::time,
  '19:00'::time,
  'other',
  'weekly',
  0,
  'manual'
FROM restaurants r, generate_series('2026-09-06'::date, '2026-09-07'::date, '1 day'::interval) d
WHERE r.name = 'Noman''s' AND EXTRACT(dow FROM d) = 0;


-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Events seeded:' AS label, COUNT(*) AS count FROM events WHERE source = 'manual';
SELECT 'Specials seeded:' AS label, COUNT(*) AS count FROM specials WHERE source = 'manual';
SELECT event_name, event_date, start_time, r.name AS restaurant
FROM events e JOIN restaurants r ON r.id = e.restaurant_id
WHERE e.event_date >= CURRENT_DATE
ORDER BY e.event_date ASC
LIMIT 20;
