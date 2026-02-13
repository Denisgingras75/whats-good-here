-- Offshore Ale Company - Update menu sections to match actual dinner menu
-- Source: Dinner menu provided by owner
-- Run this in Supabase SQL Editor
-- UPDATE only - preserves existing dishes and votes

DO $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE name = 'Offshore Ale Company';

  -- Starters
  UPDATE dishes SET menu_section = 'Starters' WHERE restaurant_id = rid AND name IN (
    'New England Clam Chowder',
    'Offshore Chili',
    'French Onion Soup',
    'Tomato Soup',
    'Guacamole and Chips',
    'Grilled Brie',
    'Buffalo Cauliflower',
    'Chicken Tenders',
    'Bavarian Pretzel Sticks',
    'Hand-Cut Fries',
    'Truffle Fries',
    'Wings',
    'Steamed PEI Mussels'
  );

  -- Salads
  UPDATE dishes SET menu_section = 'Salads' WHERE restaurant_id = rid AND name IN (
    'Power Bowl',
    'Caesar Salad',
    'Pub Salad'
  );

  -- Brick Oven Pizzas
  UPDATE dishes SET menu_section = 'Brick Oven Pizzas' WHERE restaurant_id = rid AND name IN (
    'Classic Cheese Pizza',
    'BBQ Chicken Pizza',
    'Meat Lovers Pizza',
    'Veggie Pizza',
    'Hawaiian Pizza',
    'Margherita Pizza',
    'Chicken Pesto Pizza',
    'Potato Pizza'
  );

  -- Mains
  UPDATE dishes SET menu_section = 'Mains' WHERE restaurant_id = rid AND name IN (
    'Fish and Chips',
    'Tuna Poke',
    'Baby Back Ribs',
    'Tavern Burger',
    'Turkey Burger',
    'Chicken Quesadilla',
    'Steak Quesadilla',
    'Veggie Quesadilla'
  );

  -- Existing dishes not on dinner menu → lunch-only
  UPDATE dishes SET menu_section = 'Mains', tags = array_append(COALESCE(tags, '{}'), 'lunch-only')
  WHERE restaurant_id = rid AND name IN (
    'Knife and Fork Fried Chicken Sandwich',
    'Fish Sandwich',
    'Salmon BLT',
    'Grilled Cheese and Tomato Soup'
  ) AND NOT ('lunch-only' = ANY(COALESCE(tags, '{}')));

  -- Add new dinner menu dishes
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Kale Salad', 'salad', 'Salads', 17.00),
  (rid, 'Arugula and Goat Cheese Salad', 'salad', 'Salads', 18.00),
  (rid, 'Portuguese Fisherman''s Stew', 'seafood', 'Mains', 38.00),
  (rid, 'Brewers Mac & Cheese', 'pasta', 'Mains', 28.00),
  (rid, 'Stuffed Salmon', 'fish', 'Mains', 39.00),
  (rid, 'Steak Frites', 'steak', 'Mains', 39.00),
  (rid, 'Roast Chicken', 'chicken', 'Mains', 30.00),
  (rid, 'Fried Chicken', 'fried chicken', 'Mains', 29.00)
  ON CONFLICT DO NOTHING;

  -- Update menu_section_order
  UPDATE restaurants
  SET menu_section_order = ARRAY['Starters', 'Salads', 'Brick Oven Pizzas', 'Mains']
  WHERE id = rid;

END $$;

-- Verify
SELECT name, menu_section, price, category, tags
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Offshore Ale Company')
  AND parent_dish_id IS NULL
ORDER BY
  array_position(ARRAY['Starters', 'Salads', 'Brick Oven Pizzas', 'Mains'], menu_section),
  name;
