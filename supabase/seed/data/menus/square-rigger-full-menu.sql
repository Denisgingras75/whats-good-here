-- Square Rigger - Full Menu (Lunch + Dinner)
-- Source: Lunch & Dinner menus provided by owner
-- Run this in Supabase SQL Editor

-- Delete old dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Square Rigger');

-- Insert complete menu (36 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price, tags) VALUES
-- Appetizers (11 items)
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Steak & Chips', 'steak', 'Appetizers', 23.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Thai Curry Mussels', 'seafood', 'Appetizers', 18.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Calamari', 'apps', 'Appetizers', 19.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Coxinha', 'apps', 'Appetizers', 16.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Brazilian Board', 'apps', 'Appetizers', 75.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Skewers', 'apps', 'Appetizers', 19.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Maplebrook Farm Burrata', 'apps', 'Appetizers', 21.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Chicken Wings', 'wings', 'Appetizers', 19.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Kids Tenders', 'tendys', 'Appetizers', 14.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Fried Shrimp Platter', 'seafood', 'Appetizers', 28.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Fried Clams Platter', 'clams', 'Appetizers', 34.00, ARRAY['lunch-only']),
-- Soup & Salads (4 items)
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'New England Clam Chowder', 'chowder', 'Soup & Salads', 12.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Caesar Salad', 'salad', 'Soup & Salads', 18.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Garden Salad', 'salad', 'Soup & Salads', 16.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Baby Berg', 'salad', 'Soup & Salads', 22.00, ARRAY['lunch-only']),
-- Mains (19 items)
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Hamburger', 'burger', 'Mains', 16.00, NULL),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Lobster Roll', 'lobster roll', 'Mains', 36.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Fish and Chips', 'fish', 'Mains', 25.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Shrimp Po Boy', 'sandwich', 'Mains', 22.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Fish Sandwich', 'fish', 'Mains', 24.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Katama Club', 'sandwich', 'Mains', 25.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Rigger Burger', 'burger', 'Mains', 25.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Steak Sandwich', 'steak', 'Mains', 23.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Chicken Caesar Wrap', 'sandwich', 'Mains', 18.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Blackened Salmon Sliders', 'fish', 'Mains', 18.00, ARRAY['lunch-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Bolognese', 'pasta', 'Mains', 27.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Shrimp Pesto Pasta', 'pasta', 'Mains', 26.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Pasta Primavera', 'pasta', 'Mains', 22.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Seafood Scampi', 'seafood', 'Mains', 34.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Crispy Salmon', 'fish', 'Mains', 30.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Half Chicken', 'chicken', 'Mains', 28.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Pan Seared Scallops', 'seafood', 'Mains', 32.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Seafood Paella', 'seafood', 'Mains', 34.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'N.Y. Strip', 'steak', 'Mains', 42.00, ARRAY['dinner-only']),
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'Filet Mignon', 'steak', 'Mains', 44.00, ARRAY['dinner-only']),
-- Sides (1 item)
((SELECT id FROM restaurants WHERE name = 'Square Rigger'), 'French Fries', 'fries', 'Sides', 12.00, ARRAY['dinner-only']);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Appetizers', 'Soup & Salads', 'Mains', 'Sides']
WHERE name = 'Square Rigger';

-- Verify
SELECT name, menu_section, price, category, tags
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Square Rigger')
ORDER BY
  array_position(ARRAY['Appetizers', 'Soup & Salads', 'Mains', 'Sides'], menu_section),
  name;
