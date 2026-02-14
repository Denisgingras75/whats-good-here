-- 9 Craft Kitchen and Bar - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing 9 Craft Kitchen and Bar dishes first to avoid duplicates

-- Delete old 9 Craft Kitchen and Bar dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar');

-- Insert complete menu (46 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- SALADS & SOUPS
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'House Caesar', 'salad', 'SALADS & SOUPS', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Olive Oil Poached Niçoise Salad', 'salad', 'SALADS & SOUPS', 24.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Strawberry Fields', 'salad', 'SALADS & SOUPS', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Arcadia Green Salad', 'salad', 'SALADS & SOUPS', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Warm Spinach Salad', 'salad', 'SALADS & SOUPS', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Roasted Cauliflower Salad', 'salad', 'SALADS & SOUPS', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chowder', 'chowder', 'SALADS & SOUPS', 14.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Smoked Tomato Bisque', 'soup', 'SALADS & SOUPS', 14.00),
-- SMALLER & SHAREABLE
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon Deviled Eggs', 'apps', 'SMALLER & SHAREABLE', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Fried Chicken Bao Bun', 'apps', 'SMALLER & SHAREABLE', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Herbed Ricotta Cheese', 'apps', 'SMALLER & SHAREABLE', 13.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Mussels Puttanesca', 'apps', 'SMALLER & SHAREABLE', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Spicy Tuna Lettuce Wraps', 'apps', 'SMALLER & SHAREABLE', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Tostadas', 'apps', 'SMALLER & SHAREABLE', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Sesame Chicken Bites', 'apps', 'SMALLER & SHAREABLE', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Corn & Cheddar Fritters', 'apps', 'SMALLER & SHAREABLE', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Oak Smoked Pork Belly', 'pork', 'SMALLER & SHAREABLE', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Baked Oysters', 'apps', 'SMALLER & SHAREABLE', 20.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Foie Gras Sausage', 'apps', 'SMALLER & SHAREABLE', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Bacon Lollipop Bouquet', 'apps', 'SMALLER & SHAREABLE', 16.00),
-- PASTAS & RISOTTO
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lamb Ragout Rigatoni', 'pasta', 'PASTAS & RISOTTO', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Pappardelle Bourguignon', 'pasta', 'PASTAS & RISOTTO', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Crawfish Risotto', 'pasta', 'PASTAS & RISOTTO', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Parmesan Koginut Squash Risotto', 'pasta', 'PASTAS & RISOTTO', 34.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Cast-Iron Baked Gnocchi', 'pasta', 'PASTAS & RISOTTO', 29.00),
-- ENTREES
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Scottish Salmon', 'seafood', 'ENTREES', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Miso Cod', 'seafood', 'ENTREES', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon', 'steak', 'ENTREES', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Tagine', 'chicken', 'ENTREES', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Swordfish Steak', 'seafood', 'ENTREES', 39.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Dry-Aged Pork Chop', 'pork', 'ENTREES', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Wagyu Skirt Steak', 'steak', 'ENTREES', 56.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'The Burger', 'burger', 'ENTREES', 26.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Slow Braised Short Rib', 'ribs', 'ENTREES', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Thigh Schnitzel', 'chicken', 'ENTREES', 27.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Boneless Prime Ribeye', 'steak', 'ENTREES', 69.00),
-- SIDES
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'French Fries', 'fries', 'SIDES', 12.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Moroccan Rice', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Forbidden Black Rice', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Thyme Potatoes', 'sides', 'SIDES', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Soba Noodles', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Roasted Turmeric Cauliflower', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Roasted Bourbon Butter Carrots', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Asian Green Beans', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Scallion Pancakes', 'sides', 'SIDES', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Koginut', 'sides', 'SIDES', 15.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['LOCAL OYSTERS', 'SALADS & SOUPS', 'SMALLER & SHAREABLE', 'PASTAS & RISOTTO', 'ENTREES', 'SIDES']
WHERE name = '9 Craft Kitchen and Bar';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar');

-- Should show 46 dishes
