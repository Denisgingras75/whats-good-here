-- =============================================
-- Personal Food Diary — dish_logs, shelves, shelf_items
-- Goodreads/Letterboxd model for dishes
-- =============================================

-- 1. TABLES
-- =============================================

-- dish_logs: personal diary entries (timeline of what you ate)
CREATE TABLE IF NOT EXISTS dish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  note TEXT,
  occasion TEXT,          -- 'date night', 'family dinner', 'solo lunch', 'celebration'
  dining_with TEXT,       -- free text: "with Sarah and Mike"
  photo_url TEXT,
  rating_5 SMALLINT CHECK (rating_5 IS NULL OR (rating_5 >= 1 AND rating_5 <= 5)),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shelves: user-created collections
CREATE TABLE IF NOT EXISTS shelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  shelf_type TEXT NOT NULL DEFAULT 'custom'
    CHECK (shelf_type IN ('tried', 'want_to_try', 'top_10', 'custom')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shelf_items: dishes on a shelf
CREATE TABLE IF NOT EXISTS shelf_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_id UUID NOT NULL REFERENCES shelves(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  note TEXT,
  sort_order INT DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shelf_id, dish_id)
);


-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_dish_logs_user ON dish_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dish_logs_dish ON dish_logs(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_logs_logged_at ON dish_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_shelves_user ON shelves(user_id);
CREATE INDEX IF NOT EXISTS idx_shelves_type ON shelves(user_id, shelf_type);

CREATE INDEX IF NOT EXISTS idx_shelf_items_shelf ON shelf_items(shelf_id);
CREATE INDEX IF NOT EXISTS idx_shelf_items_dish ON shelf_items(dish_id);


-- 3. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE dish_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelf_items ENABLE ROW LEVEL SECURITY;

-- dish_logs: users manage own, public can see (for social feed)
CREATE POLICY "dish_logs_select" ON dish_logs
  FOR SELECT USING (true);
CREATE POLICY "dish_logs_insert_own" ON dish_logs
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "dish_logs_update_own" ON dish_logs
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "dish_logs_delete_own" ON dish_logs
  FOR DELETE USING ((select auth.uid()) = user_id);

-- shelves: public shelves readable by all, private only by owner
CREATE POLICY "shelves_select" ON shelves
  FOR SELECT USING (is_public = true OR (select auth.uid()) = user_id);
CREATE POLICY "shelves_insert_own" ON shelves
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "shelves_update_own" ON shelves
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "shelves_delete_own" ON shelves
  FOR DELETE USING ((select auth.uid()) = user_id AND is_default = false);

-- shelf_items: visible if shelf is visible, managed by shelf owner
CREATE POLICY "shelf_items_select" ON shelf_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shelves s
      WHERE s.id = shelf_items.shelf_id
      AND (s.is_public = true OR (select auth.uid()) = s.user_id)
    )
  );
CREATE POLICY "shelf_items_insert_own" ON shelf_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shelves s
      WHERE s.id = shelf_items.shelf_id
      AND (select auth.uid()) = s.user_id
    )
  );
CREATE POLICY "shelf_items_update_own" ON shelf_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shelves s
      WHERE s.id = shelf_items.shelf_id
      AND (select auth.uid()) = s.user_id
    )
  );
CREATE POLICY "shelf_items_delete_own" ON shelf_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shelves s
      WHERE s.id = shelf_items.shelf_id
      AND (select auth.uid()) = s.user_id
    )
  );


-- 4. TRIGGERS
-- =============================================

-- Auto-create default shelves when a user signs up
CREATE OR REPLACE FUNCTION create_default_shelves()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shelves (user_id, name, shelf_type, is_default, sort_order) VALUES
    (NEW.id, 'Tried', 'tried', true, 0),
    (NEW.id, 'Want to Try', 'want_to_try', true, 1),
    (NEW.id, 'Top 10', 'top_10', true, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_shelves
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_shelves();

-- Auto-add to "Tried" shelf when logging a dish
CREATE OR REPLACE FUNCTION auto_add_to_tried_shelf()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shelf_items (shelf_id, dish_id)
  SELECT s.id, NEW.dish_id
  FROM shelves s
  WHERE s.user_id = NEW.user_id AND s.shelf_type = 'tried'
  ON CONFLICT (shelf_id, dish_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dish_logged
  AFTER INSERT ON dish_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_to_tried_shelf();

-- Auto-remove from "Want to Try" when dish is logged (you tried it)
CREATE OR REPLACE FUNCTION auto_remove_from_want_to_try()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM shelf_items si
  USING shelves s
  WHERE si.shelf_id = s.id
    AND s.user_id = NEW.user_id
    AND s.shelf_type = 'want_to_try'
    AND si.dish_id = NEW.dish_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dish_logged_remove_want
  AFTER INSERT ON dish_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_remove_from_want_to_try();


-- 5. RPCs
-- =============================================

-- Get user's diary feed (timeline of logged dishes with restaurant info)
CREATE OR REPLACE FUNCTION get_diary_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  log_id UUID,
  dish_id UUID,
  dish_name TEXT,
  restaurant_name TEXT,
  restaurant_id UUID,
  category TEXT,
  note TEXT,
  occasion TEXT,
  dining_with TEXT,
  photo_url TEXT,
  rating_5 SMALLINT,
  logged_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dl.id AS log_id,
    dl.dish_id,
    d.name AS dish_name,
    r.name AS restaurant_name,
    r.id AS restaurant_id,
    d.category,
    dl.note,
    dl.occasion,
    dl.dining_with,
    COALESCE(dl.photo_url, d.photo_url) AS photo_url,
    dl.rating_5,
    dl.logged_at
  FROM dish_logs dl
  JOIN dishes d ON d.id = dl.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE dl.user_id = p_user_id
  ORDER BY dl.logged_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's shelves with item counts
CREATE OR REPLACE FUNCTION get_user_shelves(
  p_user_id UUID
)
RETURNS TABLE (
  shelf_id UUID,
  shelf_name TEXT,
  shelf_type TEXT,
  description TEXT,
  is_public BOOLEAN,
  is_default BOOLEAN,
  item_count BIGINT,
  sort_order INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS shelf_id,
    s.name AS shelf_name,
    s.shelf_type,
    s.description,
    s.is_public,
    s.is_default,
    COUNT(si.id) AS item_count,
    s.sort_order
  FROM shelves s
  LEFT JOIN shelf_items si ON si.shelf_id = s.id
  WHERE s.user_id = p_user_id
  GROUP BY s.id
  ORDER BY s.sort_order, s.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get items on a shelf with dish + restaurant info
CREATE OR REPLACE FUNCTION get_shelf_items(
  p_shelf_id UUID
)
RETURNS TABLE (
  item_id UUID,
  dish_id UUID,
  dish_name TEXT,
  restaurant_name TEXT,
  restaurant_id UUID,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  avg_rating DECIMAL,
  note TEXT,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id AS item_id,
    si.dish_id,
    d.name AS dish_name,
    r.name AS restaurant_name,
    r.id AS restaurant_id,
    d.category,
    d.price,
    d.photo_url,
    d.avg_rating,
    si.note,
    si.added_at
  FROM shelf_items si
  JOIN dishes d ON d.id = si.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE si.shelf_id = p_shelf_id
  ORDER BY si.sort_order, si.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get friends' recent dish logs (social feed)
CREATE OR REPLACE FUNCTION get_friends_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  log_id UUID,
  user_id UUID,
  display_name TEXT,
  dish_id UUID,
  dish_name TEXT,
  restaurant_name TEXT,
  restaurant_id UUID,
  category TEXT,
  note TEXT,
  rating_5 SMALLINT,
  logged_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dl.id AS log_id,
    dl.user_id,
    p.display_name,
    dl.dish_id,
    d.name AS dish_name,
    r.name AS restaurant_name,
    r.id AS restaurant_id,
    d.category,
    dl.note,
    dl.rating_5,
    dl.logged_at
  FROM dish_logs dl
  JOIN follows f ON f.followed_id = dl.user_id AND f.follower_id = p_user_id
  JOIN dishes d ON d.id = dl.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  JOIN profiles p ON p.id = dl.user_id
  ORDER BY dl.logged_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's taste stats (for profile / Wrapped-style summary)
CREATE OR REPLACE FUNCTION get_taste_stats(
  p_user_id UUID
)
RETURNS TABLE (
  total_dishes_tried BIGINT,
  total_restaurants BIGINT,
  favorite_category TEXT,
  favorite_restaurant TEXT,
  avg_rating NUMERIC,
  dishes_this_month BIGINT,
  longest_streak INT
) AS $$
DECLARE
  v_fav_category TEXT;
  v_fav_restaurant TEXT;
  v_streak INT := 0;
BEGIN
  -- Most logged category
  SELECT d.category INTO v_fav_category
  FROM dish_logs dl
  JOIN dishes d ON d.id = dl.dish_id
  WHERE dl.user_id = p_user_id
  GROUP BY d.category
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Most logged restaurant
  SELECT r.name INTO v_fav_restaurant
  FROM dish_logs dl
  JOIN dishes d ON d.id = dl.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE dl.user_id = p_user_id
  GROUP BY r.name
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT dl2.dish_id) FROM dish_logs dl2 WHERE dl2.user_id = p_user_id) AS total_dishes_tried,
    (SELECT COUNT(DISTINCT d2.restaurant_id) FROM dish_logs dl3 JOIN dishes d2 ON d2.id = dl3.dish_id WHERE dl3.user_id = p_user_id) AS total_restaurants,
    v_fav_category AS favorite_category,
    v_fav_restaurant AS favorite_restaurant,
    (SELECT ROUND(AVG(dl4.rating_5)::NUMERIC, 1) FROM dish_logs dl4 WHERE dl4.user_id = p_user_id AND dl4.rating_5 IS NOT NULL) AS avg_rating,
    (SELECT COUNT(*) FROM dish_logs dl5 WHERE dl5.user_id = p_user_id AND dl5.logged_at >= DATE_TRUNC('month', NOW())) AS dishes_this_month,
    0 AS longest_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
