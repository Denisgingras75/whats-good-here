-- Coop de Ville - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Coop de Ville dishes first to avoid duplicates

-- Delete old Coop de Ville dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville');

-- Insert complete menu (54 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Raw Bar
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Island Littlenecks', 'seafood', 'Raw Bar', 12.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Jumbo Shrimp Cocktail', 'seafood', 'Raw Bar', 21.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Local Oysters', 'seafood', 'Raw Bar', 22.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Shuck Shack Sampler', 'seafood', 'Raw Bar', 20.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'OB Harbor Sampler', 'seafood', 'Raw Bar', 45.00),
-- Appetizers
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder', 'chowder', 'Appetizers', 10.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Stuffed Quahogs', 'apps', 'Appetizers', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Peel ''n'' Eat Shrimp', 'seafood', 'Appetizers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'LJ''s Famous Fried Pickles', 'apps', 'Appetizers', 12.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken', 'apps', 'Appetizers', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp', 'apps', 'Appetizers', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Local Hand-dug Steamers', 'clams', 'Appetizers', 32.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coconut Shrimp', 'apps', 'Appetizers', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Maryland Style Crab Cakes', 'seafood', 'Appetizers', 20.00),
-- Wings
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Wings', 'wings', 'Wings', 19.00),
-- Baskets
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Clam Strip Basket', 'clams', 'Baskets', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beer Battered Shrimp Basket', 'seafood', 'Baskets', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Whole Belly Clam Basket', 'clams', 'Baskets', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fresh Sea Scallop Basket', 'seafood', 'Baskets', 26.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken Basket', 'chicken', 'Baskets', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp Basket', 'seafood', 'Baskets', 17.00),
-- Plates
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Clam Strip Plate', 'clams', 'Plates', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beer Battered Shrimp Plate', 'seafood', 'Plates', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Whole Belly Clam Plate', 'clams', 'Plates', 42.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fresh Sea Scallop Plate', 'seafood', 'Plates', 38.00),
-- Fry Station
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Chicken Fingers ''n'' Fries', 'tendys', 'Fry Station', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fish & Chips', 'fish', 'Fry Station', 26.00),
-- Dinner
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Steamed Menemsha Lobster', 'seafood', 'Dinner', NULL),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fisherman''s Platter', 'seafood', 'Dinner', 35.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi', 'seafood', 'Dinner', 30.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coop de Ville''s Famous BBQ Ribs', 'ribs', 'Dinner', 44.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Marinated Steak Tip Dinner', 'steak', 'Dinner', 33.00),
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Shamel''s Famous Pulled Pork BBQ', 'sandwich', 'Sandwiches', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Cod Fish Sandwich', 'fish', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coop Cheese Burger', 'burger', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beyond Burger', 'burger', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Marinated Chicken Breast', 'sandwich', 'Sandwiches', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Lobster Salad Roll', 'lobster roll', 'Sandwiches', 35.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Whole Belly Clam Roll', 'clams', 'Sandwiches', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Scallop Roll', 'seafood', 'Sandwiches', 24.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), '1/4 lb. Pearl Beef Dog', 'sandwich', 'Sandwiches', 13.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Steak Tip Sub', 'sandwich', 'Sandwiches', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi Sandwich', 'fish', 'Sandwiches', 20.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pretty Damn Good Tuna Melt', 'sandwich', 'Sandwiches', 15.00),
-- Taco Station
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pulled Pork Tacos', 'taco', 'Taco Station', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Shrimp Tacos', 'taco', 'Taco Station', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi Tacos', 'taco', 'Taco Station', 19.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Basket of Fries', 'fries', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Basket of Onion Rings', 'fries', 'Sides', 12.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Corn on the Cob', 'sides', 'Sides', 5.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coleslaw', 'sides', 'Sides', 6.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Sauteed Asparagus', 'sides', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Mashed Potatoes', 'sides', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Cornbread', 'sides', 'Sides', 7.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Raw Bar', 'Appetizers', 'Wings', 'Baskets', 'Plates', 'Fry Station', 'Dinner', 'Sandwiches', 'Taco Station', 'Sides']
WHERE name = 'Coop de Ville';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville');

-- Should show 54 dishes
