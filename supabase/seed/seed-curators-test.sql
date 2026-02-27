-- =============================================
-- Test Curator Seed Data
-- =============================================
-- Run in Supabase SQL Editor after running 20260227_curators.sql migration
-- Replace dish UUIDs with real IDs from your database
--
-- To find dish IDs:
-- SELECT d.id, d.name, d.category, r.name as restaurant
-- FROM dishes d JOIN restaurants r ON r.id = d.restaurant_id
-- ORDER BY d.avg_rating DESC NULLS LAST LIMIT 50;

-- 1. Insert test curators
INSERT INTO curators (id, name, bio, specialty, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Mitchell', 'MV local, 15 years. Knows every kitchen on-island.', 'food', 1),
  ('22222222-2222-2222-2222-222222222222', 'Jake Torres', 'Bartender at The Wharf. Cocktail obsessive.', 'cocktails', 2),
  ('33333333-3333-3333-3333-333333333333', 'Tom Ellis', 'Wine buyer, sommelier. 20 years in the industry.', 'wine', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert curator picks (REPLACE dish UUIDs with real ones)
-- Example format — uncomment and fill in real dish IDs:
--
-- INSERT INTO curator_picks (curator_id, dish_id, rank_position, blurb, list_category) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'REAL-DISH-UUID-HERE', 1, 'Best lobster roll I''ve ever had. Get the drawn butter.', NULL),
--   ('11111111-1111-1111-1111-111111111111', 'REAL-DISH-UUID-HERE', 2, 'The chowder that converts chowder skeptics.', NULL),
--   ('11111111-1111-1111-1111-111111111111', 'REAL-DISH-UUID-HERE', 3, 'Order the special, trust me.', NULL);
--
-- For category-specific lists, set list_category:
-- INSERT INTO curator_picks (curator_id, dish_id, rank_position, blurb, list_category) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'REAL-DISH-UUID-HERE', 1, 'Best burger on the island, no contest.', 'burger');
