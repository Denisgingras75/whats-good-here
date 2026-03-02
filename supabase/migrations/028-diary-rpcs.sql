-- 028: Diary RPCs — personal food diary, shelves, friends feed, taste stats
-- Tables (dish_logs, shelves, shelf_items) already exist in schema.sql
-- This migration creates the 5 RPCs that diaryApi.js calls

-- ── Auto-create default shelves on profile creation ──
CREATE OR REPLACE FUNCTION create_default_shelves()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO shelves (user_id, name, shelf_type, is_default, is_public, sort_order) VALUES
    (NEW.id, 'Tried', 'tried', true, false, 0),
    (NEW.id, 'Want to Try', 'want_to_try', true, false, 1),
    (NEW.id, 'Top 10', 'top_10', true, true, 2);
  RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_create_shelves'
  ) THEN
    CREATE TRIGGER on_profile_create_shelves
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION create_default_shelves();
  END IF;
END;
$$;


-- ── get_diary_feed ──
-- Returns user's diary: dish_logs + votes merged chronologically
CREATE OR REPLACE FUNCTION get_diary_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  entry_id UUID,
  entry_type TEXT,
  dish_id UUID,
  dish_name TEXT,
  dish_category TEXT,
  dish_photo_url TEXT,
  dish_price DECIMAL,
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_town TEXT,
  rating_10 DECIMAL,
  rating_5 SMALLINT,
  would_order_again BOOLEAN,
  review_text TEXT,
  note TEXT,
  occasion TEXT,
  dining_with TEXT,
  logged_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  (
    -- Votes as diary entries
    SELECT
      v.id AS entry_id,
      'vote'::TEXT AS entry_type,
      d.id AS dish_id,
      d.name AS dish_name,
      d.category AS dish_category,
      d.photo_url AS dish_photo_url,
      d.price AS dish_price,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.town AS restaurant_town,
      v.rating_10,
      NULL::SMALLINT AS rating_5,
      v.would_order_again,
      v.review_text,
      NULL::TEXT AS note,
      NULL::TEXT AS occasion,
      NULL::TEXT AS dining_with,
      v.created_at AS logged_at
    FROM votes v
    JOIN dishes d ON d.id = v.dish_id
    JOIN restaurants r ON r.id = d.restaurant_id
    WHERE v.user_id = p_user_id
      AND v.source = 'user'

    UNION ALL

    -- Dish logs as diary entries
    SELECT
      dl.id AS entry_id,
      'log'::TEXT AS entry_type,
      d.id AS dish_id,
      d.name AS dish_name,
      d.category AS dish_category,
      d.photo_url AS dish_photo_url,
      d.price AS dish_price,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.town AS restaurant_town,
      NULL::DECIMAL AS rating_10,
      dl.rating_5,
      NULL::BOOLEAN AS would_order_again,
      NULL::TEXT AS review_text,
      dl.note,
      dl.occasion,
      dl.dining_with,
      dl.logged_at
    FROM dish_logs dl
    JOIN dishes d ON d.id = dl.dish_id
    JOIN restaurants r ON r.id = d.restaurant_id
    WHERE dl.user_id = p_user_id
  )
  ORDER BY logged_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


-- ── get_user_shelves ──
-- Returns all shelves for a user with item counts
CREATE OR REPLACE FUNCTION get_user_shelves(p_user_id UUID)
RETURNS TABLE (
  shelf_id UUID,
  shelf_name TEXT,
  shelf_description TEXT,
  shelf_type TEXT,
  is_default BOOLEAN,
  is_public BOOLEAN,
  sort_order INT,
  item_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS shelf_id,
    s.name AS shelf_name,
    s.description AS shelf_description,
    s.shelf_type,
    s.is_default,
    s.is_public,
    s.sort_order,
    COUNT(si.id) AS item_count,
    s.created_at
  FROM shelves s
  LEFT JOIN shelf_items si ON si.shelf_id = s.id
  WHERE s.user_id = p_user_id
  GROUP BY s.id
  ORDER BY s.sort_order ASC, s.created_at ASC;
END;
$$;


-- ── get_shelf_items ──
-- Returns all items in a shelf with dish + restaurant details
CREATE OR REPLACE FUNCTION get_shelf_items(p_shelf_id UUID)
RETURNS TABLE (
  item_id UUID,
  dish_id UUID,
  dish_name TEXT,
  dish_category TEXT,
  dish_photo_url TEXT,
  dish_price DECIMAL,
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_town TEXT,
  item_note TEXT,
  item_sort_order INT,
  added_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id AS item_id,
    d.id AS dish_id,
    d.name AS dish_name,
    d.category AS dish_category,
    d.photo_url AS dish_photo_url,
    d.price AS dish_price,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.town AS restaurant_town,
    si.note AS item_note,
    si.sort_order AS item_sort_order,
    si.added_at
  FROM shelf_items si
  JOIN dishes d ON d.id = si.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE si.shelf_id = p_shelf_id
  ORDER BY si.sort_order ASC, si.added_at DESC;
END;
$$;


-- ── get_friends_feed ──
-- Returns recent activity from followed users (votes + dish_logs)
CREATE OR REPLACE FUNCTION get_friends_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  entry_id UUID,
  entry_type TEXT,
  user_id UUID,
  user_display_name TEXT,
  dish_id UUID,
  dish_name TEXT,
  dish_category TEXT,
  dish_photo_url TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_town TEXT,
  rating_10 DECIMAL,
  would_order_again BOOLEAN,
  review_text TEXT,
  note TEXT,
  logged_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  (
    -- Friends' votes
    SELECT
      v.id AS entry_id,
      'vote'::TEXT AS entry_type,
      v.user_id,
      p.display_name AS user_display_name,
      d.id AS dish_id,
      d.name AS dish_name,
      d.category AS dish_category,
      d.photo_url AS dish_photo_url,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.town AS restaurant_town,
      v.rating_10,
      v.would_order_again,
      v.review_text,
      NULL::TEXT AS note,
      v.created_at AS logged_at
    FROM votes v
    JOIN follows f ON f.followed_id = v.user_id AND f.follower_id = p_user_id
    JOIN dishes d ON d.id = v.dish_id
    JOIN restaurants r ON r.id = d.restaurant_id
    JOIN profiles p ON p.id = v.user_id
    WHERE v.source = 'user'

    UNION ALL

    -- Friends' dish logs
    SELECT
      dl.id AS entry_id,
      'log'::TEXT AS entry_type,
      dl.user_id,
      p.display_name AS user_display_name,
      d.id AS dish_id,
      d.name AS dish_name,
      d.category AS dish_category,
      d.photo_url AS dish_photo_url,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.town AS restaurant_town,
      NULL::DECIMAL AS rating_10,
      NULL::BOOLEAN AS would_order_again,
      NULL::TEXT AS review_text,
      dl.note,
      dl.logged_at
    FROM dish_logs dl
    JOIN follows f ON f.followed_id = dl.user_id AND f.follower_id = p_user_id
    JOIN dishes d ON d.id = dl.dish_id
    JOIN restaurants r ON r.id = d.restaurant_id
    JOIN profiles p ON p.id = dl.user_id
  )
  ORDER BY logged_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


-- ── get_taste_stats ──
-- Returns dining personality stats computed from votes + dish_logs
CREATE OR REPLACE FUNCTION get_taste_stats(p_user_id UUID)
RETURNS TABLE (
  total_dishes_tried INT,
  total_restaurants INT,
  unique_categories INT,
  total_categories INT,
  avg_rating DECIMAL,
  worth_it_ratio DECIMAL,
  category_variety_score DECIMAL,
  restaurant_loyalty_score DECIMAL,
  personality_type TEXT,
  personality_label TEXT,
  top_category TEXT,
  top_restaurant TEXT,
  monthly_avg DECIMAL,
  streak_days INT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_total_dishes INT;
  v_total_restaurants INT;
  v_unique_cats INT;
  v_total_cats INT;
  v_avg_rating DECIMAL;
  v_worth_it_ratio DECIMAL;
  v_cat_variety DECIMAL;
  v_rest_loyalty DECIMAL;
  v_personality TEXT;
  v_personality_label TEXT;
  v_top_cat TEXT;
  v_top_rest TEXT;
  v_monthly_avg DECIMAL;
  v_streak INT;
  v_max_rest_count INT;
BEGIN
  -- Total unique dishes tried (voted on)
  SELECT COUNT(DISTINCT votes.dish_id) INTO v_total_dishes
  FROM votes WHERE votes.user_id = p_user_id AND votes.source = 'user';

  -- Total unique restaurants
  SELECT COUNT(DISTINCT d.restaurant_id) INTO v_total_restaurants
  FROM votes v JOIN dishes d ON d.id = v.dish_id
  WHERE v.user_id = p_user_id AND v.source = 'user';

  -- Category stats
  SELECT COUNT(DISTINCT d.category), COUNT(d.category) INTO v_unique_cats, v_total_cats
  FROM votes v JOIN dishes d ON d.id = v.dish_id
  WHERE v.user_id = p_user_id AND v.source = 'user' AND d.category IS NOT NULL;

  -- Average rating
  SELECT ROUND(AVG(votes.rating_10)::NUMERIC, 1) INTO v_avg_rating
  FROM votes WHERE votes.user_id = p_user_id AND votes.source = 'user' AND votes.rating_10 IS NOT NULL;

  -- Worth-it ratio
  SELECT CASE WHEN COUNT(*) > 0
    THEN ROUND(COUNT(*) FILTER (WHERE votes.would_order_again = true)::DECIMAL / COUNT(*)::DECIMAL, 2)
    ELSE 0 END INTO v_worth_it_ratio
  FROM votes WHERE votes.user_id = p_user_id AND votes.source = 'user';

  -- Category variety (normalized Herfindahl — 0 = all same category, 1 = perfectly spread)
  SELECT CASE WHEN v_total_cats > 0
    THEN ROUND((1.0 - (
      SELECT SUM(pct * pct) FROM (
        SELECT COUNT(*)::DECIMAL / v_total_cats AS pct
        FROM votes v JOIN dishes d ON d.id = v.dish_id
        WHERE v.user_id = p_user_id AND v.source = 'user' AND d.category IS NOT NULL
        GROUP BY d.category
      ) sub
    ))::NUMERIC, 2)
    ELSE 0 END INTO v_cat_variety;

  -- Restaurant loyalty (max % of votes at any single restaurant)
  SELECT COALESCE(MAX(cnt), 0) INTO v_max_rest_count FROM (
    SELECT COUNT(*) AS cnt
    FROM votes v JOIN dishes d ON d.id = v.dish_id
    WHERE v.user_id = p_user_id AND v.source = 'user'
    GROUP BY d.restaurant_id
  ) sub;

  v_rest_loyalty := CASE WHEN v_total_dishes > 0
    THEN ROUND(v_max_rest_count::DECIMAL / v_total_dishes::DECIMAL, 2)
    ELSE 0 END;

  -- Top category
  SELECT d.category INTO v_top_cat
  FROM votes v JOIN dishes d ON d.id = v.dish_id
  WHERE v.user_id = p_user_id AND v.source = 'user' AND d.category IS NOT NULL
  GROUP BY d.category ORDER BY COUNT(*) DESC LIMIT 1;

  -- Top restaurant
  SELECT r.name INTO v_top_rest
  FROM votes v JOIN dishes d ON d.id = v.dish_id JOIN restaurants r ON r.id = d.restaurant_id
  WHERE v.user_id = p_user_id AND v.source = 'user'
  GROUP BY r.name ORDER BY COUNT(*) DESC LIMIT 1;

  -- Monthly average (votes in last 90 days / 3)
  SELECT ROUND(COUNT(*)::DECIMAL / 3.0, 1) INTO v_monthly_avg
  FROM votes WHERE votes.user_id = p_user_id AND votes.source = 'user'
    AND votes.created_at > NOW() - INTERVAL '90 days';

  -- Current streak (consecutive days with at least one vote, ending today or yesterday)
  WITH vote_dates AS (
    SELECT DISTINCT DATE(votes.created_at) AS d
    FROM votes WHERE votes.user_id = p_user_id AND votes.source = 'user'
  ),
  ranked AS (
    SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d))::INT AS grp
    FROM vote_dates
  ),
  streaks AS (
    SELECT grp, MIN(d) AS start_d, MAX(d) AS end_d, COUNT(*) AS len
    FROM ranked GROUP BY grp
  )
  SELECT COALESCE(MAX(len), 0)::INT INTO v_streak
  FROM streaks
  WHERE end_d >= CURRENT_DATE - 1;

  -- Personality type determination
  IF v_total_dishes < 3 THEN
    v_personality := 'newcomer';
    v_personality_label := 'Just Getting Started';
  ELSIF v_cat_variety > 0.75 AND v_total_restaurants > 5 THEN
    v_personality := 'explorer';
    v_personality_label := 'The Explorer';
  ELSIF v_rest_loyalty > 0.4 THEN
    v_personality := 'loyal_regular';
    v_personality_label := 'Loyal Regular';
  ELSIF v_avg_rating IS NOT NULL AND v_avg_rating < 6.0 THEN
    v_personality := 'selective_critic';
    v_personality_label := 'Selective Critic';
  ELSIF v_worth_it_ratio > 0.85 THEN
    v_personality := 'comfort_seeker';
    v_personality_label := 'Comfort Seeker';
  ELSIF v_cat_variety > 0.6 THEN
    v_personality := 'adventurous';
    v_personality_label := 'Adventurous Eater';
  ELSE
    v_personality := 'balanced';
    v_personality_label := 'Balanced Foodie';
  END IF;

  RETURN QUERY SELECT
    v_total_dishes,
    v_total_restaurants,
    v_unique_cats,
    v_total_cats,
    v_avg_rating,
    v_worth_it_ratio,
    v_cat_variety,
    v_rest_loyalty,
    v_personality,
    v_personality_label,
    v_top_cat,
    v_top_rest,
    v_monthly_avg,
    v_streak;
END;
$$;
