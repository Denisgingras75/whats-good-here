-- Special views tracking — anonymous view counts for restaurant owner engagement
-- Run in Supabase SQL Editor

-- Table
CREATE TABLE IF NOT EXISTS special_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id UUID NOT NULL REFERENCES specials(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_special_views_special ON special_views(special_id, viewed_at DESC);

-- RLS
ALTER TABLE special_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON special_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Managers read own restaurant views" ON special_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM specials s
      JOIN restaurant_managers rm ON rm.restaurant_id = s.restaurant_id
      WHERE s.id = special_views.special_id
        AND rm.user_id = (select auth.uid())
        AND rm.accepted_at IS NOT NULL
    )
    OR is_admin()
  );

-- RPC: aggregated view counts per special (last 7 days)
CREATE OR REPLACE FUNCTION get_special_view_counts(p_restaurant_id UUID)
RETURNS TABLE(special_id UUID, view_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT sv.special_id, COUNT(*)::BIGINT as view_count
  FROM special_views sv
  JOIN specials s ON s.id = sv.special_id
  WHERE s.restaurant_id = p_restaurant_id
    AND sv.viewed_at > NOW() - INTERVAL '7 days'
  GROUP BY sv.special_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also fix RLS policies that were admin-only (should be admin-or-manager)
DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;
CREATE POLICY "Admin or manager update restaurants" ON restaurants
  FOR UPDATE USING (is_admin() OR is_restaurant_manager(id));

DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;
CREATE POLICY "Admin or manager delete dishes" ON dishes
  FOR DELETE USING (is_admin() OR is_restaurant_manager(restaurant_id));
