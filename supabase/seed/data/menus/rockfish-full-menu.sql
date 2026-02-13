-- Rockfish Edgartown - Fix menu_section to match actual menu
-- Source: https://rockfishedgartown.com/menu/
-- Run this in Supabase SQL Editor
-- UPDATE only - preserves existing dishes and votes

-- =============================================================
-- Rockfish actual menu sections (from website):
--   Lunch: Starters/Salads, Pizza, Chef's Specials, Burgers & Sandwiches, Tacos
--   Dinner: Appetizers, Salads, Chef's Specials, Pizza, Tacos
--
-- Combined for app: Starters, Salads, Pizza, Chef's Specials,
--                    Burgers & Sandwiches, Tacos
-- =============================================================

DO $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE name = 'Rockfish';

  -- Starters (lunch: Starters/Salads, dinner: Appetizers)
  UPDATE dishes SET menu_section = 'Starters' WHERE restaurant_id = rid AND name IN (
    'Clam Chowder',
    'Tomato Soup',
    'Buffalo Fried Cauliflower',
    'Truffle Risotto Balls',
    'Fried Calamari',
    'Burrata',
    'Tuscan Style Jumbo Wings',
    'PEI Mussels',
    'Hand Cut Fries',
    'Truffle Fries w/ Shaved Cheese',
    'Crab Cakes',
    'Tuna Poke Nachos'
  );

  -- Salads
  UPDATE dishes SET menu_section = 'Salads' WHERE restaurant_id = rid AND name IN (
    'Caesar Salad',
    'Cobb Salad',
    'Roasted Golden Beet',
    'Greens'
  );

  -- Pizza
  UPDATE dishes SET menu_section = 'Pizza' WHERE restaurant_id = rid AND name IN (
    'Classic Pizza',
    'Italian Pizza',
    'BBQ Chicken Pizza',
    'Margherita Pizza',
    'Prosciutto & Arugula',
    'Veggie Pizza',
    'White Pizza',
    'Chicken Bacon Ranch'
  );

  -- Chef's Specials (entrees, seafood, pasta)
  UPDATE dishes SET menu_section = 'Chef''s Specials' WHERE restaurant_id = rid AND name IN (
    'Oven Roasted Cod',
    'Asparagus Risotto',
    'Mac-n-Cheese',
    'Chicken Pot Pie',
    'Lobster Pot Pie',
    'Fish & Chips',
    'Whole Belly Clam Plate',
    '12 oz Kobe Style Flat Iron',
    'Guinness Braised Short Rib',
    'Pan Seared Filet Mignon',
    'Chicken Pesto',
    'Bolognese',
    'Halibut'
  );

  -- Burgers & Sandwiches
  UPDATE dishes SET menu_section = 'Burgers & Sandwiches' WHERE restaurant_id = rid AND name IN (
    'Cheeseburger & Fries',
    'Surf-n-Turf Burger',
    'Chef''s Special Burger',
    'Jumbo Lobster Roll',
    'Sautéed Lobster Roll',
    'Fish Sandwich',
    'Hot Dog',
    'Chicken Bahn Mi',
    'Short Rib Grilled Cheese',
    'Plain Cheese',
    'Lobster Grilled Cheese',
    'Crispy Chicken Pesto Cutlet',
    'Crab Cake Sandwich'
  );

  -- Tacos
  UPDATE dishes SET menu_section = 'Tacos' WHERE restaurant_id = rid AND name IN (
    'Seared Cod Taco',
    'Short Rib Taco',
    'Sautéed Lobster Taco',
    'Veggie Taco',
    'Blackened Shrimp Taco'
  );

  -- =============================================================
  -- Tag lunch-only and dinner-only dishes
  -- =============================================================

  -- Lunch only (not on dinner menu)
  UPDATE dishes SET tags = array_append(COALESCE(tags, '{}'), 'lunch-only')
  WHERE restaurant_id = rid AND name IN (
    'Tomato Soup',
    'Cobb Salad',
    'Whole Belly Clam Plate',
    'Chef''s Special Burger',
    'Fish Sandwich',
    'Hot Dog',
    'Chicken Bahn Mi',
    'Short Rib Grilled Cheese',
    'Plain Cheese',
    'Lobster Grilled Cheese',
    'Crispy Chicken Pesto Cutlet',
    'Crab Cake Sandwich'
  ) AND NOT ('lunch-only' = ANY(COALESCE(tags, '{}')));

  -- Dinner only (not on lunch menu)
  UPDATE dishes SET tags = array_append(COALESCE(tags, '{}'), 'dinner-only')
  WHERE restaurant_id = rid AND name IN (
    '12 oz Kobe Style Flat Iron',
    'Guinness Braised Short Rib',
    'Pan Seared Filet Mignon',
    'Chicken Pesto',
    'Bolognese',
    'Halibut'
  ) AND NOT ('dinner-only' = ANY(COALESCE(tags, '{}')));

  -- Update menu_section_order to match actual menu layout
  UPDATE restaurants
  SET menu_section_order = ARRAY['Starters', 'Salads', 'Pizza', 'Chef''s Specials', 'Burgers & Sandwiches', 'Tacos']
  WHERE id = rid;

END $$;

-- Verify: check all dishes have menu_section and tags set
SELECT name, category, menu_section, price, tags
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Rockfish')
  AND parent_dish_id IS NULL
ORDER BY
  array_position(
    ARRAY['Starters', 'Salads', 'Pizza', 'Chef''s Specials', 'Burgers & Sandwiches', 'Tacos'],
    menu_section
  ),
  name;
