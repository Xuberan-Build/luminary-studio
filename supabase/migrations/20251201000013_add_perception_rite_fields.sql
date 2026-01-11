-- Add Rite I support fields (non-destructive)

-- product_definitions: grouping + display control
ALTER TABLE product_definitions
  ADD COLUMN IF NOT EXISTS product_group TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER,
  ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT TRUE;

-- product_access: record purchase origin for bundle attribution
ALTER TABLE product_access
  ADD COLUMN IF NOT EXISTS purchase_source TEXT,
  ADD COLUMN IF NOT EXISTS bundle_slug TEXT;

-- product_sessions: scan metadata + master report provenance
ALTER TABLE product_sessions
  ADD COLUMN IF NOT EXISTS scan_number INTEGER,
  ADD COLUMN IF NOT EXISTS parent_product_slug TEXT;

-- Indexes to support Rite I hub queries
CREATE INDEX IF NOT EXISTS idx_product_definitions_group_order
  ON product_definitions(product_group, display_order);

CREATE INDEX IF NOT EXISTS idx_product_access_purchase_source
  ON product_access(user_id, purchase_source);

CREATE INDEX IF NOT EXISTS idx_product_sessions_scan_number
  ON product_sessions(user_id, scan_number);

-- Comments for documentation
COMMENT ON COLUMN product_definitions.product_group IS 'Logical grouping for product families (e.g., perception-rite)';
COMMENT ON COLUMN product_definitions.display_order IS 'Sort order within a product group';
COMMENT ON COLUMN product_definitions.is_purchasable IS 'Whether this product should appear as a purchasable item in UI';
COMMENT ON COLUMN product_access.purchase_source IS 'Purchase origin: single or bundle';
COMMENT ON COLUMN product_access.bundle_slug IS 'Bundle slug granting access, when applicable';
COMMENT ON COLUMN product_sessions.scan_number IS 'Rite I scan index (1-5)';
COMMENT ON COLUMN product_sessions.parent_product_slug IS 'Parent product family slug for synthesized reports';
