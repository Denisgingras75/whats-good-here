-- ArtCliff Diner - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing ArtCliff Diner dishes first to avoid duplicates
-- Source: Toast ordering system

-- Delete old ArtCliff Diner dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'ArtCliff Diner');

-- Insert complete menu (135 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Bacon Starter', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Green Eggs and Ham', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Hey Now', 'breakfast sandwich', 'Breakfast Sandwiches', 12.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Hot Stuff', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Morning Starter', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Old Faithful', 'breakfast sandwich', 'Breakfast Sandwiches', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Sausage Starter', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lunch BLT', 'sandwich', 'Breakfast Sandwiches', 17.00),
-- Frittatas
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), '3-Egg Omelettes', 'breakfast', 'Frittatas', 18.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), '5-Corners', 'breakfast', 'Frittatas', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Beach Road', 'breakfast', 'Frittatas', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cowboy Up', 'breakfast', 'Frittatas', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Farmers Market', 'breakfast', 'Frittatas', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Kookli', 'breakfast', 'Frittatas', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Mr. T.', 'breakfast', 'Frittatas', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Upper East Side', 'breakfast', 'Frittatas', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Frittata', 'breakfast', 'Frittatas', 19.00),
-- Crepes
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Avo-Green Chili Crepe', 'breakfast', 'Crepes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cheddar and Bacon Crepe', 'breakfast', 'Crepes', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Choco Sweet and Salty Crepe', 'breakfast', 'Crepes', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Ginger Sugar and Strawberry Crepe', 'breakfast', 'Crepes', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lemon and Brown Sugar Crepe', 'breakfast', 'Crepes', 10.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Middle East Affair Crepe', 'breakfast', 'Crepes', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Veggie Smash & Fontina Crepe', 'breakfast', 'Crepes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'The Whitefish Caper Crepe', 'breakfast', 'Crepes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Nutella Strawberry Crepe', 'breakfast', 'Crepes', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Crepe', 'breakfast', 'Crepes', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Sweet Crepe', 'breakfast', 'Crepes', 18.00),
-- Pancakes, Waffles & French Toast
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Malted Buttermilk Pancakes', 'breakfast', 'Pancakes, Waffles & French Toast', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Blueberry Pancakes', 'breakfast', 'Pancakes, Waffles & French Toast', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Potato Pancakes', 'breakfast', 'Pancakes, Waffles & French Toast', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Woo-Tang Orange Pecan Pancakes', 'breakfast', 'Pancakes, Waffles & French Toast', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Chocolate Chip Pancake', 'breakfast', 'Pancakes, Waffles & French Toast', 13.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Coconut Banana Pancakes', 'breakfast', 'Pancakes, Waffles & French Toast', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Almond Crusted French Toast', 'breakfast', 'Pancakes, Waffles & French Toast', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'French Toast', 'breakfast', 'Pancakes, Waffles & French Toast', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Waffle', 'breakfast', 'Pancakes, Waffles & French Toast', 11.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Waffle w Fruit', 'breakfast', 'Pancakes, Waffles & French Toast', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special French Toast', 'breakfast', 'Pancakes, Waffles & French Toast', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Toad in the Hole', 'breakfast', 'Pancakes, Waffles & French Toast', 16.95),
-- Cereals, Yogurt & Fruit
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'House Made Granola', 'breakfast', 'Cereals, Yogurt & Fruit', 12.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Oatmeal', 'breakfast', 'Cereals, Yogurt & Fruit', 10.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fruit Bowl', 'breakfast', 'Cereals, Yogurt & Fruit', 10.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Organic Yogurt', 'breakfast', 'Cereals, Yogurt & Fruit', 5.50),
-- Benedicts
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cuban Benedict', 'breakfast', 'Benedicts', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Eggs Benedict', 'breakfast', 'Benedicts', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lox Benedict', 'breakfast', 'Benedicts', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Vegetable Benedict', 'breakfast', 'Benedicts', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Crab Benedict', 'breakfast', 'Benedicts', 25.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lobster Benedict', 'breakfast', 'Benedicts', 28.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cod Cake Benedict', 'breakfast', 'Benedicts', 20.00),
-- Hash & Eggs
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Corned Beef Hash n Eggs', 'breakfast', 'Hash & Eggs', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Spicy Chicken Hash', 'breakfast', 'Hash & Eggs', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Spicy Pulled Pork Hash', 'breakfast', 'Hash & Eggs', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Salmon Hash', 'breakfast', 'Hash & Eggs', 21.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Shashuka', 'breakfast', 'Hash & Eggs', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Short Ribs Hash', 'breakfast', 'Hash & Eggs', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Hash', 'breakfast', 'Hash & Eggs', 21.00),
-- Specialty Dishes
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Andean B-Vitamin Recharge', 'breakfast', 'Specialty Dishes', 21.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Bayou Bundle', 'breakfast', 'Specialty Dishes', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Black Bean Cake', 'breakfast', 'Specialty Dishes', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Breakfast BLT', 'breakfast sandwich', 'Specialty Dishes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Breakfast Tacos', 'taco', 'Specialty Dishes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Bull''s Eye', 'breakfast', 'Specialty Dishes', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Huevos Rancheros', 'breakfast', 'Specialty Dishes', 20.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Smokin'' in the Shower', 'breakfast', 'Specialty Dishes', 20.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Mac & Cheese', 'pasta', 'Specialty Dishes', 14.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Steak & Eggs', 'steak', 'Specialty Dishes', 21.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Vineyard Haven Super Bowl', 'breakfast', 'Specialty Dishes', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Toast', 'breakfast', 'Specialty Dishes', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Pancakes', 'breakfast', 'Specialty Dishes', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Rice Bowl', 'breakfast', 'Specialty Dishes', 19.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Chicken and Waffle', 'breakfast', 'Specialty Dishes', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Benedict', 'breakfast', 'Specialty Dishes', 20.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Broiled Grapefruit', 'breakfast', 'Specialty Dishes', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Tortilla', 'breakfast', 'Specialty Dishes', 23.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Tacos', 'taco', 'Specialty Dishes', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Enchiladas', 'breakfast', 'Specialty Dishes', 18.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Biscuit', 'breakfast', 'Specialty Dishes', 19.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Green Monsta', 'breakfast', 'Specialty Dishes', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Chili Fries', 'fries', 'Specialty Dishes', 15.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Saute', 'breakfast', 'Specialty Dishes', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Shrimp and Grits', 'seafood', 'Specialty Dishes', 21.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Panini', 'sandwich', 'Specialty Dishes', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Bowl', 'breakfast', 'Specialty Dishes', 20.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lavash Special', 'breakfast', 'Specialty Dishes', 24.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lobster Chowder', 'chowder', 'Specialty Dishes', 12.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Breakfast Meat', 'fries', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Bagel w Cream Cheese', 'fries', 'Sides', 6.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Black Beans', 'fries', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Corned Beef Hash', 'fries', 'Sides', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fries', 'fries', 'Sides', 7.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Home Fries', 'fries', 'Sides', 6.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Kimchi', 'fries', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Local Greens', 'fries', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Loaded Home Fries', 'fries', 'Sides', 10.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Parsley Garlic Fries', 'fries', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Pork and Cheddar Hash', 'fries', 'Sides', 13.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Roasted Roots and Veg', 'fries', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Side of Grits', 'fries', 'Sides', 7.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Chili', 'fries', 'Sides', 13.00),
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Braised Beef Short Rib', 'sandwich', 'Sandwiches', 20.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Roasted Veggie Manchego', 'sandwich', 'Sandwiches', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Chicken Cutlet', 'sandwich', 'Sandwiches', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Ultimate Grilled Cheese', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fish Sandwich', 'fish', 'Sandwiches', 20.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Art Cliff Burger', 'burger', 'Sandwiches', 19.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Grilled House Corned Beef', 'sandwich', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Crabcake Sandwich', 'sandwich', 'Sandwiches', 23.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Turkey Burger', 'burger', 'Sandwiches', 18.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Sandwich', 'sandwich', 'Sandwiches', 22.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special BLT', 'sandwich', 'Sandwiches', 21.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Mussel', 'seafood', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Grilled Cheese', 'sandwich', 'Sandwiches', 13.95),
-- Soups & Salads
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Falafel Salad', 'salad', 'Soups & Salads', 17.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Vineyard Cobb Salad', 'salad', 'Soups & Salads', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Soup', 'soup', 'Soups & Salads', 10.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Chowder', 'chowder', 'Soups & Salads', 14.00),
-- Classic Art Cliff
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Crispy Fish Tacos', 'taco', 'Classic Art Cliff', 19.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lunch Crepes', 'entree', 'Classic Art Cliff', 19.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fish ''n Chips', 'fish', 'Classic Art Cliff', 21.50),
-- Sweets
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Biscuit', 'dessert', 'Sweets', 4.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Muffin', 'dessert', 'Sweets', 4.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Beignets', 'donuts', 'Sweets', 10.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Scone', 'dessert', 'Sweets', 4.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Special Donut', 'donuts', 'Sweets', 5.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cupcake', 'dessert', 'Sweets', 3.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Slice of Pie', 'dessert', 'Sweets', 4.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Pound Cake Slice', 'dessert', 'Sweets', 4.95),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Cookie', 'dessert', 'Sweets', 3.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Crème Brûlée', 'dessert', 'Sweets', 7.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Bun', 'dessert', 'Sweets', 4.50),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Croissant', 'dessert', 'Sweets', 4.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Key Lime Pie', 'dessert', 'Sweets', 5.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Sorbet', 'dessert', 'Sweets', 7.00);

-- Update menu_section_order to match actual menu
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast Sandwiches', 'Frittatas', 'Crepes', 'Pancakes, Waffles & French Toast', 'Cereals, Yogurt & Fruit', 'Benedicts', 'Hash & Eggs', 'Specialty Dishes', 'Sides', 'Sandwiches', 'Soups & Salads', 'Classic Art Cliff', 'Sweets']
WHERE name = 'ArtCliff Diner';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'ArtCliff Diner');

-- Should show 135 dishes
