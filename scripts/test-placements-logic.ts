#!/usr/bin/env tsx

/**
 * Test Placements Logic
 * Tests the exact same logic as ProductExperience component
 */

// Simulate the actual placements data from database
const placementsFromDB = {
  "notes": "",
  "astrology": {
    "sun": "Taurus 12th house",
    "mars": "Cancer 3rd house",
    "moon": "Taurus 12th house",
    "pluto": "Scorpio 6th house",
    "venus": "Aries 11th house",
    "houses": "ASC Gemini 17°09' (1st house). MC Aquarius 18°50' (10th house). Money houses: 2nd house cusp UNKNOWN; 8th house has Uranus in Capricorn (22°11') and Neptune in Capricorn (21°09'); 10th house has Saturn in Aquarius (28°27') and MC Aquarius 18°50'; 11th house has Mercury in Aries (10°13') and Venus in Aries (03°44'). 2nd House (Resources/Values): Empty - ruled by Cancer on the cusp",
    "rising": "Gemini (ASC) 1st house",
    "saturn": "Aquarius 10th house",
    "uranus": "Capricorn 8th house",
    "jupiter": "Libra 5th house",
    "mercury": "Aries 11th house",
    "neptune": "Capricorn 8th house"
  },
  "human_design": {
    "type": "Manifestor - The Fire Starter",
    "gifts": "Gift 5, Gift 14, Gift 18, Gift 21, Gift 22, Gift 24, Gift 25, Gift 26, Gift 28, Gift 30, Gift 31, Gift 35, Gift 39, Gift 41, Gift 45, Gift 48, Gift 49, Gift 54, Gift 56, Gift 61",
    "centers": "Notes (gifts, channels, extra house data) 2nd House (Resources/Values): Empty - ruled by Cancer on the cusp  Human Design Centers Looking at your bodygraph: DEFINED Centers (colored/consistent energy):  Throat Center (communication) - Gates 31 and 45 visible Emotional Solar Plexus (emotions/authority) - This is your decision-making center Sacral Center (life force/sexuality) - Gates 5 and 14 visible  UNDEFINED Centers (white/open to conditioning):  Head Center (inspiration/pressure) Ajna Center (mental processing) G Center (identity/direction) Will/Ego Center (willpower/self-worth) Spleen Center (intuition/survival) Root Center (stress/drive)",
    "profile": "1/3: The Establisher of Knowledge & Truth",
    "strategy": "Informing",
    "authority": "Emotional - Solar Plexus"
  }
};

// ProductExperience.tsx version (lines 116-124)
const isPlacementsEmpty_ClientComponent = (pl: any) => {
  if (!pl) return true;
  const astro = pl.astrology || {};
  const hd = pl.human_design || {};
  const astroHas = Object.values(astro).some((v) => v && v !== 'UNKNOWN');
  const hdHas = Object.values(hd).some((v) => v && v !== 'UNKNOWN');
  const notesHas = pl.notes && typeof pl.notes === 'string' && pl.notes.trim().length > 0;
  return !(astroHas || hdHas || notesHas);
};

// Experience page.tsx version (server component, lines 86-99)
const isPlacementsEmpty_ServerComponent = (pl: any) => {
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

console.log('\n=== Testing Placements Logic ===\n');
console.log('Data structure:');
console.log('- notes:', JSON.stringify(placementsFromDB.notes));
console.log('- astrology keys:', Object.keys(placementsFromDB.astrology));
console.log('- human_design keys:', Object.keys(placementsFromDB.human_design));

console.log('\n--- Client Component Logic (ProductExperience.tsx) ---');
const clientResult = isPlacementsEmpty_ClientComponent(placementsFromDB);
console.log('Result:', clientResult);
console.log('Interpretation:', clientResult ? '❌ EMPTY (will force upload)' : '✅ HAS DATA (will skip upload)');

console.log('\n--- Server Component Logic (page.tsx) ---');
const serverResult = isPlacementsEmpty_ServerComponent(placementsFromDB);
console.log('Result:', serverResult);
console.log('Interpretation:', serverResult ? '❌ EMPTY (will force upload)' : '✅ HAS DATA (will skip upload)');

console.log('\n--- Individual Field Checks ---');
const astro = placementsFromDB.astrology;
const hd = placementsFromDB.human_design;

console.log('\nAstrology:');
const astroValues = Object.values(astro);
console.log('- Total values:', astroValues.length);
console.log('- Sample values:', astroValues.slice(0, 3));
const astroHasClient = astroValues.some((v) => v && v !== 'UNKNOWN');
const astroHasServer = astroValues.some(
  (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
);
console.log('- astroHas (client):', astroHasClient);
console.log('- astroHas (server):', astroHasServer);

console.log('\nHuman Design:');
const hdValues = Object.values(hd);
console.log('- Total values:', hdValues.length);
console.log('- Sample values:', hdValues.slice(0, 3));
const hdHasClient = hdValues.some((v) => v && v !== 'UNKNOWN');
const hdHasServer = hdValues.some(
  (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
);
console.log('- hdHas (client):', hdHasClient);
console.log('- hdHas (server):', hdHasServer);

console.log('\nNotes:');
console.log('- Value:', JSON.stringify(placementsFromDB.notes));
console.log('- Type:', typeof placementsFromDB.notes);
console.log('- Length:', placementsFromDB.notes.length);
const notesHas = placementsFromDB.notes && typeof placementsFromDB.notes === 'string' && placementsFromDB.notes.trim().length > 0;
console.log('- notesHas:', notesHas);

console.log('\n=== CONCLUSION ===\n');
if (clientResult !== serverResult) {
  console.log('⚠️  CLIENT AND SERVER LOGIC DISAGREE!');
  console.log('This is the bug - client sees empty, server sees data (or vice versa)');
} else if (clientResult === false && serverResult === false) {
  console.log('✅ Both client and server see data as VALID');
  console.log('The problem is elsewhere (state initialization, caching, etc.)');
} else {
  console.log('❌ Both client and server see data as EMPTY');
  console.log('The placements data structure is wrong');
}
console.log('');
