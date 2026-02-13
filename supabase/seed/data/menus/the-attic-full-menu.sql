-- The Attic - Update menu sections to match actual menu
-- Source: the-attic-menu-2025-fall.pdf
-- Run this in Supabase SQL Editor
-- UPDATE only - preserves existing dishes and votes

DO $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE name = 'The Attic';

  -- Starters
  UPDATE dishes SET menu_section = 'Starters' WHERE restaurant_id = rid AND name IN (
    'Short Rib Poutine',
    'Crispy Sweet Chili Brussel Sprouts',
    'Tuna Tartar',
    'Fried Cheese Curds',
    'Attic Wings',
    'Waterside''s House Potato Chips',
    'Beer Battered Onion Rings',
    'Portuguese Mussels',
    'House-made Crab Cakes'
  );

  -- Salads & Soups
  UPDATE dishes SET menu_section = 'Salads & Soups' WHERE restaurant_id = rid AND name IN (
    'Attic Salad',
    'Butternut Squash & Spinach Salad',
    'Caesar Salad',
    'French Onion Soup',
    'Soup of the Day'
  );

  -- Burgers
  UPDATE dishes SET menu_section = 'Burgers' WHERE restaurant_id = rid AND name IN (
    'Classic Burger',
    'Attic Smash Burger',
    'Veggie Burger',
    'Turkey Burger',
    'Mr. Bowen',
    'Black & Bleu Burger',
    'Firehouse Burger'
  );

  -- Handhelds
  UPDATE dishes SET menu_section = 'Handhelds' WHERE restaurant_id = rid AND name IN (
    'Attic Fried Chicken Sandwich',
    'Pulled Pork Sandwich',
    'Fried Codfish Sandwich',
    'American Wagyu Hot Dog',
    'Lobster Roll'
  );

  -- Mac & Cheese
  UPDATE dishes SET menu_section = 'Mac & Cheese' WHERE restaurant_id = rid AND name = 'Classic Mac & Cheese';

  -- Entrees
  UPDATE dishes SET menu_section = 'Entrees' WHERE restaurant_id = rid AND name IN (
    '12 oz Prime N.Y. Strip',
    'Hoisin Glazed Salmon Rice Bowl',
    'Herb Roasted 1/2 Chicken',
    'Fish & Chips',
    'Harissa Roasted Cauliflower'
  );

  -- Sides
  UPDATE dishes SET menu_section = 'Sides' WHERE restaurant_id = rid AND name IN (
    'Hand-cut Fries',
    'Side Salad'
  );

  -- Fix categories
  UPDATE dishes SET category = 'pork'
  WHERE restaurant_id = rid AND name = 'Short Rib Poutine';

  UPDATE dishes SET category = 'steak'
  WHERE restaurant_id = rid AND name = '12 oz Prime N.Y. Strip';

  -- Fix price: Salmon bowl is $35 on current menu, was $38
  UPDATE dishes SET price = 35.00
  WHERE restaurant_id = rid AND name = 'Hoisin Glazed Salmon Rice Bowl';

  -- Update menu_section_order
  UPDATE restaurants
  SET menu_section_order = ARRAY['Starters', 'Salads & Soups', 'Burgers', 'Handhelds', 'Mac & Cheese', 'Entrees', 'Sides']
  WHERE id = rid;

END $$;

-- Verify
SELECT name, menu_section, price, category
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Attic')
  AND parent_dish_id IS NULL
ORDER BY
  array_position(ARRAY['Starters', 'Salads & Soups', 'Burgers', 'Handhelds', 'Mac & Cheese', 'Entrees', 'Sides'], menu_section),
  name;
