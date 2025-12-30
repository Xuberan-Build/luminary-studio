#!/usr/bin/env tsx

/**
 * Debug Placements Data
 * Shows the actual JSONB placements structure
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugPlacements() {
  const { data: session } = await supabase
    .from('product_sessions')
    .select('*')
    .eq('product_slug', 'personal-alignment')
    .single();

  console.log('\n=== PERSONAL ALIGNMENT SESSION ===\n');
  console.log('Session ID:', session?.id);
  console.log('Current Step:', session?.current_step);
  console.log('Placements Confirmed:', session?.placements_confirmed);
  console.log('\n=== RAW PLACEMENTS DATA ===\n');
  console.log(JSON.stringify(session?.placements, null, 2));

  // Test the placementsEmpty function from the code
  const placementsEmpty = (pl: any) => {
    if (!pl) return true;
    const astro = pl.astrology || {};
    const hd = pl.human_design || {};
    const astroHas = Object.values(astro).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const hdHas = Object.values(hd).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    );
    const notesHas =
      pl.notes && typeof pl.notes === 'string' && pl.notes.trim().length > 0;
    return !(astroHas || hdHas || notesHas);
  };

  console.log('\n=== PLACEMENT VALIDATION ===\n');
  console.log('Is Empty (per code logic):', placementsEmpty(session?.placements));

  if (session?.placements) {
    const astro = session.placements.astrology || {};
    const hd = session.placements.human_design || {};

    console.log('\nAstrology values:', Object.values(astro));
    console.log('Astrology has valid data:', Object.values(astro).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    ));

    console.log('\nHuman Design values:', Object.values(hd));
    console.log('HD has valid data:', Object.values(hd).some(
      (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
    ));
  }

  console.log('\n=== NEEDS CONFIRMATION ===');
  const needsConfirmation = !session?.placements_confirmed || placementsEmpty(session?.placements);
  console.log('Result:', needsConfirmation);
  console.log('');
}

debugPlacements();
