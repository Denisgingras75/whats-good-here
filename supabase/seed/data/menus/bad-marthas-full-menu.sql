-- Bad Martha Farmer's Brewery - Full Menu + Flagship Beers
-- Run this in Supabase SQL Editor
-- Edgartown brewery taproom — beer-forward with artisan pizza + snacks

-- Ensure restaurant exists with full details
INSERT INTO restaurants (name, address, lat, lng, town, cuisine, website_url, menu_url, phone, instagram_url, menu_section_order) VALUES
('Bad Martha Farmer''s Brewery', '270 Upper Main St, Edgartown, MA 02539', 41.3897, -70.5197, 'Edgartown', 'Brewery',
 'https://www.badmartha.com',
 'https://www.badmartha.com/taproom-menu',
 '(508) 939-4415',
 'https://www.instagram.com/badmarthabeer',
 ARRAY['Artisan Pizzas', 'Snacks & Starters', 'Flagship Beers', 'Flights & Growlers', 'Cocktails'])
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine,
  website_url = EXCLUDED.website_url,
  menu_url = EXCLUDED.menu_url,
  phone = EXCLUDED.phone,
  instagram_url = EXCLUDED.instagram_url,
  menu_section_order = EXCLUDED.menu_section_order;

-- Delete old dishes (safe re-run)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery');

-- Insert complete menu with menu_section for organized display
INSERT INTO dishes (restaurant_id, name, category, menu_section, price, tags) VALUES
-- Artisan Pizzas (thin crispy crust)
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Margherita Pizza', 'pizza', 'Artisan Pizzas', 16.00, ARRAY['shareable', 'classic']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Bacon & Red Onion Pizza', 'pizza', 'Artisan Pizzas', 18.00, ARRAY['shareable', 'savory']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Cremini Mushroom Pizza', 'pizza', 'Artisan Pizzas', 17.00, ARRAY['shareable', 'earthy']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Veggie Pizza', 'pizza', 'Artisan Pizzas', 18.00, ARRAY['shareable', 'vegetarian']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Taco Pizza', 'pizza', 'Artisan Pizzas', 18.00, ARRAY['shareable', 'creative']),

-- Snacks & Starters
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Giant Soft Pretzel', 'apps', 'Snacks & Starters', 12.00, ARRAY['shareable', 'beer-pairing']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Pretzel Bites', 'apps', 'Snacks & Starters', 10.00, ARRAY['shareable', 'snack']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Charcuterie Platter', 'apps', 'Snacks & Starters', 24.00, ARRAY['shareable', 'date-night']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Local Cheese Plate', 'apps', 'Snacks & Starters', 18.00, ARRAY['shareable', 'local']),

-- Flagship Beers (pint prices estimated from reviews)
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Martha''s Vineyard Ale', 'beer', 'Flagship Beers', 10.00, ARRAY['local', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Island IPA', 'beer', 'Flagship Beers', 10.00, ARRAY['hoppy', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Vineyard Summer Ale', 'beer', 'Flagship Beers', 10.00, ARRAY['light', 'summer', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Blueberry Abbey', 'beer', 'Flagship Beers', 10.00, ARRAY['fruity', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Last Ferry Home Stout', 'beer', 'Flagship Beers', 10.00, ARRAY['rich', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Edgartown Espresso Stout', 'beer', 'Flagship Beers', 10.00, ARRAY['rich', 'coffee', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Big Bad Belgian Quad', 'beer', 'Flagship Beers', 12.00, ARRAY['strong', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Humpback Hefeweizen', 'beer', 'Flagship Beers', 10.00, ARRAY['light', 'wheat', 'craft-beer']),

-- Flights & Growlers
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Beer Flight (4 Tasters)', 'beer', 'Flights & Growlers', 15.00, ARRAY['sampler', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Growler (64oz)', 'beer', 'Flights & Growlers', 22.00, ARRAY['take-home', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Crowler (32oz)', 'beer', 'Flights & Growlers', 14.00, ARRAY['take-home', 'craft-beer']),
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Bog Head Cranberry Seltzer', 'beer', 'Flights & Growlers', 9.00, ARRAY['light', 'fruity']),

-- Cocktails (rum-based taproom specials)
((SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'), 'Bad Martha Rum Punch', 'cocktails', 'Cocktails', 14.00, ARRAY['tropical', 'summer']);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery');

-- Should show 22 dishes
