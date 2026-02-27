-- ============================================================
-- Fix: handle_new_user trigger now reads display_name from metadata
-- ============================================================
-- The signup code passes { display_name: username } in user metadata,
-- but the trigger only checked for full_name/name (Google OAuth keys).
-- This caused password signups to create profiles with NULL display_name.
--
-- Fix: check display_name FIRST, then fall back to full_name/name.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, has_onboarded)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
