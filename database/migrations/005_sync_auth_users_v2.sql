/**
 * Sync Supabase Auth users to application users table (v2 - Permission-safe)
 * Run this in the Supabase SQL Editor (not via script)
 */

-- Step 1: Backfill existing auth users into users table FIRST
-- This uses a direct INSERT instead of relying on triggers
DO $$
BEGIN
  -- Sync all auth.users to public.users
  INSERT INTO public.users (id, email, name, created_at)
  SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    au.created_at
  FROM auth.users au
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RAISE NOTICE 'Backfilled % users', (SELECT COUNT(*) FROM public.users);
END $$;

-- Step 2: Create function to sync new auth users
-- This function will be called by a trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on auth.users
-- Note: This requires superuser privileges, which SQL Editor has
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Verify the setup
DO $$
DECLARE
  user_count INTEGER;
  auth_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO auth_count FROM auth.users;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Auth users: %', auth_count;
  RAISE NOTICE 'Public users: %', user_count;
  RAISE NOTICE 'Trigger created: on_auth_user_created';
  RAISE NOTICE '====================================';

  IF user_count < auth_count THEN
    RAISE WARNING 'Some auth users may not have synced!';
  END IF;
END $$;
