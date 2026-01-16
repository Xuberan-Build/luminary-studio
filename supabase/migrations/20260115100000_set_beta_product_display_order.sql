-- Set display_order for the 11 core beta products and Perception master report

UPDATE product_definitions SET display_order = 1 WHERE product_slug = 'perception-rite-scan-1';
UPDATE product_definitions SET display_order = 2 WHERE product_slug = 'perception-rite-scan-2';
UPDATE product_definitions SET display_order = 3 WHERE product_slug = 'perception-rite-scan-3';
UPDATE product_definitions SET display_order = 4 WHERE product_slug = 'perception-rite-scan-4';
UPDATE product_definitions SET display_order = 5 WHERE product_slug = 'perception-rite-scan-5';

UPDATE product_definitions SET display_order = 6 WHERE product_slug = 'personal-alignment';
UPDATE product_definitions SET display_order = 7 WHERE product_slug = 'business-alignment';
UPDATE product_definitions SET display_order = 8 WHERE product_slug = 'brand-alignment';

UPDATE product_definitions SET display_order = 9 WHERE product_slug = 'declaration-rite-life-vision';
UPDATE product_definitions SET display_order = 10 WHERE product_slug = 'declaration-rite-business-model';
UPDATE product_definitions SET display_order = 11 WHERE product_slug = 'declaration-rite-strategic-path';

UPDATE product_definitions SET display_order = 99 WHERE product_slug = 'perception-rite-master';
