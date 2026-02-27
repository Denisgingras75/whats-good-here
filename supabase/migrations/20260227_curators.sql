-- Curated Local Lists — Migration
-- Run in Supabase SQL Editor
-- Adds curators + curator_picks tables, auto-vote trigger, and RLS policies

-- 1. Add curator source to votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_source_check;
ALTER TABLE votes ADD CONSTRAINT votes_source_check CHECK (source IN ('user', 'ai_estimated', 'curator'));

-- 2. Create curators table
CREATE TABLE IF NOT EXISTS curators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  specialty TEXT NOT NULL DEFAULT 'food',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create curator_picks table
CREATE TABLE IF NOT EXISTS curator_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curator_id UUID NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  rank_position INT NOT NULL CHECK (rank_position >= 1 AND rank_position <= 10),
  blurb TEXT,
  list_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (curator_id, list_category, rank_position)
);

-- 4. Auto-generate a vote when a curator pick is inserted
CREATE OR REPLACE FUNCTION create_vote_from_curator_pick()
RETURNS TRIGGER AS $$
DECLARE
  v_rating DECIMAL(3,1);
BEGIN
  -- Rank 1 = 9.8, rank 2 = 9.5, rank 3 = 9.2, ..., rank 10 = 7.1
  v_rating := 10.0 - (NEW.rank_position * 0.3) + 0.1;

  -- Only insert if curator has a user_id linked
  IF (SELECT user_id FROM curators WHERE id = NEW.curator_id) IS NOT NULL THEN
    INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, source, review_text)
    VALUES (
      NEW.dish_id,
      (SELECT user_id FROM curators WHERE id = NEW.curator_id),
      true,
      v_rating,
      'curator',
      NEW.blurb
    )
    ON CONFLICT (dish_id, user_id) WHERE source = 'user'
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS curator_pick_auto_vote ON curator_picks;
CREATE TRIGGER curator_pick_auto_vote
  AFTER INSERT ON curator_picks
  FOR EACH ROW
  EXECUTE FUNCTION create_vote_from_curator_pick();

-- 5. RLS: Curators — public read (active only), admin-only write
ALTER TABLE curators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active curators"
  ON curators FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage curators"
  ON curators FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin')
  );

-- 6. RLS: Curator picks — public read, admin-only write
ALTER TABLE curator_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view curator picks"
  ON curator_picks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage curator picks"
  ON curator_picks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin')
  );

-- 7. RPCs for curators

-- Get all active curators with pick counts
CREATE OR REPLACE FUNCTION get_curators()
RETURNS TABLE (
  curator_id UUID,
  curator_name TEXT,
  photo_url TEXT,
  bio TEXT,
  specialty TEXT,
  display_order INT,
  pick_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS curator_id,
    c.name AS curator_name,
    c.photo_url,
    c.bio,
    c.specialty,
    c.display_order,
    COUNT(cp.id) AS pick_count
  FROM curators c
  LEFT JOIN curator_picks cp ON cp.curator_id = c.id
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.photo_url, c.bio, c.specialty, c.display_order
  ORDER BY c.display_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get picks for a curator, optionally filtered by list category
CREATE OR REPLACE FUNCTION get_curator_picks(p_curator_id UUID, p_list_category TEXT DEFAULT NULL)
RETURNS TABLE (
  pick_id UUID,
  dish_id UUID,
  dish_name TEXT,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  restaurant_name TEXT,
  restaurant_town TEXT,
  rank_position INT,
  blurb TEXT,
  list_category TEXT,
  avg_rating DECIMAL,
  total_votes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id AS pick_id,
    d.id AS dish_id,
    d.name AS dish_name,
    d.category,
    d.price,
    d.photo_url,
    r.name AS restaurant_name,
    r.town AS restaurant_town,
    cp.rank_position,
    cp.blurb,
    cp.list_category,
    d.avg_rating,
    d.total_votes
  FROM curator_picks cp
  JOIN dishes d ON d.id = cp.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE cp.curator_id = p_curator_id
    AND (p_list_category IS NULL OR cp.list_category IS NOT DISTINCT FROM p_list_category)
  ORDER BY cp.rank_position ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get list categories for a curator with pick counts
CREATE OR REPLACE FUNCTION get_curator_list_categories(p_curator_id UUID)
RETURNS TABLE (
  list_category TEXT,
  pick_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.list_category,
    COUNT(*) AS pick_count
  FROM curator_picks cp
  WHERE cp.curator_id = p_curator_id
  GROUP BY cp.list_category
  ORDER BY cp.list_category NULLS FIRST;
END;
$$ LANGUAGE plpgsql STABLE;
