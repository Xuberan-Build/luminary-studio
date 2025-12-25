// Verify product step configuration
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyConfig() {
  console.log('Fetching product configuration...');

  const { data, error } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', 'quantum-initiation')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n✅ Product Configuration:');
  console.log('Product Slug:', data.product_slug);
  console.log('Total Steps:', data.total_steps);
  console.log('\nSteps:');
  console.log(JSON.stringify(data.steps, null, 2));
}

verifyConfig();
