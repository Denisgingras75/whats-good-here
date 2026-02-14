-- The Barn Bowl & Bistro - Full Menu
-- Source: WINTER 2026 Menu PDF
-- Run this in Supabase SQL Editor
-- NOTE: Chicken Nuggets already exists, using ON CONFLICT DO NOTHING

DO $$
DECLARE
  rid UUID;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE name = 'The Barn Bowl & Bistro';

  -- Appetizers (18 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Bacon Cheeseburger Sliders', 'apps', 'Appetizers', 19.00),
  (rid, 'Bang Bang Cauliflower', 'apps', 'Appetizers', 14.00),
  (rid, 'Queso Fundido', 'apps', 'Appetizers', 16.00),
  (rid, 'Lemon Pepper Chicken Wings', 'wings', 'Appetizers', 18.00),
  (rid, 'Crab Cakes', 'apps', 'Appetizers', 18.00),
  (rid, 'Barn Mussels', 'seafood', 'Appetizers', 24.00),
  (rid, 'Shrimp Tempura', 'apps', 'Appetizers', 19.00),
  (rid, 'House-Cut Onion Rings', 'apps', 'Appetizers', 12.00),
  (rid, 'Chicken Lemongrass Potstickers', 'apps', 'Appetizers', 13.00),
  (rid, 'Balsamic Bruschetta', 'apps', 'Appetizers', 18.00),
  (rid, 'Bacon Brussels Sprouts', 'apps', 'Appetizers', 18.00),
  (rid, 'Crispy Calamari', 'apps', 'Appetizers', 18.00),
  (rid, 'Garlic Naan w/ Curry Sauce', 'apps', 'Appetizers', 12.00),
  (rid, 'Pork Ribs', 'ribs', 'Appetizers', 17.00),
  (rid, 'Crispy Fish Bites', 'fish', 'Appetizers', 19.00),
  (rid, 'Brazilian Steak Skewers', 'steak', 'Appetizers', 26.00),
  (rid, 'Southwest Chicken Egg Rolls', 'apps', 'Appetizers', 13.00),
  (rid, 'Artichoke & Spinach Dip', 'apps', 'Appetizers', 19.00)
  ON CONFLICT DO NOTHING;

  -- Salads (4 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Classic Caesar', 'salad', 'Salads', 15.00),
  (rid, 'Taco Salad', 'salad', 'Salads', 26.00),
  (rid, 'Apple Cranberry Salad', 'salad', 'Salads', 19.00),
  (rid, 'Brussels & Kale', 'salad', 'Salads', 18.00)
  ON CONFLICT DO NOTHING;

  -- House-Made Soups (3 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'French Onion Soup', 'soup', 'House-Made Soups', 12.00),
  (rid, 'Clam Chowder', 'chowder', 'House-Made Soups', 12.00),
  (rid, 'Chicken Vegetable Soup', 'soup', 'House-Made Soups', 12.00)
  ON CONFLICT DO NOTHING;

  -- Gourmet 10" Pizzas (11 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Prosciutto & Fig Pizza', 'pizza', 'Gourmet 10" Pizzas', 23.00),
  (rid, 'Hawaiian Pizza', 'pizza', 'Gourmet 10" Pizzas', 21.00),
  (rid, 'BBQ Chicken Pizza', 'pizza', 'Gourmet 10" Pizzas', 20.00),
  (rid, 'Shortrib & Mushroom Pizza', 'pizza', 'Gourmet 10" Pizzas', 23.00),
  (rid, 'Meat Supreme Pizza', 'pizza', 'Gourmet 10" Pizzas', 22.00),
  (rid, 'Chicken Parmesan Pizza', 'pizza', 'Gourmet 10" Pizzas', 21.00),
  (rid, 'Chicken Bacon Ranch Pizza', 'pizza', 'Gourmet 10" Pizzas', 21.00),
  (rid, 'Wild Mushroom & Truffle Pizza', 'pizza', 'Gourmet 10" Pizzas', 22.00),
  (rid, 'Brazilian Catupiry Pizza', 'pizza', 'Gourmet 10" Pizzas', 22.00),
  (rid, 'Artichoke & Spinach Pizza', 'pizza', 'Gourmet 10" Pizzas', 22.00),
  (rid, 'Plain Cheese Pizza', 'pizza', 'Gourmet 10" Pizzas', 12.00)
  ON CONFLICT DO NOTHING;

  -- Entrees (26 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Red Pesto Gnocchi', 'pasta', 'Entrees', 23.00),
  (rid, 'Braised Beef Stew', 'entree', 'Entrees', 27.00),
  (rid, 'The Barn''s Famous Curry', 'asian', 'Entrees', 26.00),
  (rid, 'Barn Classic Hamburger', 'burger', 'Entrees', 21.00),
  (rid, 'Beyond Burger', 'burger', 'Entrees', 23.00),
  (rid, 'Barn Burrito Bowl', 'entree', 'Entrees', 27.00),
  (rid, 'Chicken Parmesan', 'chicken', 'Entrees', 28.00),
  (rid, 'General Tso Chicken', 'asian', 'Entrees', 26.00),
  (rid, 'Ahi Tuna Poke Bowl', 'pokebowl', 'Entrees', 28.00),
  (rid, 'Teriyaki Steak Tips', 'steak', 'Entrees', 28.00),
  (rid, 'Bourbon Street Pasta', 'pasta', 'Entrees', 24.00),
  (rid, 'Jamaican Jerk Rice Bowl', 'chicken', 'Entrees', 27.00),
  (rid, 'Brazilian Picanha Feast', 'steak', 'Entrees', 62.00),
  (rid, 'Shrimp & Lobster Pasta', 'pasta', 'Entrees', 42.00),
  (rid, 'Teriyaki Glazed Salmon', 'fish', 'Entrees', 32.00),
  (rid, 'Chicken & Broccoli Alfredo', 'pasta', 'Entrees', 28.00),
  (rid, 'Braised Beef Short Rib', 'entree', 'Entrees', 41.00),
  (rid, 'Fig & BBQ Meatloaf', 'entree', 'Entrees', 29.00),
  (rid, 'Porterhouse Pork Chop', 'pork', 'Entrees', 28.00),
  (rid, 'Baked Tilapia', 'fish', 'Entrees', 28.00),
  (rid, 'Grilled Sirloin Alfredo', 'steak', 'Entrees', 42.00),
  (rid, 'BBQ Baby Back Ribs', 'ribs', 'Entrees', 28.00),
  (rid, 'Mussels & Shrimp Fra Diavolo', 'seafood', 'Entrees', 26.00),
  (rid, 'Beef Lasagna', 'pasta', 'Entrees', 26.00),
  (rid, 'Fried Cod Filet & Chips', 'fish', 'Entrees', 28.00),
  (rid, 'Fried Chicken Dinner', 'fried chicken', 'Entrees', 26.00)
  ON CONFLICT DO NOTHING;

  -- Desserts (7 items)
  INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
  (rid, 'Warm Apple Crisp', 'dessert', 'Desserts', 13.00),
  (rid, 'Pudim (Brazilian Flan)', 'dessert', 'Desserts', 10.00),
  (rid, 'Creme Brule Cheesecake', 'dessert', 'Desserts', 14.00),
  (rid, 'Oreo Cookies & Cream Pie', 'dessert', 'Desserts', 10.00),
  (rid, '3 Layer Chocolate Cake', 'dessert', 'Desserts', 13.00),
  (rid, 'Strawberry Shortcake Cake', 'dessert', 'Desserts', 14.00),
  (rid, 'Acai Bowl', 'dessert', 'Desserts', 18.00)
  ON CONFLICT DO NOTHING;

  -- Set menu_section on existing Chicken Nuggets
  UPDATE dishes SET menu_section = 'Appetizers'
  WHERE restaurant_id = rid AND name = 'Chicken Nuggets';

  -- Update menu_section_order
  UPDATE restaurants
  SET menu_section_order = ARRAY['Appetizers', 'Salads', 'House-Made Soups', 'Gourmet 10" Pizzas', 'Entrees', 'Desserts']
  WHERE id = rid;

END $$;

-- Verify
SELECT name, menu_section, price, category
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Barn Bowl & Bistro')
  AND parent_dish_id IS NULL
ORDER BY
  array_position(
    ARRAY['Appetizers', 'Salads', 'House-Made Soups', 'Gourmet 10" Pizzas', 'Entrees', 'Desserts'],
    menu_section
  ),
  name;
