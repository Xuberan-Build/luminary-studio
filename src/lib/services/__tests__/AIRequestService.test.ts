import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI client before importing
vi.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

import { AIRequestService } from '../AIRequestService';
import { openai } from '@/lib/openai/client';

describe('AIRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should successfully make an AI request', async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: 'AI generated response' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const result = await AIRequestService.request({
        messages: [{ role: 'user', content: 'Test message' }],
      });

      expect(result.content).toBe('AI generated response');
      expect(result.finishReason).toBe('stop');
      expect(result.tokensUsed.total).toBe(150);
      expect(result.tokensUsed.prompt).toBe(100);
      expect(result.tokensUsed.completion).toBe(50);
    });

    it('should use custom system prompt when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await AIRequestService.request({
        systemPrompt: 'Custom system prompt',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: 'Custom system prompt' },
            { role: 'user', content: 'Test' },
          ]),
        })
      );
    });

    it('should use custom model when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await AIRequestService.request({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
        })
      );
    });

    it('should use custom temperature and maxTokens when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await AIRequestService.request({
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.5,
        maxTokens: 1000,
      });

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
          max_completion_tokens: 1000,
        })
      );
    });

    it('should retry on transient failures', async () => {
      const error = new Error('Rate limit exceeded');
      const mockResponse = {
        choices: [{ message: { content: 'Success after retry' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockResponse as any);

      const result = await AIRequestService.request({
        messages: [{ role: 'user', content: 'Test' }],
        retries: 1,
      });

      expect(result.content).toBe('Success after retry');
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('should retry specified number of times', async () => {
      const error = new Error('Service unavailable');

      vi.mocked(openai.chat.completions.create).mockRejectedValue(error);

      await expect(
        AIRequestService.request({
          messages: [{ role: 'user', content: 'Test' }],
          retries: 2,
        })
      ).rejects.toThrow();

      // Original call + 2 retries = 3 total
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should not retry on authentication errors', async () => {
      const authError = new Error('Invalid API key');
      (authError as any).status = 401;

      vi.mocked(openai.chat.completions.create).mockRejectedValue(authError);

      await expect(
        AIRequestService.request({
          messages: [{ role: 'user', content: 'Test' }],
          retries: 2,
        })
      ).rejects.toThrow('Invalid API key');

      // Should only be called once (no retries for auth errors)
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response content', async () => {
      const mockResponse = {
        choices: [{ message: { content: '' }, finish_reason: 'length' }],
        usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await expect(
        AIRequestService.request({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow();
    });

    it('should handle missing choices in response', async () => {
      const mockResponse = {
        choices: [],
        usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await expect(
        AIRequestService.request({
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow();
    });

    it('should throw error when all retries exhausted', async () => {
      const error = new Error('Service unavailable');

      vi.mocked(openai.chat.completions.create).mockRejectedValue(error);

      await expect(
        AIRequestService.request({
          messages: [{ role: 'user', content: 'Test' }],
          retries: 1,
        })
      ).rejects.toThrow('AI request failed after 2 attempts');
    });

    it('should include context in request when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await AIRequestService.request({
        messages: [{ role: 'user', content: 'Test' }],
        context: { userId: 'user-123', sessionId: 'session-456' },
      });

      // Context is logged but not sent to OpenAI
      expect(openai.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should make a simple completion request', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Simple completion' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const result = await AIRequestService.complete('Test prompt');

      expect(result).toBe('Simple completion');
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Test prompt' }],
        })
      );
    });

    it('should use custom system prompt in complete', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      await AIRequestService.complete('Prompt', { systemPrompt: 'Custom system' });

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: 'Custom system' },
          ]),
        })
      );
    });
  });

  describe('chat', () => {
    it('should handle conversation history', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Chat response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const messages = [
        { role: 'user' as const, content: 'First message' },
        { role: 'assistant' as const, content: 'First response' },
        { role: 'user' as const, content: 'Second message' },
      ];

      const result = await AIRequestService.chat(messages);

      expect(result).toBe('Chat response');
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'First message' },
            { role: 'assistant', content: 'First response' },
            { role: 'user', content: 'Second message' },
          ]),
        })
      );
    });

    it('should handle single message conversation', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const result = await AIRequestService.chat([{ role: 'user', content: 'Message' }]);

      expect(result).toBe('Response');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate token count for text', () => {
      const text = 'This is a test message';
      const estimate = AIRequestService.estimateTokens(text);

      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(text.length);
    });

    it('should return 0 for empty string', () => {
      const estimate = AIRequestService.estimateTokens('');
      expect(estimate).toBe(0);
    });

    it('should estimate higher for longer text', () => {
      const shortText = 'Short';
      const longText = 'This is a much longer text with many more words and characters';

      const shortEstimate = AIRequestService.estimateTokens(shortText);
      const longEstimate = AIRequestService.estimateTokens(longText);

      expect(longEstimate).toBeGreaterThan(shortEstimate);
    });
  });
});
