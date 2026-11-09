import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const connectionString = process.env.DATABASE_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!connectionString || !geminiApiKey) {
  console.error("DATABASE_URL and GEMINI_API_KEY environment variables are required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const genAI = new GoogleGenerativeAI(geminiApiKey);

async function embedAllChunks() {
  console.log('Embedding all chunks in Neon...');
  const res = await pool.query(`SELECT id, content FROM chunks WHERE embedding IS NULL`);
  console.log(`Found ${res.rows.length} un-embedded chunks.`);

  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  for (let i = 0; i < res.rows.length; i++) {
    const chunk = res.rows[i];
    try {
      const embRes = await model.embedContent({
        content: { role: 'user', parts: [{ text: chunk.content.slice(0, 4000) }] },
        outputDimensionality: 768,
      });

      const vector = embRes.embedding.values;
      const vectorStr = `[${vector.join(',')}]`;

      await pool.query(
        `UPDATE chunks SET embedding = $1::vector WHERE id = $2`,
        [vectorStr, chunk.id]
      );
      console.log(`[${i + 1}/${res.rows.length}] Embedded chunk ${chunk.id}`);
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Failed to embed chunk ${chunk.id}:`, e.message);
    }
  }

  console.log('All chunks embedded with 768-dim vectors in Neon!');
  await pool.end();
}

embedAllChunks();
