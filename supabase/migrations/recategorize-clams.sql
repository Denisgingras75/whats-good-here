-- Recategorize clam dishes to new 'clams' category
-- Covers: fried clam plates/baskets (strips, bellies), steamed clams
-- Does NOT touch: clam chowder (stays chowder), clam rolls (stays sandwich),
--   clam stuffers (stays apps), clams & sausage (stays apps)

-- Nancy's Restaurant
UPDATE dishes SET category = 'clams'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant')
  AND name IN ('Clam Strips', 'Clam Bellies');

-- Rockfish
UPDATE dishes SET category = 'clams'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Rockfish')
  AND name = 'Whole Belly Clam Plate';

-- Lookout Tavern
UPDATE dishes SET category = 'clams'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Lookout Tavern')
  AND name = 'Steamed Clams';

-- Coop de Ville - fix clam roll back to sandwich (it's a roll, not a plate)
UPDATE dishes SET category = 'sandwich'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville')
  AND name = 'Fried Whole Belly Clam Roll'
  AND category = 'clams';

-- Coop de Ville - steamers to clams
UPDATE dishes SET category = 'clams'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville')
  AND name = 'Local Hand-dug Steamers'
  AND category != 'clams';

-- Verify
SELECT r.name AS restaurant, d.name AS dish, d.category
FROM dishes d
JOIN restaurants r ON r.id = d.restaurant_id
WHERE d.category = 'clams'
ORDER BY r.name, d.name;
