-- Populate menu_section on all dishes based on category
-- Run this in Supabase SQL Editor
-- Safe to re-run: only updates rows where menu_section IS NULL

-- Step A: Map category -> menu_section
UPDATE dishes SET menu_section = 'Soups & Chowder' WHERE menu_section IS NULL AND category IN ('chowder', 'soup');
UPDATE dishes SET menu_section = 'Starters'        WHERE menu_section IS NULL AND category IN ('apps');
UPDATE dishes SET menu_section = 'Wings'            WHERE menu_section IS NULL AND category = 'wings';
UPDATE dishes SET menu_section = 'Burgers'          WHERE menu_section IS NULL AND category = 'burger';
UPDATE dishes SET menu_section = 'Sandwiches'       WHERE menu_section IS NULL AND category IN ('sandwich', 'breakfast sandwich');
UPDATE dishes SET menu_section = 'Tacos'            WHERE menu_section IS NULL AND category IN ('taco', 'quesadilla');
UPDATE dishes SET menu_section = 'Pizza'            WHERE menu_section IS NULL AND category = 'pizza';
UPDATE dishes SET menu_section = 'Pasta'            WHERE menu_section IS NULL AND category = 'pasta';
UPDATE dishes SET menu_section = 'Seafood'          WHERE menu_section IS NULL AND category IN ('seafood', 'fish');
UPDATE dishes SET menu_section = 'Lobster'          WHERE menu_section IS NULL AND category IN ('lobster', 'lobster roll');
UPDATE dishes SET menu_section = 'Entrees'          WHERE menu_section IS NULL AND category = 'entree';
UPDATE dishes SET menu_section = 'Steak'            WHERE menu_section IS NULL AND category = 'steak';
UPDATE dishes SET menu_section = 'Sushi'            WHERE menu_section IS NULL AND category = 'sushi';
UPDATE dishes SET menu_section = 'Tenders'          WHERE menu_section IS NULL AND category IN ('tendys', 'fried chicken');
UPDATE dishes SET menu_section = 'Breakfast'        WHERE menu_section IS NULL AND category = 'breakfast';
UPDATE dishes SET menu_section = 'Salads'           WHERE menu_section IS NULL AND category = 'salad';
UPDATE dishes SET menu_section = 'Sides'            WHERE menu_section IS NULL AND category = 'fries';
UPDATE dishes SET menu_section = 'Desserts'         WHERE menu_section IS NULL AND category IN ('dessert', 'donuts');
UPDATE dishes SET menu_section = 'Bowls'            WHERE menu_section IS NULL AND category = 'pokebowl';
UPDATE dishes SET menu_section = 'Chicken'          WHERE menu_section IS NULL AND category = 'chicken';
UPDATE dishes SET menu_section = 'Asian'            WHERE menu_section IS NULL AND category = 'asian';

-- Verify: check for any dishes still missing menu_section
-- SELECT category, COUNT(*) FROM dishes WHERE menu_section IS NULL AND parent_dish_id IS NULL GROUP BY category;

-- Step B: Auto-generate menu_section_order per restaurant
-- Canonical display order for menu sections
DO $$
DECLARE
  r RECORD;
  section_order TEXT[] := ARRAY[
    'Starters', 'Soups & Chowder', 'Wings', 'Salads', 'Sushi',
    'Bowls', 'Breakfast', 'Sandwiches', 'Burgers', 'Tacos',
    'Pizza', 'Tenders', 'Chicken', 'Pasta', 'Seafood', 'Lobster',
    'Steak', 'Entrees', 'Asian', 'Sides', 'Desserts'
  ];
  restaurant_sections TEXT[];
  ordered_sections TEXT[];
  s TEXT;
BEGIN
  FOR r IN SELECT DISTINCT restaurant_id FROM dishes WHERE menu_section IS NOT NULL AND parent_dish_id IS NULL
  LOOP
    -- Get distinct sections for this restaurant
    SELECT ARRAY_AGG(DISTINCT menu_section) INTO restaurant_sections
    FROM dishes
    WHERE restaurant_id = r.restaurant_id
      AND menu_section IS NOT NULL
      AND parent_dish_id IS NULL;

    -- Order them by the canonical order
    ordered_sections := '{}';
    FOREACH s IN ARRAY section_order
    LOOP
      IF s = ANY(restaurant_sections) THEN
        ordered_sections := ordered_sections || s;
      END IF;
    END LOOP;

    -- Add any sections not in canonical order (alphabetically)
    FOREACH s IN ARRAY restaurant_sections
    LOOP
      IF NOT (s = ANY(ordered_sections)) THEN
        ordered_sections := ordered_sections || s;
      END IF;
    END LOOP;

    -- Update the restaurant
    UPDATE restaurants SET menu_section_order = ordered_sections WHERE id = r.restaurant_id;
  END LOOP;
END $$;

-- Verify results
-- SELECT r.name, r.menu_section_order
-- FROM restaurants r
-- WHERE array_length(r.menu_section_order, 1) > 0
-- ORDER BY r.name;
