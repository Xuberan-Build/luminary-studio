import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prefer explicit model via env; default to GPT-5 (can be set to gpt-5.2 snapshot or gpt-4o if access is limited)
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5';

// Helper to generate AI responses (chat)
export async function generateAIResponse({
  systemPrompt,
  messages,
  maxTokens = 500,
  temperature = 0.7,
}: {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}) {
  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_completion_tokens: maxTokens,
    temperature,
  });

  return completion.choices[0].message.content || '';
}
