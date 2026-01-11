-- Fix audit log trigger to avoid referencing users.full_name (not present)

CREATE OR REPLACE FUNCTION log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    NEW.id,
    'auth',
    'user_created',
    'success',
    jsonb_build_object(
      'email', NEW.email,
      'name', NEW.name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION log_user_creation() SET search_path = public;
