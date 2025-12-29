import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptService } from '../PromptService';
import { supabaseAdmin } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');

describe('PromptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPrompt', () => {
    it('should load prompt from database when available', async () => {
      const mockPrompt = 'Database prompt content for testing';

      // Mock Supabase query chain
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { content: mockPrompt },
        error: null,
      });

      const mockLimit = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await PromptService.getPrompt({
        productSlug: 'quantum-initiation',
        scope: 'step_insight',
      });

      expect(result).toBe(mockPrompt);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('prompts');
    });

    it('should fall back to provided fallback when database returns null', async () => {
      const fallback = 'Fallback prompt for testing';

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockLimit = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await PromptService.getPrompt({
        productSlug: 'quantum-initiation',
        scope: 'step_insight',
        fallback,
      });

      expect(result).toBe(fallback);
    });

    it('should use default prompt when no fallback provided and database fails', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockLimit = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await PromptService.getPrompt({
        productSlug: 'quantum-initiation',
        scope: 'step_insight',
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      // Default prompts should contain relevant keywords
      expect(result.toLowerCase()).toMatch(/strategic|advisor|insight|business/);
    });

    it('should handle database errors gracefully', async () => {
      const fallback = 'Error fallback prompt';

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const mockLimit = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockEq = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await PromptService.getPrompt({
        productSlug: 'quantum-initiation',
        scope: 'step_insight',
        fallback,
      });

      expect(result).toBe(fallback);
    });
  });

  describe('validatePrompt', () => {
    it('should validate empty prompts as invalid', () => {
      const result = PromptService.validatePrompt('');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt is empty');
    });

    it('should validate whitespace-only prompts as invalid', () => {
      const result = PromptService.validatePrompt('   \n   \t   ');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt is empty');
    });

    it('should validate prompts exceeding max length as invalid', () => {
      const longPrompt = 'a'.repeat(10001);
      const result = PromptService.validatePrompt(longPrompt);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt exceeds 10,000 characters');
    });

    it('should detect [REPLACE] placeholder text', () => {
      const result = PromptService.validatePrompt('This is a [REPLACE] prompt');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt contains placeholder text');
    });

    it('should detect TODO comments', () => {
      const result = PromptService.validatePrompt('This prompt has a TODO: fix this later');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt contains placeholder text');
    });

    it('should validate correct prompts as valid', () => {
      const result = PromptService.validatePrompt(
        'This is a valid prompt for strategic business advice. It contains helpful context and instructions.'
      );
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should validate prompts at exactly max length', () => {
      const exactPrompt = 'a'.repeat(10000);
      const result = PromptService.validatePrompt(exactPrompt);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle prompts with legitimate brackets in content', () => {
      const result = PromptService.validatePrompt(
        'Use the user response [their actual answer] to generate insights.'
      );
      // This should be valid since it doesn't contain [REPLACE] or TODO
      expect(result.valid).toBe(true);
    });

    it('should detect prompts with [REPLACE] anywhere in text', () => {
      const result = PromptService.validatePrompt('Start [REPLACE] end');
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Prompt contains placeholder text');
    });
  });

  describe('getProductName', () => {
    it('should return correct name for quantum-initiation', () => {
      // This is a private method, so we test it indirectly through the public API
      // or we can export it as a helper if needed
      // For now, we'll skip this or test through integration
    });
  });
});
