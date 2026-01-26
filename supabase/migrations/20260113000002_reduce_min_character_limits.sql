-- Reduce minimum character limits across perception scans
-- Previous minimums were 40-60 characters, which were too restrictive based on beta feedback
-- New minimum is 10 characters (enough to prevent single-word answers but not overly restrictive)

-- Update perception-rite-scan-2 (Value Pattern Decoder)
UPDATE product_definitions
SET steps = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            steps,
            '{2,text_input,min_length}',
            '10'
          ),
          '{3,text_input,min_length}',
          '10'
        ),
        '{4,text_input,min_length}',
        '10'
      ),
      '{5,text_input,min_length}',
      '10'
    ),
    '{6,text_input,min_length}',
    '10'
  ),
  '{7,text_input,min_length}',
  '10'
)
WHERE product_slug = 'perception-rite-scan-2';

-- Update perception-rite-scan-3 (Boundary & Burnout)
UPDATE product_definitions
SET steps = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                steps,
                '{0,text_input,min_length}',
                '10'
              ),
              '{1,text_input,min_length}',
              '10'
            ),
            '{2,text_input,min_length}',
            '10'
          ),
          '{3,text_input,min_length}',
          '10'
        ),
        '{4,text_input,min_length}',
        '15'
      ),
      '{5,text_input,min_length}',
      '15'
    ),
    '{6,text_input,min_length}',
    '10'
  ),
  '{7,text_input,min_length}',
  '15'
)
WHERE product_slug = 'perception-rite-scan-3';
