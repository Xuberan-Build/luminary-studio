import { http, HttpResponse } from 'msw';

export const handlers = [
  // Step insight API
  http.post('/api/products/step-insight', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      aiResponse: 'Mocked step insight response',
    });
  }),

  // Final briefing API
  http.post('/api/products/final-briefing', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      briefing: 'Mocked final briefing content',
    });
  }),

  // Extract placements API
  http.post('/api/products/extract-placements', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      placements: {
        astrology: {
          sun: 'Taurus 10th house',
          moon: 'Cancer 12th house',
          rising: 'Leo',
        },
        human_design: {
          type: 'Generator',
          strategy: 'Respond',
          authority: 'Sacral',
        },
      },
    });
  }),

  // Follow-up response API
  http.post('/api/products/followup-response', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      aiResponse: 'Mocked follow-up response',
    });
  }),

  // Session versioning API
  http.post('/api/sessions/create-version', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      session: {
        id: 'new-session-id',
        version: 2,
      },
    });
  }),
];
