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
