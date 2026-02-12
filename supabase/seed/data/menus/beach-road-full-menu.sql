-- Beach Road - Full Menu (2026 Winter)
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Beach Road dishes first to avoid duplicates
-- Source: beachroadmv.com/menus/

-- Delete old Beach Road dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Beach Road');

-- Insert complete menu (26 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Raw + Chilled
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Island Oysters', 'seafood', 'Raw + Chilled', 22.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Littlenecks', 'seafood', 'Raw + Chilled', 22.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Shrimp Cocktail', 'seafood', 'Raw + Chilled', 20.00),
-- Snack
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Daily Bread', 'apps', 'Snack', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Cast Iron Cornbread', 'apps', 'Snack', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fig Toast', 'apps', 'Snack', 15.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Tempura Shrimp', 'apps', 'Snack', 20.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Blistered Shishitos', 'apps', 'Snack', 14.00),
-- Start
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'New England Clam Chowder', 'chowder', 'Start', 17.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Winter Salad', 'salad', 'Start', 18.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Caesar Salad', 'salad', 'Start', 19.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Beet Roulade', 'apps', 'Start', 16.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Charred Savoy Cabbage', 'apps', 'Start', 19.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Lamb Chops', 'apps', 'Start', 26.00),
-- Main
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Sugar Pumpkin & Mushroom Mafaldine', 'pasta', 'Main', 42.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Bouillabaisse', 'seafood', 'Main', 50.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Atlantic Halibut', 'fish', 'Main', 48.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Berkshire Pork Chop', 'entree', 'Main', 48.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Braised Short Rib', 'entree', 'Main', 47.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Hot Dog', 'sandwich', 'Main', 24.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fried Chicken', 'fried chicken', 'Main', 38.00),
-- Side
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Roasted Baby Carrots', 'fries', 'Side', 16.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Brussels Sprouts', 'fries', 'Side', 16.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fries', 'fries', 'Side', 12.00),
-- Sweet
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Tres Leches Mocha Cake', 'dessert', 'Sweet', 14.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Butterscotch Whiskey Pudding', 'dessert', 'Sweet', 14.00);

-- Update menu_section_order to match actual menu
UPDATE restaurants
SET menu_section_order = ARRAY['Raw + Chilled', 'Snack', 'Start', 'Main', 'Side', 'Sweet']
WHERE name = 'Beach Road';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Beach Road');

-- Should show 26 dishes
