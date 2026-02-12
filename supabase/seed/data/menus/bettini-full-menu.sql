-- Bettini Restaurant - Full Menu (2026 Winter)
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Bettini dishes first to avoid duplicates
-- Source: https://harborviewhotel.com/wp-content/uploads/2026/01/2026-Winter-Bettini-Dinner-Menu.pdf

-- Delete old Bettini dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bettini Restaurant');

-- Insert complete menu (24 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Starters
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Clam Chowder', 'chowder', 'Soups & Apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Local Crab Cake', 'apps', 'Soups & Apps', 29.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Prime Beef Carpaccio', 'apps', 'Soups & Apps', 29.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Seasonal Burrata', 'apps', 'Soups & Apps', 23.00),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Endive & Frisee', 'salad', 'Salads', 18.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Artisanal Lettuces', 'salad', 'Salads', 19.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Gem Caesar Salad', 'salad', 'Salads', 18.00),
-- Housemade Pastas
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Rigatoni Bolognese', 'pasta', 'Housemade Pastas', 36.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Ricotta Gnocchi', 'pasta', 'Housemade Pastas', 33.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Lobster Bucatini', 'pasta', 'Housemade Pastas', 50.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Seasonal Pasta', 'pasta', 'Housemade Pastas', 32.00),
-- From the Sea
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Curry Spice Seared Alaskan Halibut', 'fish', 'From the Sea', 48.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Faroe Island Salmon', 'fish', 'From the Sea', 42.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Seared Local Diver Scallops', 'seafood', 'From the Sea', 60.00),
-- From the Land
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Pan Seared Half Chicken', 'chicken', 'From the Land', 48.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Roasted Rack of Lamb', 'entree', 'From the Land', 44.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), '12 oz Prime New York Strip', 'steak', 'From the Land', 70.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), '7 oz Prime Filet Mignon', 'steak', 'From the Land', 80.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Broccolini', 'fries', 'Sides', 15.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Regular Fries', 'fries', 'Sides', 12.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Truffle Fries', 'fries', 'Sides', 16.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Duck Fat Fingerling Potato', 'fries', 'Sides', 17.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Boursin Potato Puree', 'fries', 'Sides', 16.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Brussels Sprout', 'fries', 'Sides', 16.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Soups & Apps', 'Salads', 'Housemade Pastas', 'From the Sea', 'From the Land', 'Sides']
WHERE name = 'Bettini Restaurant';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bettini Restaurant');

-- Should show 24 dishes
