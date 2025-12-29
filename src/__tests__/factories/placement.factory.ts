export const createAstrologyPlacements = (overrides: any = {}) => ({
  sun: 'Taurus 10th house',
  moon: 'Cancer 12th house',
  rising: 'Leo',
  mercury: 'Gemini 11th house',
  venus: 'Aries 9th house',
  mars: 'Sagittarius 5th house',
  jupiter: 'Leo 1st house',
  saturn: 'Capricorn 6th house',
  uranus: 'Aquarius 7th house',
  neptune: 'Pisces 8th house',
  pluto: 'Scorpio 4th house',
  houses: '2nd: Virgo, 8th: Pisces',
  ...overrides,
});

export const createHumanDesignPlacements = (overrides: any = {}) => ({
  type: 'Generator',
  strategy: 'Respond',
  authority: 'Sacral',
  profile: '3/5',
  centers: 'Defined: Sacral, Solar Plexus, Throat',
  gifts: 'Gate 34: Power, Gate 20: The Now',
  ...overrides,
});

export const createFullPlacements = (overrides: any = {}) => ({
  astrology: createAstrologyPlacements(overrides.astrology),
  human_design: createHumanDesignPlacements(overrides.human_design),
  notes: overrides.notes || 'Chart analysis notes',
});

export const createEmptyPlacements = () => ({
  astrology: {
    sun: 'UNKNOWN',
    moon: 'UNKNOWN',
    rising: 'UNKNOWN',
    mercury: 'UNKNOWN',
    venus: 'UNKNOWN',
    mars: 'UNKNOWN',
    jupiter: 'UNKNOWN',
    saturn: 'UNKNOWN',
    uranus: 'UNKNOWN',
    neptune: 'UNKNOWN',
    pluto: 'UNKNOWN',
    houses: '',
  },
  human_design: {
    type: 'UNKNOWN',
    strategy: 'UNKNOWN',
    authority: 'UNKNOWN',
    profile: 'UNKNOWN',
    centers: '',
    gifts: '',
  },
  notes: '',
});
