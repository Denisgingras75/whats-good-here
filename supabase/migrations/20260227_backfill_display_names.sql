-- ============================================================
-- Backfill: Set display_name for users who signed up via password
-- ============================================================
-- Users who signed up with email/password had display_name stored
-- in raw_user_meta_data but the trigger didn't read it.
-- This backfills those profiles.
-- ============================================================

UPDATE public.profiles p
SET display_name = COALESCE(
  u.raw_user_meta_data->>'display_name',
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'name'
)
FROM auth.users u
WHERE p.id = u.id
  AND p.display_name IS NULL
  AND (
    u.raw_user_meta_data->>'display_name' IS NOT NULL
    OR u.raw_user_meta_data->>'full_name' IS NOT NULL
    OR u.raw_user_meta_data->>'name' IS NOT NULL
  );
