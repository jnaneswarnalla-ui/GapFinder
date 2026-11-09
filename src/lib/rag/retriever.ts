import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/ai/gemini';

export interface RetrievedChunk {
  id: string;
  materialId: string;
  materialTitle: string;
  fileType: string;
  content: string;
  chapter?: string;
  section?: string;
  heading?: string;
  pageNumber: number;
  similarityScore: number;
  lexicalRank?: number;
  hybridScore: number;
}

export interface RetrievalOptions {
  userId: string;
  queryText: string;
  topK?: number;
  fileTypeFilter?: 'syllabus' | 'notes' | 'past_paper';
  materialIdFilter?: string;
}

export async function hybridRetrieve(options: RetrievalOptions): Promise<RetrievedChunk[]> {
  const { userId, queryText, topK = 5, fileTypeFilter, materialIdFilter } = options;
  const cleanQuery = queryText.trim();
  if (!cleanQuery) return [];

  // 1. Try vector embedding
  let embeddingVector: number[] | null = null;
  try {
    embeddingVector = await generateEmbedding(cleanQuery);
  } catch (err) {
    console.warn('[Hybrid Retriever] Embedding failed, proceeding with lexical fallback');
  }

  // 2. Perform Hybrid or Lexical-only Postgres search
  if (embeddingVector && embeddingVector.length === 768) {
    const vectorStr = `[${embeddingVector.join(',')}]`;
    const params: any[] = [vectorStr, cleanQuery, userId];

    let whereExtra = '';
    if (fileTypeFilter) {
      params.push(fileTypeFilter);
      whereExtra += ` AND m.file_type = $${params.length}`;
    }
    if (materialIdFilter) {
      params.push(materialIdFilter);
      whereExtra += ` AND c.material_id = $${params.length}`;
    }
    params.push(topK);
    const limitPlaceholder = `$${params.length}`;

    const sql = `
      SELECT 
        c.id,
        c.material_id,
        m.title AS material_title,
        m.file_type,
        c.content,
        c.chapter,
        c.section,
        c.heading,
        c.page_number,
        1 - (c.embedding <=> $1::vector) AS vector_sim,
        ts_rank_cd(c.tsv, plainto_tsquery('english', $2)) AS text_rank
      FROM chunks c
      JOIN materials m ON m.id = c.material_id
      WHERE c.user_id = $3 ${whereExtra}
      ORDER BY 
        (0.7 * (1 - (c.embedding <=> $1::vector)) + 0.3 * LEAST(1.0, ts_rank_cd(c.tsv, plainto_tsquery('english', $2)) * 2)) DESC
      LIMIT ${limitPlaceholder};
    `;

    try {
      const res = await query(sql, params);
      if (res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          materialId: r.material_id,
          materialTitle: r.material_title,
          fileType: r.file_type,
          content: r.content,
          chapter: r.chapter || undefined,
          section: r.section || undefined,
          heading: r.heading || undefined,
          pageNumber: r.page_number,
          similarityScore: parseFloat(r.vector_sim || '0'),
          lexicalRank: parseFloat(r.text_rank || '0'),
          hybridScore: parseFloat(r.vector_sim || '0') * 0.7 + Math.min(1.0, parseFloat(r.text_rank || '0') * 2) * 0.3,
        }));
      }
    } catch (err) {
      console.warn('[Hybrid Retriever] Vector query error, falling back to lexical:', err);
    }
  }

  // 3. Fallback: Lexical tsvector search
  const fallbackParams: any[] = [cleanQuery, userId];
  let fallbackWhereExtra = '';
  if (fileTypeFilter) {
    fallbackParams.push(fileTypeFilter);
    fallbackWhereExtra += ` AND m.file_type = $${fallbackParams.length}`;
  }
  if (materialIdFilter) {
    fallbackParams.push(materialIdFilter);
    fallbackWhereExtra += ` AND c.material_id = $${fallbackParams.length}`;
  }
  fallbackParams.push(topK);
  const fallbackLimitPlaceholder = `$${fallbackParams.length}`;

  const lexicalSql = `
    SELECT 
      c.id,
      c.material_id,
      m.title AS material_title,
      m.file_type,
      c.content,
      c.chapter,
      c.section,
      c.heading,
      c.page_number,
      ts_rank_cd(c.tsv, plainto_tsquery('english', $1)) AS text_rank
    FROM chunks c
    JOIN materials m ON m.id = c.material_id
    WHERE c.user_id = $2 ${fallbackWhereExtra}
    ORDER BY text_rank DESC
    LIMIT ${fallbackLimitPlaceholder};
  `;

  const fallbackRes = await query(lexicalSql, fallbackParams);
  return fallbackRes.rows.map(r => ({
    id: r.id,
    materialId: r.material_id,
    materialTitle: r.material_title,
    fileType: r.file_type,
    content: r.content,
    chapter: r.chapter || undefined,
    section: r.section || undefined,
    heading: r.heading || undefined,
    pageNumber: r.page_number,
    similarityScore: 0,
    lexicalRank: parseFloat(r.text_rank || '0'),
    hybridScore: Math.min(1.0, parseFloat(r.text_rank || '0')),
  }));
}
