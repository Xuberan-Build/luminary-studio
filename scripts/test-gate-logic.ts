#!/usr/bin/env tsx
/**
 * Test gate logic for potential bugs
 * Simulates different scenarios to find edge cases
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface Scenario {
  name: string;
  currentStep: number;
  placementsConfirmed: boolean;
  hasPlacementData: boolean;
  uploadedFiles: number;
  expectedGate: 'auto-copied' | 'upload-confirm' | 'none' | 'STEP';
  expectedBehavior: string;
}

const scenarios: Scenario[] = [
  {
    name: 'New user, no previous placements',
    currentStep: 1,
    placementsConfirmed: false,
    hasPlacementData: false,
    uploadedFiles: 0,
    expectedGate: 'none',
    expectedBehavior: 'Show Step 1 (file upload screen)',
  },
  {
    name: 'User with auto-copied placements',
    currentStep: 1,
    placementsConfirmed: false,
    hasPlacementData: true,
    uploadedFiles: 0,
    expectedGate: 'auto-copied',
    expectedBehavior: 'Show auto-copied confirmation gate',
  },
  {
    name: 'User uploaded files',
    currentStep: 1,
    placementsConfirmed: false,
    hasPlacementData: false,
    uploadedFiles: 2,
    expectedGate: 'upload-confirm',
    expectedBehavior: 'Show upload confirmation gate',
  },
  {
    name: 'User confirmed placements, on step 2',
    currentStep: 2,
    placementsConfirmed: true,
    hasPlacementData: true,
    uploadedFiles: 0,
    expectedGate: 'STEP',
    expectedBehavior: 'Show Step 2 (conversation)',
  },
  {
    name: 'BUG? User confirmed, but somehow on step 1',
    currentStep: 1,
    placementsConfirmed: true,
    hasPlacementData: true,
    uploadedFiles: 0,
    expectedGate: 'STEP',
    expectedBehavior: 'Should auto-advance to step 2 (client logic line 855)',
  },
  {
    name: 'BUG? User on step 2, but placements not confirmed',
    currentStep: 2,
    placementsConfirmed: false,
    hasPlacementData: true,
    uploadedFiles: 0,
    expectedGate: 'auto-copied',
    expectedBehavior: 'Should force back to step 1 + show gate (client logic line 154)',
  },
  {
    name: 'BUG? Placements confirmed but empty',
    currentStep: 1,
    placementsConfirmed: true,
    hasPlacementData: false,
    uploadedFiles: 0,
    expectedGate: 'upload-confirm',
    expectedBehavior: 'Should reset placements_confirmed and show gate (client logic line 168)',
  },
];

function analyzeScenario(scenario: Scenario) {
  const { currentStep, placementsConfirmed, hasPlacementData, uploadedFiles } = scenario;

  // Simulate ProductExperience.tsx logic
  const showAutoCopiedGate =
    currentStep === 1 &&
    hasPlacementData &&
    !placementsConfirmed;

  // confirmGate logic is more complex, but simplified:
  const confirmGate = currentStep === 1 && uploadedFiles > 0;

  const regularGate = confirmGate && !placementsConfirmed && !showAutoCopiedGate;

  let actualGate: string;
  if (showAutoCopiedGate) {
    actualGate = 'auto-copied';
  } else if (regularGate) {
    actualGate = 'upload-confirm';
  } else if (currentStep > 1 || (placementsConfirmed && hasPlacementData)) {
    actualGate = 'STEP';
  } else {
    actualGate = 'none';
  }

  const matches = actualGate === scenario.expectedGate;

  return { actualGate, matches };
}

async function testGateLogic() {
  console.log('\n🧪 Testing Gate Logic for Bugs\n');
  console.log('='.repeat(80));

  let bugs = 0;

  scenarios.forEach((scenario, index) => {
    const { actualGate, matches } = analyzeScenario(scenario);

    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log(`   State: step=${scenario.currentStep}, confirmed=${scenario.placementsConfirmed}, hasData=${scenario.hasPlacementData}, files=${scenario.uploadedFiles}`);
    console.log(`   Expected: ${scenario.expectedGate}`);
    console.log(`   Actual:   ${actualGate}`);
    console.log(`   ${matches ? '✅ PASS' : '❌ FAIL'}`);

    if (!matches) {
      bugs++;
      console.log(`   ⚠️  ${scenario.expectedBehavior}`);
    }
  });

  console.log('\n' + '='.repeat(80));

  if (bugs > 0) {
    console.log(`\n❌ Found ${bugs} potential bugs in gate logic!\n`);
  } else {
    console.log('\n✅ All scenarios pass - gate logic looks good!\n');
  }

  // Now check actual database for problematic states
  console.log('\n🔍 Checking actual database for problematic session states...\n');

  const { data: sessions, error } = await supabase
    .from('product_sessions')
    .select('id, product_slug, current_step, placements_confirmed, placements')
    .eq('is_complete', false)
    .limit(20);

  if (error) {
    console.error('Error fetching sessions:', error.message);
    return;
  }

  let dbBugs = 0;

  sessions?.forEach((session: any) => {
    const hasData = session.placements && Object.keys(session.placements).length > 0;
    const isPlacementsEmpty = !hasData;

    // Check for problematic states
    if (session.current_step > 1 && !session.placements_confirmed) {
      console.log(`⚠️  ${session.product_slug}: On step ${session.current_step} but placements NOT confirmed`);
      dbBugs++;
    }

    if (session.placements_confirmed && isPlacementsEmpty) {
      console.log(`⚠️  ${session.product_slug}: Placements confirmed but EMPTY`);
      dbBugs++;
    }
  });

  if (dbBugs === 0) {
    console.log('✅ No problematic session states found in database\n');
  } else {
    console.log(`\n⚠️  Found ${dbBugs} sessions in problematic states\n`);
  }
}

testGateLogic().catch(console.error);
