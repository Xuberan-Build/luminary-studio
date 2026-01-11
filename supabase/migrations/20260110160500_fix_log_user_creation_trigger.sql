-- Ensure user creation audit trigger does not reference users.full_name

DROP TRIGGER IF EXISTS trigger_log_user_creation ON users;

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

CREATE TRIGGER trigger_log_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_creation();
