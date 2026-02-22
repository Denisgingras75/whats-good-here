-- Fix update_dish_avg_rating trigger to apply 0.5x source weighting for ai_estimated votes
-- This matches the weighting used in get_ranked_dishes and get_restaurant_dishes RPCs
-- Run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_dish_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dishes SET avg_rating = sub.avg_r, total_votes = sub.cnt
  FROM (
    SELECT
      ROUND(
        (SUM(rating_10 * CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END) /
         NULLIF(SUM(CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END), 0)
        )::NUMERIC, 1
      ) AS avg_r,
      SUM(CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END)::BIGINT AS cnt
    FROM votes WHERE dish_id = COALESCE(NEW.dish_id, OLD.dish_id) AND rating_10 IS NOT NULL
  ) sub
  WHERE dishes.id = COALESCE(NEW.dish_id, OLD.dish_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recompute all dish ratings with correct weighting
UPDATE dishes d SET
  avg_rating = sub.avg_r,
  total_votes = sub.cnt
FROM (
  SELECT
    dish_id,
    ROUND(
      (SUM(rating_10 * CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END) /
       NULLIF(SUM(CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END), 0)
      )::NUMERIC, 1
    ) AS avg_r,
    SUM(CASE WHEN source = 'ai_estimated' THEN 0.5 ELSE 1.0 END)::BIGINT AS cnt
  FROM votes
  WHERE rating_10 IS NOT NULL
  GROUP BY dish_id
) sub
WHERE d.id = sub.dish_id;

-- Verify
SELECT 'Dishes updated:' AS label, COUNT(*) AS count FROM dishes WHERE total_votes > 0;
