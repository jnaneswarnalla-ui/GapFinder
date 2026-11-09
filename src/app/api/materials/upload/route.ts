import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import { parseDocumentBuffer } from '@/lib/rag/parser';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbedding } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const pastedText = formData.get('text') as string | null;
    const title = (formData.get('title') as string) || 'Untitled Document';
    const fileType = (formData.get('fileType') as string) || 'notes';

    if (!['syllabus', 'notes', 'past_paper'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Must be syllabus, notes, or past_paper' }, { status: 400 });
    }

    let rawText = '';
    let fileSize = 0;
    let pages: { pageNumber: number; text: string }[] | undefined = undefined;

    if (file) {
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsed = await parseDocumentBuffer(buffer, file.name);

      if (parsed.isScannedOrEmpty) {
        return NextResponse.json({
          error: 'The uploaded PDF appears to be empty or contains scanned images without selectable text. Please upload a digital PDF with selectable text or paste the text directly.',
        }, { status: 422 });
      }

      rawText = parsed.text;
      pages = parsed.pages;
    } else if (pastedText && pastedText.trim().length > 0) {
      rawText = pastedText.trim();
      fileSize = Buffer.byteLength(rawText, 'utf-8');
      pages = [{ pageNumber: 1, text: rawText }];
    } else {
      return NextResponse.json({ error: 'Please provide either a file or pasted text' }, { status: 400 });
    }

    const materialId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveTitle = file ? file.name : title;

    // Insert material record
    await query(
      `INSERT INTO materials (id, user_id, title, file_type, raw_text, file_size, chunk_count)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [materialId, user.id, effectiveTitle, fileType, rawText, fileSize]
    );

    // Chunk document
    const chunks = chunkDocument(materialId, effectiveTitle, fileType as any, rawText, pages, {
      maxChunkSize: 700,
      overlapSize: 120,
    });

    let embeddedCount = 0;
    for (const chunk of chunks) {
      let embeddingVector: number[] | null = null;
      try {
        embeddingVector = await generateEmbedding(chunk.content);
        if (embeddingVector) embeddedCount++;
      } catch (err) {
        // Fallback to lexical search
      }

      const vectorParam = (embeddingVector && embeddingVector.length === 768)
        ? `[${embeddingVector.join(',')}]`
        : null;

      await query(
        `INSERT INTO chunks (id, material_id, user_id, content, chapter, section, page_number, heading, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector)`,
        [
          chunk.id,
          materialId,
          user.id,
          chunk.content,
          chunk.metadata.chapter || null,
          chunk.metadata.section || null,
          chunk.metadata.pageNumber || 1,
          chunk.metadata.heading || null,
          vectorParam,
        ]
      );
    }

    await query(
      `UPDATE materials SET chunk_count = $1 WHERE id = $2`,
      [chunks.length, materialId]
    );

    return NextResponse.json({
      success: true,
      materialId,
      title: effectiveTitle,
      fileType,
      chunkCount: chunks.length,
      embeddedCount,
      message: `Document parsed into ${chunks.length} chunks (${embeddedCount} vectorized, BM25 index ready).`,
    });
  } catch (err: any) {
    console.error('Material upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process document' }, { status: 500 });
  }
}
