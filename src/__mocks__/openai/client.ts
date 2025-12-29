import { vi } from 'vitest';

export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(() =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: 'Mocked AI response',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        })
      ),
    },
  },
};

export const openai = mockOpenAI;
