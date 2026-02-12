-- Bangkok Cuisine - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Bangkok Cuisine dishes first to avoid duplicates
-- Source: https://fromtherestaurant.com/bangkok-thai-cuisine-ma/menu/67-Circuit-Ave/

-- Delete old Bangkok Cuisine dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine');

-- Insert complete menu (75 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Appetizers
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Crispy Rolls', 'apps', 'Appetizers', 11.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Crab Rolls', 'apps', 'Appetizers', 11.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Fresh Rolls', 'apps', 'Appetizers', 12.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Chicken Satay', 'apps', 'Appetizers', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Tofu Triangles', 'apps', 'Appetizers', 11.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Dumplings', 'apps', 'Appetizers', 12.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Chicken Wings', 'wings', 'Appetizers', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pinky in the Blanket', 'apps', 'Appetizers', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Shu Mai', 'apps', 'Appetizers', 12.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Fish Cake', 'apps', 'Appetizers', 13.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Shrimp Tempura', 'apps', 'Appetizers', 17.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Chicken Teriyaki', 'apps', 'Appetizers', 16.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Steamed Mussels', 'apps', 'Appetizers', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Platter', 'apps', 'Appetizers', 22.95),
-- Soups
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Tom Yum Kung', 'soup', 'Soups', 10.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Tom Ka Kai', 'soup', 'Soups', 10.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Wonton Soup', 'soup', 'Soups', 10.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Veggie Soup', 'soup', 'Soups', 8.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Noodle Soup', 'soup', 'Soups', 19.95),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Bangkok Salad', 'salad', 'Salads', 12.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Chicken Salad', 'salad', 'Salads', 16.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Yam Nua', 'salad', 'Salads', 18.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Yum Kung', 'salad', 'Salads', 19.95),
-- Entrees
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Ginger Mix', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Broccoli Medley', 'asian', 'Entrees', 18.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Snow Pea', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Cashew Nut', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Hot Basil', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Spicy Bamboo', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Spicy Thai Eggplant', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Spicy Crispy Bean', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Sweet & Sour', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad Karie', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Veggie Delight', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Steamed Veggies', 'asian', 'Entrees', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Bangkok Garlic', 'asian', 'Entrees', 23.95),
-- Noodle Dishes
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad Thai', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Thai Spaghetti', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad Kee Mao', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Mama Kee Mao', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Lad Nar', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad See You', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Mee Siam', 'asian', 'Noodle Dishes', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad Voonsen', 'asian', 'Noodle Dishes', 20.95),
-- Fried Rice
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Bangkok Fried Rice', 'asian', 'Fried Rice', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pineapple Fried Rice', 'asian', 'Fried Rice', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Crabmeat Fried Rice', 'asian', 'Fried Rice', 26.95),
-- Bangkok Curry
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Green Curry', 'asian', 'Bangkok Curry', 21.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Red Curry', 'asian', 'Bangkok Curry', 21.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Yellow Curry', 'asian', 'Bangkok Curry', 21.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Masaman Curry', 'asian', 'Bangkok Curry', 21.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Panang Curry', 'asian', 'Bangkok Curry', 21.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Mango Curry', 'asian', 'Bangkok Curry', 26.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Shrimp Choo Chee', 'seafood', 'Bangkok Curry', 27.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Seafood Curry', 'seafood', 'Bangkok Curry', 27.95),
-- House Specials
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Bangkok Duck', 'asian', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Basil Duck', 'asian', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Choo Chee Duck', 'asian', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Crispy Whole Fish', 'fish', 'House Specials', 45.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Salmon Tamarind', 'fish', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Salmon Curry', 'fish', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Char-Grilled Salmon', 'fish', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Stuffed Salmon', 'fish', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Hot Pot Mix', 'seafood', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Stir-Fried Shellfish', 'seafood', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Seafood Ginger', 'seafood', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Soft-Shell Crab', 'seafood', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Stir-Fried Soft Shell Crab', 'seafood', 'House Specials', 35.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Chicken Himmapan', 'chicken', 'House Specials', 35.95),
-- Thai Desserts
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Fried Banana with Ice Cream', 'dessert', 'Thai Desserts', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Ginger Ice Cream', 'dessert', 'Thai Desserts', 9.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Coconut Ice Cream', 'dessert', 'Thai Desserts', 9.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Thai Coconut Custard', 'dessert', 'Thai Desserts', 12.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Fried Ice Cream', 'dessert', 'Thai Desserts', 15.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Sticky Rice with Sweet Mango', 'dessert', 'Thai Desserts', 15.95);

-- Update menu_section_order to match actual menu
UPDATE restaurants
SET menu_section_order = ARRAY['Appetizers', 'Soups', 'Salads', 'Entrees', 'Noodle Dishes', 'Fried Rice', 'Bangkok Curry', 'House Specials', 'Thai Desserts']
WHERE name = 'Bangkok Cuisine';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine');

-- Should show 75 dishes
