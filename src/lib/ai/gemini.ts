import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const cleanText = text.slice(0, 8000).trim();
    if (!cleanText) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: cleanText }] },
      outputDimensionality: 768,
    } as any);

    return result.embedding.values;
  } catch (err: any) {
    console.warn('[Gemini Embedding warning]:', err.message);
    return null;
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const results: (number[] | null)[] = [];
  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);
    const batchPromises = batch.map(t => generateEmbedding(t));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    if (i + 5 < texts.length) {
      await new Promise(res => setTimeout(res, 200));
    }
  }
  return results;
}
