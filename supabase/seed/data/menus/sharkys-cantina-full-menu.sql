-- Sharky's Cantina - Full Menu
-- Source: Menu provided by owner
-- Run this in Supabase SQL Editor

-- Delete old dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina');

-- Insert complete menu (63 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Starters (13 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Chips & Dips', 'apps', 'Starters', 3.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Trifecta with Chips', 'apps', 'Starters', 13.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Chicken Tortilla Soup', 'soup', 'Starters', 8.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'BBQ Pulled Pork Sliders', 'pork', 'Starters', 14.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Sweet Chili Coconut Shrimp', 'apps', 'Starters', 14.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Chicken Flauta', 'apps', 'Starters', 12.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Steak Flauta', 'apps', 'Starters', 16.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Jalapeno Poppers', 'apps', 'Starters', 11.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Jalapeno-Cheddar Stuffed Pretzels', 'apps', 'Starters', 11.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Street Corn Crispy Shrimp', 'apps', 'Starters', 14.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-A-Nacho (Big 9")', 'apps', 'Starters', 13.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-A-Nacho (Bigger 11.5")', 'apps', 'Starters', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Nachos', 'apps', 'Starters', 17.99),
-- Sharky's Salad (1 item)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Sharky''s Taco Salad', 'salad', 'Sharky''s Salad', 13.99),
-- House Specialties (10 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Chimichanga', 'taco', 'House Specialties', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Steak Chimichanga', 'taco', 'House Specialties', 20.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Shrimp Chimichanga', 'taco', 'House Specialties', 21.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Famous Double Cheeseburger Chimi', 'burger', 'House Specialties', 18.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Sizzlin'' Fajitas', 'taco', 'House Specialties', 17.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Steak Sizzlin'' Fajitas', 'taco', 'House Specialties', 22.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Shrimp Sizzlin'' Fajitas', 'taco', 'House Specialties', 23.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Enchiladas', 'taco', 'House Specialties', 17.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Steak Enchiladas', 'taco', 'House Specialties', 22.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Shrimp Enchiladas', 'taco', 'House Specialties', 23.99),
-- Quesadillas (13 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-a-Dilla', 'quesadilla', 'Quesadillas', 11.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Big Macadilla', 'quesadilla', 'Quesadillas', 18.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Chicken Bacon Ranch Dilla', 'quesadilla', 'Quesadillas', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Vegadilla', 'quesadilla', 'Quesadillas', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Steak ''n Cheez Dilla', 'quesadilla', 'Quesadillas', 19.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Fajita Dilla', 'quesadilla', 'Quesadillas', 16.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'B-L-T Dilla', 'quesadilla', 'Quesadillas', 14.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Cheeseburger Dilla', 'quesadilla', 'Quesadillas', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Quansoo BBQ Dilla', 'quesadilla', 'Quesadillas', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Quesadilla Plato', 'quesadilla', 'Quesadillas', 20.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Quesadilla Plato (Shrimp)', 'quesadilla', 'Quesadillas', 25.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Quesadilla Plato (Cod)', 'quesadilla', 'Quesadillas', 20.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Quesadilla Plato (Steak)', 'quesadilla', 'Quesadillas', 24.98),
-- Wing Menu (2 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Bone-In Wings', 'wings', 'Wing Menu', 17.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Boneless Wings', 'wings', 'Wing Menu', 13.99),
-- Burger Menu (4 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Sharky''s Special Sauce Burger', 'burger', 'Burger Menu', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Hawaiian Burger', 'burger', 'Burger Menu', 17.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Texifornia Burger', 'burger', 'Burger Menu', 18.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Pulled BBQ Burger', 'burger', 'Burger Menu', 19.99),
-- Sharky's Burritos (7 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Super Grandios Baked Burrito Plato', 'taco', 'Sharky''s Burritos', 22.49),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Super Grandios Baked Burrito Plato (Steak)', 'taco', 'Sharky''s Burritos', 27.49),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Super Grandios Baked Burrito Plato (Cod)', 'taco', 'Sharky''s Burritos', 23.49),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Super Grandios Baked Burrito Plato (Shrimp)', 'taco', 'Sharky''s Burritos', 28.49),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-a-Bowl', 'taco', 'Sharky''s Burritos', 10.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-a-Burrito', 'taco', 'Sharky''s Burritos', 10.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The Vegarito', 'taco', 'Sharky''s Burritos', 15.99),
-- Tacos (6 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Crispy Cod Fish Tacos Plato', 'taco', 'Tacos', 20.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-''em-Tacos', 'taco', 'Tacos', 10.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Tacos Plato', 'taco', 'Tacos', 19.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Tacos Plato (Shrimp)', 'taco', 'Tacos', 25.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Tacos Plato (Cod)', 'taco', 'Tacos', 20.98),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Loaded Tacos Plato (Steak)', 'taco', 'Tacos', 24.98),
-- Sandwiches & Stuff (9 items)
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Corona Cod Fish Sandwich', 'fish', 'Sandwiches & Stuff', 16.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Pulled Pork Sandwich', 'sandwich', 'Sandwiches & Stuff', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Build-A-Grilled Chicken Sandwich', 'sandwich', 'Sandwiches & Stuff', 12.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'The CBR Sandwich', 'sandwich', 'Sandwiches & Stuff', 15.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Double Dogs & Fries', 'entree', 'Sandwiches & Stuff', 10.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Corona Cod Fish & Chips', 'fish', 'Sandwiches & Stuff', 19.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Double Corn Dogs & Fries', 'entree', 'Sandwiches & Stuff', 13.99),
((SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina'), 'Fried Shrimp Platter', 'seafood', 'Sandwiches & Stuff', 29.99);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Starters', 'Sharky''s Salad', 'House Specialties', 'Quesadillas', 'Wing Menu', 'Burger Menu', 'Sharky''s Burritos', 'Tacos', 'Sandwiches & Stuff']
WHERE name = 'Sharky''s Cantina';

-- Verify
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Sharky''s Cantina');
