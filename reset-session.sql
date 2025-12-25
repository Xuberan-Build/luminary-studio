-- This will reset your Quantum Initiation session back to step 1
-- while keeping your placements data intact

UPDATE product_sessions
SET 
  is_complete = false,
  completed_at = NULL,
  deliverable_content = NULL,
  deliverable_generated_at = NULL,
  current_step = 1,
  current_section = 1,
  placements_confirmed = false
WHERE 
  product_slug = 'quantum-initiation'
  AND user_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);
