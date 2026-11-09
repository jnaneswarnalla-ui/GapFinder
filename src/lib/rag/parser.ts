import { extractText, getDocumentProxy } from 'unpdf';

export interface ParsedDocument {
  text: string;
  pageCount: number;
  pages: { pageNumber: number; text: string }[];
  isScannedOrEmpty: boolean;
}

export async function parseDocumentBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ParsedDocument> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    const text = buffer.toString('utf-8');
    const isScannedOrEmpty = text.trim().length === 0;
    return {
      text,
      pageCount: 1,
      pages: [{ pageNumber: 1, text }],
      isScannedOrEmpty,
    };
  }

  if (extension === 'pdf') {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { totalPages, text: extractedTextArr } = await extractText(pdf, { mergePages: false });

      const pages: { pageNumber: number; text: string }[] = [];
      let fullText = '';

      for (let i = 0; i < totalPages; i++) {
        const pageText = (extractedTextArr && extractedTextArr[i]) ? extractedTextArr[i] : '';
        pages.push({
          pageNumber: i + 1,
          text: pageText,
        });
        fullText += `\n\n--- Page ${i + 1} ---\n\n` + pageText;
      }

      // Check if document has too little text (scanned image or empty PDF)
      const cleanText = fullText.replace(/[\s\r\n\t\-Page\d]+/g, ' ').trim();
      const isScannedOrEmpty = cleanText.length < 50;

      return {
        text: fullText.trim(),
        pageCount: totalPages,
        pages,
        isScannedOrEmpty,
      };
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document: ${err.message || 'Corrupted or password-protected PDF'}`);
    }
  }

  // Fallback for raw text
  const fallbackText = buffer.toString('utf-8');
  return {
    text: fallbackText,
    pageCount: 1,
    pages: [{ pageNumber: 1, text: fallbackText }],
    isScannedOrEmpty: fallbackText.trim().length < 20,
  };
}
