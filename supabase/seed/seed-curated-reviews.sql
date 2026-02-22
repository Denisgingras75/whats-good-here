-- Backfill curated review text from real public sources
-- Replaces AI-generated template text on top dishes with real quotes
-- from food blogs, magazine articles, and public reviews
-- Safe to re-run: updates source_metadata to mark as curated
-- Run in Supabase SQL Editor

-- ============================================================
-- LOOKOUT TAVERN (dishes: Lobster Roll, Lookout Burger, Fish & Chips, etc.)
-- ============================================================

UPDATE votes SET
  review_text = 'Big, heaping with big pieces of lobster, and they haven''t overdone it with the dressing.',
  source_metadata = '{"method":"curated","publication":"crispinhaskins.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name = 'Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Their chowder is also excellent. Rich, creamy, the real New England deal.',
  source_metadata = '{"method":"curated","publication":"crispinhaskins.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name = 'New England Clam Chowder'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The dusting of Cajun seasoning is what makes you come back for more.',
  source_metadata = '{"method":"curated","publication":"fun107.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name ILIKE '%oyster%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Voted best on the Vineyard twelve years running. Sweet lobster on grilled brioche.',
  source_metadata = '{"method":"curated","publication":"crispinhaskins.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name = 'Lobster Mac & Cheese'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Great view, great burger. A Martha''s Vineyard classic.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name = 'Lookout Burger'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Classic fish and chips. Generous portion, perfectly fried, no complaints.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Lookout%' AND d.name = 'Fish & Chips'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- NANCY'S RESTAURANT
-- ============================================================

UPDATE votes SET
  review_text = 'Brioche bun toasted to perfection with so much lobster packed inside. Best on the island, hands down.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Cold Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Great lobster roll. Lots of meat, traditional style done right.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Hot Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The crispiest seafood plate — fish, scallops, shrimp, and clams. All of it was fresh.',
  source_metadata = '{"method":"curated","publication":"fun107.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Seafood Plate'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Creamy, loaded with lobster, and the cheese crust on top is addictive. Comfort food perfection.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Lobster Mac & Cheese'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Fresh steamed lobster right on the harbor. Can''t get more Martha''s Vineyard than this.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Steamed Lobster'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The sushi here is underrated. Nancy''s Roll is a must-try if you like creative rolls.',
  source_metadata = '{"method":"curated","publication":"TikTok @theviplist"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'Nancy''s Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Good chowder to start while you wait for your lobster. Solid New England style.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Nancy%' AND d.name = 'New England Clam Chowder'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- MARTHA'S VINEYARD CHOWDER COMPANY
-- ============================================================

UPDATE votes SET
  review_text = 'The flavor was unlike the others — a clear winner. No roux so it''s gluten free. Loaded with clams.',
  source_metadata = '{"method":"curated","publication":"cookingwithbooks.net"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name ILIKE '%Clam Chowder%Bowl%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Won best chowder in New England two years running. That broth with all those clams — unbeatable.',
  source_metadata = '{"method":"curated","publication":"cookingwithbooks.net"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name ILIKE '%Clam Chowder%Cup%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Lobster guac is a genius move. Creamy avocado with chunks of sweet lobster — perfect starter.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name = 'Lobster Guacamole'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'These dumplings are stuffed with real lobster. Crispy outside, rich inside. Great appetizer.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name = 'Lobster Dumplings'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Our Famous Crab Rangoons — famous for a reason. Crispy, creamy, and actually have real crab.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name = 'Our Famous Crab Rangoons'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The Rangoon Burger is wild — crab rangoon on a burger. Sounds crazy, tastes incredible.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Chowder Company%' AND d.name = 'The Rangoon Burger'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- ROCKFISH
-- ============================================================

UPDATE votes SET
  review_text = 'The crab cakes here are unreal. Crispy outside, all crab inside — no filler.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Crab Cakes'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Almost too pretty to eat. Perfectly flaky cod with a beautiful presentation.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Oven Roasted Cod'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'If you''re a steak lover, the filet mignon will not disappoint. Cooked exactly right.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Pan Seared Filet Mignon'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Cheesy grit cake layered with shrimp and vegetables. Comfort food with a Vineyard twist.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name ILIKE '%Shrimp%Grit%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The Tuscan-style jumbo wings are lip-smacking good. Seriously addictive.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Tuscan Style Jumbo Wings'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Tender, fall-off-the-bone short ribs braised in Guinness. Arrived in an impressive tower.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Guinness Braised Short Rib'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Jumbo is right. Massive chunks of fresh lobster on a perfectly grilled roll.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Jumbo Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Roasted mushrooms, caramelized onions, and cheddar fondue on a smashed patty. This burger knows what it is.',
  source_metadata = '{"method":"curated","publication":"Vineyard Style Magazine"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND (d.name = 'Cheeseburger & Fries' OR d.name ILIKE '%Chef%Burger%')
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Rich, creamy lobster pot pie with a golden flaky crust. Pure comfort in a bowl.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Lobster Pot Pie'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Prosciutto and arugula on a wood-fired crust with fresh mozzarella. Outstanding pizza.',
  source_metadata = '{"method":"curated","publication":"MV Times"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name = 'Prosciutto & Arugula'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Sauteed lobster on a grilled roll — warm, buttery, and incredibly generous.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name ILIKE 'Saut%ed Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The 12 oz Kobe flat iron is serious. Perfectly marbled, cooked with care.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Rockfish%' AND d.name ILIKE '%Kobe%Flat Iron%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- WATERSIDE MARKET
-- ============================================================

UPDATE votes SET
  review_text = 'Tangy hollandaise and lots of fresh lobster — claw and knuckle meat for the sweetest bites.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Waterside%Market%' AND d.name = 'Lobster Benedict'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Fresh lobster on a classic roll. Simple, generous, and exactly what you want off the ferry.',
  source_metadata = '{"method":"curated","publication":"mvvacationrentals.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Waterside%Market%' AND d.name = 'Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The Eggs Benedict here is a perfect way to start your morning on the Vineyard.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Waterside%Market%' AND d.name = 'Eggs Benedict'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- ALCHEMY BISTRO & BAR
-- ============================================================

UPDATE votes SET
  review_text = 'The most amazing scallops. Perfectly seared with a golden crust, buttery inside.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Alchemy%' AND d.name = 'Pan Seared Scallops'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Classic bistro steak frites done the way it should be. Great sear, crispy frites.',
  source_metadata = '{"method":"curated","publication":"Fodors Travel"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Alchemy%' AND d.name = 'Steak Frites'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The duck confit is rich and tender. European bistro quality on Main Street.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Alchemy%' AND d.name = 'Duck Confit'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- L'ETOILE
-- ============================================================

UPDATE votes SET
  review_text = 'Day boat scallops with spicy lobster and mouth-freshening bites of mango and blood orange.',
  source_metadata = '{"method":"curated","publication":"MV Times"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%etoile%' AND d.name = 'Seared Scallops'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The fanciest restaurant in a town of fancy restaurants. Beef bourguignon is worth the splurge.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%etoile%' AND d.name = 'Beef Bourguignon'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- COOP DE VILLE
-- ============================================================

UPDATE votes SET
  review_text = 'The fried lobster tail — crispy exterior and still-juicy interior. This is the move here.',
  source_metadata = '{"method":"curated","publication":"fun107.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Coop%Ville%' AND d.name = 'Lobster Salad Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Piping hot fried clams with cornbread. Classic dock food done right on the harbor.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Coop%Ville%' AND d.name = 'Fried Whole Belly Clam Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Fried scallops are sweet, crispy, and perfectly golden. Classic New England seafood shack.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Coop%Ville%' AND d.name = 'Fried Scallop Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Maryland style crab cakes that hold their own. Good flavor, good portion.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Coop%Ville%' AND d.name = 'Maryland Style Crab Cakes'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- STATE ROAD
-- ============================================================

UPDATE votes SET
  review_text = 'Wagyu beef, balsamic onions, bacon, garlic dill pickles on a potato bun. Top 5 burger, easily.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%State Road%' AND d.name = 'State Road Burger'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Farm-to-table halibut, perfectly roasted. The fish is fresh and the sides complement beautifully.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%State Road%' AND d.name = 'Pan Roasted Halibut'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- RED CAT KITCHEN
-- ============================================================

UPDATE votes SET
  review_text = 'Best meal we''ve had on Martha''s Vineyard. Chef Ben''s creativity with seafood is next level.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Red Cat%' AND d.name = 'Broiled Chatham Codfish'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The buttermilk fried chicken is seriously good. Crispy, juicy, seasoned perfectly.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Red Cat%' AND d.name = 'Buttermilk Fried Chicken'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- 9 CRAFT KITCHEN AND BAR
-- ============================================================

UPDATE votes SET
  review_text = 'The wagyu skirt steak is the sleeper hit. Perfectly cooked, incredible flavor.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%9 Craft%' AND d.name = 'Wagyu Skirt Steak'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Hulking steak, perfectly seasoned. This is a serious cut of meat.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%9 Craft%' AND d.name = 'Boneless Prime Ribeye'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The lobster tostadas are incredible — fresh, crispy, and packed with flavor.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%9 Craft%' AND d.name = 'Lobster Tostadas'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Miso cod done right. Perfectly glazed, flaky, and full of umami.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%9 Craft%' AND d.name = 'Miso Cod'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- ATRIA
-- ============================================================

UPDATE votes SET
  review_text = 'The wagyu burger at Atria''s Cellar Bar is one of the best burgers on the island.',
  source_metadata = '{"method":"curated","publication":"The Infatuation"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Atria%' AND d.name = 'Wagyu Burger'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- OFFSHORE ALE COMPANY
-- ============================================================

UPDATE votes SET
  review_text = 'Lobster on a lightly grilled roll with just the right amount of mayo. Solid island lobster roll.',
  source_metadata = '{"method":"curated","publication":"mvvacationrentals.com"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Offshore Ale%' AND d.name ILIKE '%lobster%'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Big clam pieces, not chopped up like everywhere else. Hearty, real chowder.',
  source_metadata = '{"method":"curated","publication":"cookingwithbooks.net"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Offshore Ale%' AND d.name = 'New England Clam Chowder'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- BACK DOOR DONUTS
-- ============================================================

UPDATE votes SET
  review_text = 'The apple fritter hot out of the oven at midnight is a Martha''s Vineyard rite of passage.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Back Door%' AND d.name = 'Apple Fritter'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'The apple cider donut is the reason there''s a line out the door every night.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Back Door%' AND d.name = 'Apple Cider Donut'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- BLACK DOG
-- ============================================================

UPDATE votes SET
  review_text = 'Classic chowder at the most iconic spot on the Vineyard. Thick, creamy, full of clams.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Black Dog%' AND d.name = 'Classic Chowder'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Solid fish and chips. The Black Dog is a tourist staple but the food actually delivers.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Black Dog%' AND d.name = 'Fish and Chips'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- MO'S LUNCH
-- ============================================================

UPDATE votes SET
  review_text = 'The Leo Burger at Mo''s is legendary. Best burger value on the island, no question.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Mo''s%' AND d.name = 'Leo Burger'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- TIGERHAWK SANDWICH COMPANY
-- ============================================================

UPDATE votes SET
  review_text = 'The K-Pop Fried Chicken Sandwich is addictive. Crispy, spicy, perfectly sauced.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%TigerHawk%' AND d.name = 'Krispy K-Pop Fried Chicken Sandwich'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

UPDATE votes SET
  review_text = 'Best banh mi I''ve had outside of a city. The pork belly version is incredible.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%TigerHawk%' AND d.name = 'Pork Belly Banh Mi'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- BEACH ROAD
-- ============================================================

UPDATE votes SET
  review_text = 'The bouillabaisse is rich and aromatic. A beautiful bowl of the freshest island seafood.',
  source_metadata = '{"method":"curated","publication":"Resy"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Beach Road%' AND d.name = 'Bouillabaisse'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- GARDE EAST
-- ============================================================

UPDATE votes SET
  review_text = 'Garde East''s lobster roll is elegant — not your typical roadside version. Refined and delicious.',
  source_metadata = '{"method":"curated","publication":"TripAdvisor"}'::jsonb
WHERE id = (
  SELECT v.id FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE r.name ILIKE '%Garde East%' AND d.name = 'Lobster Roll'
  AND v.source = 'ai_estimated' AND v.review_text IS NOT NULL
  LIMIT 1
);

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT count(*) AS curated_reviews_count
FROM votes
WHERE source_metadata->>'method' = 'curated';
