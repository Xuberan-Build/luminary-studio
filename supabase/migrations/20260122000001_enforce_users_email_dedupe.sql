BEGIN;

-- Normalize existing emails to prevent case/whitespace duplicates.
UPDATE public.users
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL
  AND email <> LOWER(TRIM(email));

-- Enforce email dedupe (case-insensitive) going forward.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_unique
  ON public.users ((LOWER(TRIM(email))));

-- Ensure new/updated emails are stored in normalized form.
CREATE OR REPLACE FUNCTION public.normalize_user_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := LOWER(TRIM(NEW.email));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_normalize_user_email ON public.users;
CREATE TRIGGER trigger_normalize_user_email
BEFORE INSERT OR UPDATE OF email ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.normalize_user_email();

COMMIT;
