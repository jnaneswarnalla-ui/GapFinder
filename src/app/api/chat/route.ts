import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { hybridRetrieve } from '@/lib/rag/retriever';
import { isRetrievalConfidenceSufficient, buildGroundingPromptContext } from '@/lib/ai/grounding';
import { callGroqWithFallback } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, topicTitle } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    const searchContextQuery = topicTitle ? `${topicTitle} ${latestMessage}` : latestMessage;

    // Retrieve chunks
    const retrievedChunks = await hybridRetrieve({
      userId: user.id,
      queryText: searchContextQuery,
      topK: 4,
    });

    // Check retrieval confidence
    const hasConfidence = isRetrievalConfidenceSufficient(retrievedChunks, 0.20);
    if (!hasConfidence || retrievedChunks.length === 0) {
      return new Response(
        `This isn't covered in your uploaded material. To ensure 100% academic accuracy, GapFinder AI answers strictly from your course notes and syllabus. Please upload notes covering this topic to ask questions about it!`,
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const groundedContext = buildGroundingPromptContext(retrievedChunks);

    const systemPrompt = `You are GapFinder AI, a rigorous academic tutor.
Your role is to explain concepts, clarify doubts, and analyze mistakes for the student.

STRICT INSTRUCTIONS:
1. Answer ONLY using the facts present in the provided CONTEXT CHUNKS.
2. If the user asks something NOT covered in the provided context chunks, explicitly state: "This isn't covered in your uploaded material." Do NOT use outside knowledge or hallucinate.
3. Use inline bracket citations like [1], [2] referencing the source chunks whenever stating key facts or explanations.
4. At the end of your response, list the citations under a "---" horizontal rule with Source File, Chapter/Section, and Page number.
5. Be concise, educational, and crystal clear.

CONTEXT CHUNKS:
${groundedContext}`;

    const promptMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-4), // Last 4 conversation turns
    ];

    const reply = await callGroqWithFallback(promptMessages, 'reasoning', {
      temperature: 0.2,
      max_tokens: 1500,
    });

    // Append metadata citations
    const citationFooter = `\n\n---\n**Sources Cited:**\n` + retrievedChunks.map((c, idx) =>
      `[${idx + 1}] **${c.materialTitle}** — *${c.chapter || c.section || 'General'} (Page ${c.pageNumber})*`
    ).join('\n');

    return new Response(reply + citationFooter, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return new Response(`Error: ${err.message || 'An error occurred while generating response.'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
