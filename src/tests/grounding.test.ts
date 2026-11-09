import { describe, it, expect } from 'vitest';
import {
  validateCitations,
  isRetrievalConfidenceSufficient,
} from '../lib/ai/grounding';
import { RetrievedChunk } from '../lib/rag/retriever';

describe('Grounding & Citation Validator', () => {
  const mockRetrieved: RetrievedChunk[] = [
    {
      id: 'chunk_bio_1',
      materialId: 'mat_1',
      materialTitle: 'Biology Notes',
      fileType: 'notes',
      content: 'Chloroplasts contain chlorophyll that absorbs sunlight.',
      pageNumber: 3,
      similarityScore: 0.85,
      hybridScore: 0.82,
    },
    {
      id: 'chunk_bio_2',
      materialId: 'mat_1',
      materialTitle: 'Biology Notes',
      fileType: 'notes',
      content: 'Photolysis breaks water into hydrogen and oxygen.',
      pageNumber: 4,
      similarityScore: 0.78,
      hybridScore: 0.75,
    },
  ];

  it('validates citations when all cited chunks exist in retrieved context', () => {
    const cited = ['chunk_bio_1', 'chunk_bio_2'];
    const result = validateCitations(cited, mockRetrieved);

    expect(result.isGrounded).toBe(true);
    expect(result.validCitations.length).toBe(2);
    expect(result.invalidCitations.length).toBe(0);
    expect(result.groundingScore).toBe(1.0);
  });

  it('flags hallucinated or unsupported citations as ungrounded', () => {
    const cited = ['chunk_bio_1', 'fake_chunk_999'];
    const result = validateCitations(cited, mockRetrieved);

    expect(result.isGrounded).toBe(false);
    expect(result.validCitations).toEqual(['chunk_bio_1']);
    expect(result.invalidCitations).toEqual(['fake_chunk_999']);
    expect(result.groundingScore).toBe(0.5);
    expect(result.reason).toContain('unsupported chunk IDs');
  });

  it('detects low retrieval confidence to trigger upfront refusal', () => {
    const lowConfChunks: RetrievedChunk[] = [
      {
        id: 'chunk_x',
        materialId: 'mat_x',
        materialTitle: 'Random Notes',
        fileType: 'notes',
        content: 'Unrelated topic text',
        pageNumber: 1,
        similarityScore: 0.12,
        hybridScore: 0.15,
      },
    ];

    expect(isRetrievalConfidenceSufficient(lowConfChunks, 0.35)).toBe(false);
    expect(isRetrievalConfidenceSufficient(mockRetrieved, 0.35)).toBe(true);
    expect(isRetrievalConfidenceSufficient([], 0.35)).toBe(false);
  });
});
