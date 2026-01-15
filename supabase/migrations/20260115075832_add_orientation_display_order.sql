-- Add display_order and product_group for Orientation products
-- These were missing when the columns were added in 20251201000013

UPDATE product_definitions
SET product_group = 'orientation-rite', display_order = 1
WHERE product_slug = 'personal-alignment';

UPDATE product_definitions
SET product_group = 'orientation-rite', display_order = 2
WHERE product_slug = 'business-alignment';

UPDATE product_definitions
SET product_group = 'orientation-rite', display_order = 3
WHERE product_slug = 'brand-alignment';
