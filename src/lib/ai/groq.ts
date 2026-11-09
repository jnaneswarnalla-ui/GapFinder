import { z } from 'zod';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export const GROQ_MODELS = {
  reasoning: [
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
  ],
  fast: [
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-safeguard-20b',
  ],
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqWithFallback(
  messages: ChatMessage[],
  mode: 'reasoning' | 'fast' = 'reasoning',
  options: { temperature?: number; max_tokens?: number; response_format?: { type: 'json_object' } } = {}
): Promise<string> {
  const modelList = mode === 'reasoning' ? GROQ_MODELS.reasoning : GROQ_MODELS.fast;

  let lastError: any = null;

  for (const model of modelList) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.max_tokens ?? 2048,
          response_format: options.response_format,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Groq ${model} failed (${res.status}): ${JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        return content;
      }
    } catch (err: any) {
      console.warn(`[Groq fallback] Model ${model} failed:`, err.message);
      lastError = err;
      // Try next model in list
    }
  }

  throw lastError || new Error('All Groq models exhausted without response');
}

export async function generateStructuredObject<T>(
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  mode: 'reasoning' | 'fast' = 'reasoning',
  maxRetries: number = 2
): Promise<T> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid, raw JSON object matching the requested schema. Do not include markdown code block backticks, do not include explanations outside the JSON.`,
    },
    { role: 'user', content: userPrompt },
  ];

  let attempts = 0;
  while (attempts <= maxRetries) {
    attempts++;
    try {
      const rawText = await callGroqWithFallback(messages, mode, {
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      // Clean markdown code blocks if any
      const cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
      const parsed = JSON.parse(cleaned);
      const validated = schema.parse(parsed);
      return validated;
    } catch (err: any) {
      console.warn(`[generateStructuredObject attempt ${attempts} failed]:`, err.message);
      if (attempts > maxRetries) {
        throw new Error(`Failed to generate valid structured object: ${err.message}`);
      }
      // Add error context for retry
      messages.push({
        role: 'user',
        content: `Your previous response had a validation error: ${err.message}. Please fix the schema and output ONLY valid JSON.`,
      });
    }
  }

  throw new Error('Structured generation failed after max retries');
}
