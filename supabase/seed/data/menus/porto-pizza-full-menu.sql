-- Porto Pizza - Fix menu sections and prices, add slices
-- Run this in Supabase SQL Editor
-- UPDATE only - preserves existing dishes and votes

DO $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE name = 'Porto Pizza';

  -- Fix prices: regular pizzas = $19 (large), deep dish = $22 (large)
  UPDATE dishes SET price = 19.00, menu_section = 'Pizzas'
  WHERE restaurant_id = rid AND name IN (
    'Veggie Pizza',
    'White Pizza',
    'Bacon Jalapeño Pizza',
    'Linguica Peppers Pizza',
    'Cheese Pizza',
    'Pepperoni Pizza'
  );

  UPDATE dishes SET price = 22.00, menu_section = 'Pizzas'
  WHERE restaurant_id = rid AND name IN (
    'Deep Dish Pepperoni',
    'Deep Dish BBQ Pizza'
  );

  -- Add slices (price TBD)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Cheese Slice', 'pizza', 'Slices', NULL),
  (rid, 'Pepperoni Slice', 'pizza', 'Slices', NULL),
  (rid, 'Deep Dish Slice', 'pizza', 'Slices', NULL),
  (rid, 'White Slice', 'pizza', 'Slices', NULL)
  ON CONFLICT DO NOTHING;

  -- Update menu_section_order
  UPDATE restaurants
  SET menu_section_order = ARRAY['Pizzas', 'Slices']
  WHERE id = rid;

END $$;

-- Verify
SELECT name, menu_section, price, category
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Porto Pizza')
  AND parent_dish_id IS NULL
ORDER BY
  array_position(ARRAY['Pizzas', 'Slices'], menu_section),
  name;
