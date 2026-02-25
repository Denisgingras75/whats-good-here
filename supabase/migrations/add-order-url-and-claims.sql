-- Migration: Add order_url to restaurants + restaurant_claims table
-- Run in Supabase SQL Editor

-- 1. Add order_url column to restaurants
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS order_url TEXT;

-- 2. Create restaurant_claims table
CREATE TABLE IF NOT EXISTS restaurant_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  message TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- 3. Enable RLS on restaurant_claims
ALTER TABLE restaurant_claims ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for restaurant_claims
CREATE POLICY "Users can view own claims" ON restaurant_claims
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all claims" ON restaurant_claims
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can create claims" ON restaurant_claims
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update claims" ON restaurant_claims
  FOR UPDATE USING (is_admin());

-- 5. Update get_ranked_dishes to include order_url
-- (Run the full CREATE OR REPLACE from schema.sql after this migration)

-- 6. Update get_restaurant_dishes to include order_url
-- (Run the full CREATE OR REPLACE from schema.sql after this migration)
