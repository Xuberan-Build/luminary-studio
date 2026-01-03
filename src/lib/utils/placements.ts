/**
 * Shared utility for validating placements
 * Used by both server and client to ensure consistent logic
 */

export interface Placements {
  astrology?: {
    sun?: string;
    moon?: string;
    rising?: string;
    [key: string]: string | undefined;
  };
  human_design?: {
    type?: string;
    strategy?: string;
    authority?: string;
    [key: string]: string | undefined;
  };
  notes?: string;
}

/**
 * Check if placements are empty or invalid
 * Placements are considered empty if:
 * - null or undefined
 * - No valid astrology data (all unknown/empty)
 * - No valid human design data (all unknown/empty)
 * - No notes
 */
export function isPlacementsEmpty(placements: Placements | null | undefined): boolean {
  if (!placements) return true;

  const astro = placements.astrology || {};
  const hd = placements.human_design || {};

  // Check if astrology has any valid values
  const astroHas = Object.values(astro).some(
    (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
  );

  // Check if human design has any valid values
  const hdHas = Object.values(hd).some(
    (v) => v && String(v).trim() && String(v).trim().toUpperCase() !== 'UNKNOWN'
  );

  // Check if notes exist
  const notesHas =
    placements.notes && typeof placements.notes === 'string' && placements.notes.trim().length > 0;

  // Placements are NOT empty if any of the above are true
  return !(astroHas || hdHas || notesHas);
}
