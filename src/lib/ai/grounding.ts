/**
 * GapFinder AI: Grounding & Citation Guardrails
 * 
 * Enforces strict separation between Retrieval and Generation:
 * - Verifies every generated claim/question maps to an authentic retrieved chunk ID.
 * - Filters out hallucinated or unsupported citations.
 * - Detects low retrieval confidence to trigger upfront refusal.
 */

import { RetrievedChunk } from '@/lib/rag/retriever';

export interface GroundingValidationResult {
  isGrounded: boolean;
  validCitations: string[];
  invalidCitations: string[];
  groundingScore: number; // 0 to 1
  reason?: string;
}

export function validateCitations(
  citedChunkIds: string[],
  retrievedChunks: RetrievedChunk[]
): GroundingValidationResult {
  const allowedIds = new Set(retrievedChunks.map(c => c.id));
  const validCitations: string[] = [];
  const invalidCitations: string[] = [];

  for (const cid of citedChunkIds) {
    if (allowedIds.has(cid)) {
      validCitations.push(cid);
    } else {
      invalidCitations.push(cid);
    }
  }

  const isGrounded = validCitations.length > 0 && invalidCitations.length === 0;
  const groundingScore = (validCitations.length + invalidCitations.length) > 0
    ? validCitations.length / (validCitations.length + invalidCitations.length)
    : 0;

  return {
    isGrounded,
    validCitations,
    invalidCitations,
    groundingScore,
    reason: invalidCitations.length > 0
      ? `Citations contain unsupported chunk IDs: ${invalidCitations.join(', ')}`
      : undefined,
  };
}

export function isRetrievalConfidenceSufficient(
  retrievedChunks: RetrievedChunk[],
  minHybridScore: number = 0.25
): boolean {
  if (!retrievedChunks || retrievedChunks.length === 0) return false;
  // Highest hybrid score must meet the minimum threshold
  const bestScore = Math.max(...retrievedChunks.map(c => c.hybridScore));
  return bestScore >= minHybridScore;
}

export function buildGroundingPromptContext(chunks: RetrievedChunk[]): string {
  if (!chunks || chunks.length === 0) {
    return 'NO RELEVANT MATERIAL FOUND.';
  }

  return chunks.map((c, index) => {
    const metaParts = [
      `Source: ${c.materialTitle}`,
      c.chapter ? `Chapter: ${c.chapter}` : null,
      c.section ? `Section: ${c.section}` : null,
      c.pageNumber ? `Page: ${c.pageNumber}` : null,
    ].filter(Boolean).join(' | ');

    return `=== CHUNK [${c.id}] ===\nMetadata: ${metaParts}\n\n${c.content}\n=== END CHUNK [${c.id}] ===`;
  }).join('\n\n');
}
