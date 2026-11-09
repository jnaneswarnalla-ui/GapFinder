/**
 * GapFinder AI: Heading-Aware Sliding-Window Chunker
 * 
 * Splits syllabus, notes, and past papers into semantic chunks with headings,
 * page numbers, and overlapping context boundaries.
 */

export interface ChunkMetadata {
  materialId: string;
  materialTitle: string;
  fileType: 'syllabus' | 'notes' | 'past_paper';
  chapter?: string;
  section?: string;
  heading?: string;
  pageNumber: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  tokenEstimate: number;
}

export interface ChunkOptions {
  maxChunkSize?: number; // Characters per chunk (~400-600 tokens = ~1800 chars)
  overlapSize?: number;  // Characters overlap (~15-20% = ~250 chars)
}

export function chunkDocument(
  materialId: string,
  materialTitle: string,
  fileType: 'syllabus' | 'notes' | 'past_paper',
  rawText: string,
  pages?: { pageNumber: number; text: string }[],
  options: ChunkOptions = {}
): DocumentChunk[] {
  const maxChunkSize = options.maxChunkSize || 1200;
  const overlapSize = options.overlapSize || 200;

  const chunks: DocumentChunk[] = [];
  let chunkCounter = 0;

  // Process page by page if pages are provided
  const sourcePages = (pages && pages.length > 0)
    ? pages
    : [{ pageNumber: 1, text: rawText }];

  let currentChapter = '';
  let currentSection = '';

  for (const page of sourcePages) {
    const lines = page.text.split(/\r?\n/);
    let currentHeading = '';
    let currentBuffer: string[] = [];
    let currentBufferLength = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Heading detection
      const headingMatch = trimmed.match(/^(#{1,4}\s*|Chapter\s+\d+|Unit\s+\d+|Section\s+\d+)(.*)/i);
      if (headingMatch) {
        const fullHeader = trimmed.replace(/^#+\s*/, '').trim();
        if (/^(chapter|unit)\b/i.test(fullHeader)) {
          currentChapter = fullHeader;
        } else if (/^section\b/i.test(fullHeader) || /^##\s+/i.test(line)) {
          currentSection = fullHeader;
        }
        currentHeading = fullHeader;
      }

      // Add line to buffer
      currentBuffer.push(line);
      currentBufferLength += line.length + 1;

      // Check if buffer reached maxChunkSize
      if (currentBufferLength >= maxChunkSize || i === lines.length - 1) {
        const textContent = currentBuffer.join('\n').trim();
        if (textContent.length >= 40) {
          chunkCounter++;
          chunks.push({
            id: `${materialId}_chunk_${chunkCounter}`,
            content: textContent,
            metadata: {
              materialId,
              materialTitle,
              fileType,
              chapter: currentChapter || undefined,
              section: currentSection || undefined,
              heading: currentHeading || undefined,
              pageNumber: page.pageNumber,
            },
            tokenEstimate: Math.ceil(textContent.length / 4),
          });
        }

        // Sliding overlap
        if (overlapSize > 0 && currentBufferLength >= maxChunkSize) {
          let keptChars = 0;
          const overlapLines: string[] = [];
          for (let j = currentBuffer.length - 1; j >= 0; j--) {
            overlapLines.unshift(currentBuffer[j]);
            keptChars += currentBuffer[j].length + 1;
            if (keptChars >= overlapSize) break;
          }
          currentBuffer = overlapLines;
          currentBufferLength = keptChars;
        } else {
          currentBuffer = [];
          currentBufferLength = 0;
        }
      }
    }
  }

  return chunks;
}
