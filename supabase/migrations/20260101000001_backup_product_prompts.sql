-- =====================================================
-- BACKUP: Product Prompts Before Optimization
-- Creates safety backup of all product prompts
-- =====================================================

-- Create backup table
CREATE TABLE IF NOT EXISTS product_definitions_backup_20260101 AS
SELECT * FROM product_definitions;

-- Verify backup
DO $$
DECLARE
  backup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO backup_count FROM product_definitions_backup_20260101;
  RAISE NOTICE '✅ Backup created: % products backed up', backup_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Backup table: product_definitions_backup_20260101';
  RAISE NOTICE 'Rollback available if needed';
END $$;
