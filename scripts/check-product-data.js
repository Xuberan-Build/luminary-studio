// Check product data in database
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProduct() {
  const { data: product, error } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', 'quantum-initiation')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Product:', JSON.stringify(product, null, 2));
  console.log('\nSteps array length:', product.steps?.length);
  console.log('Total steps field:', product.total_steps);
}

checkProduct();
