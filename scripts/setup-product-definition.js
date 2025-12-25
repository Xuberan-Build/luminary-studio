// Setup product definition for Quantum Initiation
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProduct() {
  console.log('Setting up Quantum Initiation product...');

  // Check if product already exists
  const { data: existing } = await supabase
    .from('product_definitions')
    .select('*')
    .eq('product_slug', 'quantum-initiation')
    .single();

  if (existing) {
    console.log('Product already exists!');
    return;
  }

  // Insert product definition
  const { data, error } = await supabase
    .from('product_definitions')
    .insert({
      product_slug: 'quantum-initiation',
      name: 'Quantum Initiation Protocol',
      description: 'A transformational journey to create your Quantum Brand Identity Blueprint using Astrology and Human Design.',
      total_steps: 5,
      estimated_duration: '15-20 minutes',
      system_prompt: `You are Quantum Brand Architect AI, a specialized guide that produces a single standardized deliverable called the Quantum Brand Identity Blueprint, based entirely on user-provided Astrology and/or Human Design data.`,
      deliverable_prompt: 'Generate a comprehensive Quantum Brand Identity Blueprint with all 10 sections based on the user\'s astrological and human design data.',
      steps: [
        {
          step_number: 1,
          title: 'Upload Your Charts',
          question: 'Please upload your natal chart and Human Design chart images.',
          description: 'We\'ll extract your placements from the images to create your personalized blueprint.',
          allow_file_upload: true,
          accepted_file_types: ['image/png', 'image/jpeg', 'image/jpg'],
          allow_followup: true
        },
        {
          step_number: 2,
          title: 'Confirm Your Placements',
          question: 'Please review and confirm the astrological placements we extracted from your chart.',
          description: 'Correct any inaccuracies and fill in any missing information.',
          allow_file_upload: false,
          allow_followup: true
        },
        {
          step_number: 3,
          title: 'Human Design Details',
          question: 'Please confirm your Human Design type, strategy, authority, and profile.',
          description: 'These core elements will shape your brand energy signature.',
          allow_file_upload: false,
          allow_followup: true
        },
        {
          step_number: 4,
          title: 'Brand Vision',
          question: 'What is your current vision for your brand or business?',
          description: 'Share any existing ideas, goals, or challenges you\'re facing.',
          allow_file_upload: false,
          allow_followup: true
        },
        {
          step_number: 5,
          title: 'Target Audience',
          question: 'Who do you envision serving with your brand?',
          description: 'Describe your ideal clients or customers.',
          allow_file_upload: false,
          allow_followup: true
        }
      ]
    });

  if (error) {
    console.error('Error creating product:', error);
    return;
  }

  console.log('✅ Product definition created!');
  console.log('Product:', data);
}

setupProduct();
