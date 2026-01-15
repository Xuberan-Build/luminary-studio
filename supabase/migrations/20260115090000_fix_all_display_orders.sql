-- Fix display_order for ALL products
-- Perception Rite (Rite I): 1-5 (already set, but ensuring)
-- Orientation Rite (Rite II): 1-3
-- Declaration Rite (Rite III): 1-3

-- Rite I: Perception (should already be correct, but ensuring)
UPDATE product_definitions SET display_order = 1 WHERE product_slug = 'perception-rite-scan-1';
UPDATE product_definitions SET display_order = 2 WHERE product_slug = 'perception-rite-scan-2';
UPDATE product_definitions SET display_order = 3 WHERE product_slug = 'perception-rite-scan-3';
UPDATE product_definitions SET display_order = 4 WHERE product_slug = 'perception-rite-scan-4';
UPDATE product_definitions SET display_order = 5 WHERE product_slug = 'perception-rite-scan-5';
UPDATE product_definitions SET display_order = 99 WHERE product_slug = 'perception-rite-master';

-- Rite II: Orientation
UPDATE product_definitions SET product_group = 'orientation-rite', display_order = 1 WHERE product_slug = 'personal-alignment';
UPDATE product_definitions SET product_group = 'orientation-rite', display_order = 2 WHERE product_slug = 'business-alignment';
UPDATE product_definitions SET product_group = 'orientation-rite', display_order = 3 WHERE product_slug = 'brand-alignment';

-- Rite III: Declaration
UPDATE product_definitions SET product_group = 'declaration-rite', display_order = 1 WHERE product_slug = 'declaration-rite-life-vision';
UPDATE product_definitions SET product_group = 'declaration-rite', display_order = 2 WHERE product_slug = 'declaration-rite-business-model';
UPDATE product_definitions SET product_group = 'declaration-rite', display_order = 3 WHERE product_slug = 'declaration-rite-strategic-path';
