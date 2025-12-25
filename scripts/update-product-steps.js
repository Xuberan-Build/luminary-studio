// Update product steps to start with file upload
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateProduct() {
  console.log('Updating product steps...');

  const { data, error } = await supabase
    .from('product_definitions')
    .update({
      steps: [
        {
          step_number: 1,
          title: 'Upload Your Charts',
          description: 'Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Quantum Brand Identity Blueprint.',
          allow_file_upload: true,
          accepted_file_types: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
          allow_followup: false,
          max_followups: 0
        }
      ],
      total_steps: 1,
      system_prompt: `You are Quantum Brand Architect AI, a specialized guide that produces a Quantum Brand Identity Blueprint based on Astrology and Human Design data extracted from uploaded charts.`
    })
    .eq('product_slug', 'quantum-initiation');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✅ Product updated with file upload step!');
}

updateProduct();
