import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GEMINI_API_KEY || !GROQ_API_KEY) {
  console.error("GEMINI_API_KEY and GROQ_API_KEY environment variables are required");
  process.exit(1);
}

async function testGeminiEmbeddings() {
  console.log('Testing Gemini Embeddings API...');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text: "Photosynthesis occurs in chloroplasts." }] },
    outputDimensionality: 768,
  });
  console.log('Embedding dimension:', result.embedding.values.length);
  if (result.embedding.values.length === 768) {
    console.log('Gemini Embeddings working perfectly (768-dim)!');
  } else {
    console.warn('Embedding dimension:', result.embedding.values.length);
  }
}

async function testGroqAPI() {
  console.log('Testing Groq API (llama-3.1-8b-instant)...');
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Reply with 'GROQ_OK' only." }],
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  console.log('Groq Response:', data.choices?.[0]?.message?.content?.trim());
}

async function run() {
  try {
    await testGeminiEmbeddings();
    await testGroqAPI();
    console.log('All AI APIs verified successfully!');
  } catch (err) {
    console.error('API Verification error:', err);
  }
}

run();
