/**
 * Sync Supabase Auth users to application users table
 * This ensures every authenticated user has a record in the users table
 *
 * IMPORTANT: This migration modifies the users table to use auth.users IDs
 * and creates a trigger to automatically sync new auth users.
 */

-- Step 1: Create function to sync auth user to users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill existing auth users into users table
-- This will sync all existing authenticated users
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

-- Step 4: Update any orphaned product_access records to use correct user IDs
-- This fixes any product_access records that were created with mismatched user IDs
UPDATE product_access pa
SET user_id = u.id
FROM users u
WHERE u.email = (
  SELECT email FROM users WHERE id = pa.user_id
)
AND pa.user_id != u.id
AND EXISTS (
  SELECT 1 FROM auth.users au WHERE au.id = u.id
);

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates/updates a user record in public.users when auth.users is created/updated';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Syncs auth.users to public.users table automatically';
