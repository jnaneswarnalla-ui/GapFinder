import { describe, it, expect } from 'vitest';
import { chunkDocument } from '../lib/rag/chunker';

describe('Heading-Aware Document Chunker', () => {
  const sampleMarkdown = `
# Chapter 2: Life Processes
## Section 2.1: Photosynthesis
Photosynthesis is the process by which green plants synthesize nutrients from carbon dioxide and water using sunlight.
Chlorophyll pigments absorb solar radiant energy in the thylakoids.
Photolysis cleaves water molecules into protons, electrons, and oxygen gas.

## Section 2.2: Human Digestion
The human digestive system breaks down complex food macromolecules into absorbable nutrients.
Salivary amylase breaks starch into simple sugars in the mouth.
Pepsin hydrolyzes proteins into peptones inside the acidic stomach environment.
`.trim();

  it('correctly splits text into chunks with metadata (chapter, section, heading)', () => {
    const chunks = chunkDocument(
      'doc_123',
      'Class 10 Biology Notes',
      'notes',
      sampleMarkdown,
      undefined,
      { maxChunkSize: 250, overlapSize: 40 }
    );

    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.metadata.materialId).toBe('doc_123');
      expect(chunk.metadata.fileType).toBe('notes');
      expect(chunk.content.length).toBeGreaterThan(0);
    }

    const firstChunk = chunks[0];
    expect(firstChunk.metadata.chapter).toContain('Chapter 2');
  });

  it('preserves page numbers when multiple pages are provided', () => {
    const pages = [
      { pageNumber: 1, text: '# Unit 1\nIntroduction to chemical reactions and chemical equations.' },
      { pageNumber: 2, text: '# Unit 2\nDetailed analysis of oxidation, reduction and corrosion.' },
    ];

    const chunks = chunkDocument(
      'doc_pages',
      'Chemistry Textbook',
      'notes',
      '',
      pages
    );

    expect(chunks.length).toBe(2);
    expect(chunks[0].metadata.pageNumber).toBe(1);
    expect(chunks[1].metadata.pageNumber).toBe(2);
  });
});
