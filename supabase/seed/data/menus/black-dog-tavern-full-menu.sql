-- Black Dog - Full Menu (Breakfast + Lunch/Dinner)
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Black Dog dishes first to avoid duplicates

-- Delete old Black Dog dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Black Dog');

-- Insert complete menu (61 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Classic "Woofer"', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Italian', 'breakfast sandwich', 'Breakfast Sandwiches', 12.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Spicy', 'breakfast sandwich', 'Breakfast Sandwiches', 12.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Cali', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The HC', 'breakfast sandwich', 'Breakfast Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Sriracha Maple', 'breakfast sandwich', 'Breakfast Sandwiches', 13.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Smoked Salmon Bagel', 'breakfast sandwich', 'Breakfast Sandwiches', 18.00),
-- Signature Breakfasts
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Black Dog Sunrise Granola', 'breakfast', 'Signature Breakfasts', 11.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Loretta at the Cafe', 'breakfast', 'Signature Breakfasts', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Breakfast Burrito', 'breakfast sandwich', 'Signature Breakfasts', 13.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Cinnamon-Vanilla French Toast', 'breakfast', 'Signature Breakfasts', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Hash and Eggs', 'breakfast', 'Signature Breakfasts', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Organic Brown Rice Bowl', 'breakfast', 'Signature Breakfasts', 19.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Breakfast Pizza', 'breakfast', 'Signature Breakfasts', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Classic Avocado Toast', 'breakfast', 'Signature Breakfasts', 12.00),
-- Breakfast Sides
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Smoked Bacon', 'sides', 'Breakfast Sides', 6.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Sausage', 'sides', 'Breakfast Sides', 5.50),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Toasted Bagel', 'sides', 'Breakfast Sides', 5.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Corned Beef Hash', 'sides', 'Breakfast Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Sourdough Toast', 'sides', 'Breakfast Sides', 4.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Tater Tots', 'fries', 'Breakfast Sides', 6.00),
-- Snacks and Starters
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Clam Chowder', 'chowder', 'Snacks and Starters', 12.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Boneless Buffalo Chicken', 'wings', 'Snacks and Starters', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Mozzarella Sticks', 'apps', 'Snacks and Starters', 12.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Harissa Spiced Hummus', 'apps', 'Snacks and Starters', 14.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Loaded Tots', 'fries', 'Snacks and Starters', 16.00),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Caesar', 'salad', 'Salads', 14.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Authentic Greek', 'salad', 'Salads', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Italian Chopped Salad', 'salad', 'Salads', 18.00),
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Turkey', 'sandwich', 'Sandwiches', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Country Club Chicken Salad', 'sandwich', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Caprese', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Alabama', 'fried chicken', 'Sandwiches', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Reuben', 'sandwich', 'Sandwiches', 21.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'The Ultimate Italian Grinder', 'sandwich', 'Sandwiches', 19.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Mom''s Tuna Salad', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Philly Cheese Steak', 'sandwich', 'Sandwiches', 21.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Pesto', 'sandwich', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Grilled Chicken', 'sandwich', 'Sandwiches', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Pilgrim', 'sandwich', 'Sandwiches', 18.00),
-- Black Dog Cafe Classics
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Smashburger Deluxe', 'burger', 'Black Dog Cafe Classics', 24.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Fish and Chips', 'fish', 'Black Dog Cafe Classics', 28.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Grilled Chicken Caesar Wrap', 'sandwich', 'Black Dog Cafe Classics', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Old Fashioned BLT', 'sandwich', 'Black Dog Cafe Classics', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Quesadilla', 'quesadilla', 'Black Dog Cafe Classics', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Fish Tacos', 'taco', 'Black Dog Cafe Classics', 19.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Bolognese Rigatoni Pasta', 'pasta', 'Black Dog Cafe Classics', 25.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Pasta Alfredo with Broccoli', 'pasta', 'Black Dog Cafe Classics', 18.00),
-- Roman Pizza
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Margarita', 'pizza', 'Roman Pizza', 19.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Funghi', 'pizza', 'Roman Pizza', 21.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Cheese', 'pizza', 'Roman Pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Parma', 'pizza', 'Roman Pizza', 22.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Carne', 'pizza', 'Roman Pizza', 23.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Bacon Alfredo', 'pizza', 'Roman Pizza', 22.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Buffalo Chicken', 'pizza', 'Roman Pizza', 22.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'French Fries', 'fries', 'Sides', 7.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Truffle Parmigiano Fries', 'fries', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Mac N Cheese', 'sides', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Sweet Potato Fries', 'fries', 'Sides', 8.00),
-- Kids Menu
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Fingers and Fries', 'tendys', 'Kids Menu', 11.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Grilled Cheese Sandwich and Fries', 'sandwich', 'Kids Menu', 8.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast Sandwiches', 'Signature Breakfasts', 'Breakfast Sides', 'Snacks and Starters', 'Salads', 'Sandwiches', 'Black Dog Cafe Classics', 'Roman Pizza', 'Sides', 'Kids Menu']
WHERE name = 'Black Dog';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Black Dog');

-- Should show 61 dishes
