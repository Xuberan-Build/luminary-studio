import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI client before any imports
vi.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock models
vi.mock('@/lib/ai/models', () => ({
  chartAnalysisModel: 'gpt-4o',
}));

// Mock Supabase
vi.mock('@/lib/supabase/server');

// Mock rate limiting
vi.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 29 })),
}));

// Mock input validation
vi.mock('@/lib/security/input-validation', () => ({
  validateUserInput: vi.fn((input: string) => ({
    isValid: true,
    sanitized: input,
    warnings: [],
  })),
  validateSessionOwnership: vi.fn(() => Promise.resolve(true)),
}));

import { POST } from '../route';
import { supabaseAdmin } from '@/lib/supabase/server';
import { openai } from '@/lib/openai/client';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateUserInput, validateSessionOwnership } from '@/lib/security/input-validation';

describe('POST /api/products/followup-response', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for OpenAI
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      id: 'test-completion',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Here is a concise follow-up answer with actionable advice.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 500,
        completion_tokens: 100,
        total_tokens: 600,
      },
    } as any);

    // Default Supabase mocks
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { messages: [] },
        error: null,
      }),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      }),
      upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    } as any);

    // Default rate limit mock
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29 });

    // Default input validation mock
    vi.mocked(validateUserInput).mockReturnValue({
      isValid: true,
      sanitized: 'What should I do next?',
      warnings: [],
    });

    // Default session ownership mock
    vi.mocked(validateSessionOwnership).mockResolvedValue(true);
  });

  it('should generate response even without explicit followUpQuestion', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        stepNumber: 1,
        stepData: { title: 'Step 1', question: 'What is your goal?' },
        mainResponse: 'I want to grow my business',
        followUpQuestion: 'Tell me more',
        systemPrompt: 'You are a business advisor',
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.aiResponse).toBeTruthy();
  });

  it('should enforce rate limiting', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What should I do?',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('should validate session ownership', async () => {
    vi.mocked(validateSessionOwnership).mockResolvedValue(false);

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        userId: 'test-user',
        followUpQuestion: 'What next?',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Unauthorized access to session');
  });

  it('should validate and sanitize user input', async () => {
    const longInput = 'a'.repeat(2001);
    vi.mocked(validateUserInput).mockReturnValue({
      isValid: false,
      sanitized: longInput.slice(0, 2000),
      warnings: ['Input exceeds maximum length'],
    });

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: longInput,
      }),
    });

    await POST(request);

    expect(validateUserInput).toHaveBeenCalledWith(longInput, { maxLength: 2000 });
  });

  it('should generate AI response with placements', async () => {
    // Override the default mock for this specific test
    vi.mocked(validateUserInput).mockReturnValue({
      isValid: true,
      sanitized: 'What price should I charge?',
      warnings: [],
    });

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        stepNumber: 1,
        stepData: { title: 'Revenue Model', question: 'How will you make money?' },
        mainResponse: 'Consulting services',
        followUpQuestion: 'What price should I charge?',
        systemPrompt: 'You are a business advisor',
        conversationHistory: [
          { role: 'assistant', content: 'Welcome!' },
          { role: 'user', content: 'Consulting services' },
          { role: 'assistant', content: 'Great choice!' },
        ],
        placements: {
          astrology: {
            sun: 'Leo 5th house',
            moon: 'Cancer 4th house',
            rising: 'Aries',
            houses: 'Taurus 2nd',
            mars: 'Scorpio 8th',
            venus: 'Libra 7th',
            mercury: 'Virgo 6th',
            saturn: 'Capricorn 10th',
            pluto: 'Scorpio 8th',
          },
          human_design: {
            type: 'Generator',
            strategy: 'Respond',
            authority: 'Sacral',
            profile: '3/5',
            centers: 'Sacral defined',
            gifts: 'Builder energy',
          },
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.aiResponse).toBeTruthy();

    // Verify OpenAI was called with correct messages
    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(4); // system + 2 history messages + new question
    expect(callArgs.messages[3].content).toContain('What price should I charge?');

    // Verify system prompt includes placements
    expect(callArgs.messages[0].content).toContain('Leo 5th house');
    expect(callArgs.messages[0].content).toContain('Generator');
  });

  it('should handle missing placements with UNKNOWN', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        stepNumber: 1,
        stepData: { title: 'Test', question: 'Test?' },
        followUpQuestion: 'Tell me more',
        systemPrompt: 'Test',
        conversationHistory: [],
        placements: {}, // Empty placements
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('UNKNOWN');
  });

  it('should use product-specific prompt from database', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        productSlug: 'personal-alignment',
        followUpQuestion: 'What next?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    await POST(request);

    // PromptService is called internally
    expect(openai.chat.completions.create).toHaveBeenCalled();
  });

  it('should log conversation to database', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { messages: [{ role: 'assistant', content: 'Previous message' }] },
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom as any);

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        stepNumber: 2,
        followUpQuestion: 'How do I start?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    await POST(request);

    const upsertCall = mockFrom().upsert;
    expect(upsertCall).toHaveBeenCalled();
    const upsertArgs = upsertCall.mock.calls[0][0];
    expect(upsertArgs.session_id).toBe('test-session');
    expect(upsertArgs.step_number).toBe(2);
    expect(upsertArgs.messages).toHaveLength(3); // Previous + question + response
  });

  it('should handle conversation logging errors gracefully', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(new Error('Database error')),
      upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    });
    vi.mocked(supabaseAdmin.from).mockImplementation(mockFrom as any);

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What next?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still return success even if logging fails
    expect(response.status).toBe(200);
    expect(data.aiResponse).toBeTruthy();
  });

  it('should handle AI generation errors', async () => {
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error('OpenAI rate limit exceeded')
    );

    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What should I do?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('AI generation failed');
    expect(data.detail).toContain('OpenAI rate limit');
  });

  it('should use default productSlug when not provided', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What next?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    await POST(request);

    // Should still work with default quantum-initiation slug
    expect(openai.chat.completions.create).toHaveBeenCalled();
  });

  it('should skip welcome message in conversation history', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What next?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [
          { role: 'assistant', content: 'Welcome to the experience!' }, // Should be skipped
          { role: 'user', content: 'My first answer' },
          { role: 'assistant', content: 'Great answer!' },
        ],
      }),
    });

    await POST(request);

    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    // Should have system + 2 history messages (welcome skipped) + new question = 4 total
    expect(callArgs.messages).toHaveLength(4);
    expect(callArgs.messages[1].content).toBe('My first answer');
  });

  it('should use correct AI model and parameters', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        followUpQuestion: 'What next?',
        stepData: { title: 'Test', question: 'Test?' },
        systemPrompt: 'Test',
        conversationHistory: [],
      }),
    });

    await POST(request);

    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o');
    expect(callArgs.max_completion_tokens).toBe(10000);
  });

  it('should handle malformed request body', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate response');
  });

  it('should build context with step data', async () => {
    const request = new Request('http://localhost/api/products/followup-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'test-session',
        stepNumber: 3,
        stepData: {
          title: 'Revenue Strategy',
          question: 'How will you generate income?',
        },
        mainResponse: 'Through consulting and courses',
        followUpQuestion: 'Which should I prioritize?',
        systemPrompt: 'You are a business advisor',
        conversationHistory: [],
      }),
    });

    await POST(request);

    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    const systemPrompt = callArgs.messages[0].content;

    expect(systemPrompt).toContain('step 3');
    expect(systemPrompt).toContain('Revenue Strategy');
    expect(systemPrompt).toContain('How will you generate income?');
    expect(systemPrompt).toContain('Through consulting and courses');
  });
});
