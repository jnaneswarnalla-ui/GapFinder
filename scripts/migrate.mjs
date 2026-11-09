import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('Connecting to Neon database...');
  const client = await pool.connect();
  try {
    console.log('Testing pgvector extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('pgvector extension enabled successfully!');

    console.log('Creating tables...');
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Materials table (uploaded files: syllabus, notes, past_papers)
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL, -- 'syllabus' | 'notes' | 'past_paper'
        raw_text TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        chunk_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Chunks table (vectorized and tsvector text fragments with source metadata)
      CREATE TABLE IF NOT EXISTS chunks (
        id VARCHAR(255) PRIMARY KEY,
        material_id VARCHAR(255) NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        chapter VARCHAR(255),
        section VARCHAR(255),
        page_number INTEGER DEFAULT 1,
        heading VARCHAR(255),
        embedding vector(768),
        tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_user_material ON chunks(user_id, material_id);
      CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON chunks USING GIN(tsv);

      -- Topics hierarchy table
      CREATE TABLE IF NOT EXISTS topics (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        unit_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        parent_topic_id VARCHAR(255) REFERENCES topics(id) ON DELETE SET NULL,
        exam_frequency INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_topics_user ON topics(user_id);

      -- Past Paper Questions
      CREATE TABLE IF NOT EXISTS past_paper_questions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        material_id VARCHAR(255) REFERENCES materials(id) ON DELETE SET NULL,
        question_text TEXT NOT NULL,
        year VARCHAR(50),
        marks INTEGER DEFAULT 1,
        linked_topic_id VARCHAR(255) REFERENCES topics(id) ON DELETE SET NULL,
        citation_snippet TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Quizzes table
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        topic_ids JSONB DEFAULT '[]'::jsonb,
        questions JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Quiz attempts table
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id VARCHAR(255) PRIMARY KEY,
        quiz_id VARCHAR(255) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score NUMERIC(5,2) NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        responses JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);

      -- Topic mastery & gap report state
      CREATE TABLE IF NOT EXISTS topic_mastery (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic_id VARCHAR(255) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'weak', -- 'weak' | 'medium' | 'strong'
        priority_score NUMERIC(7,2) NOT NULL DEFAULT 0,
        reason TEXT,
        misconceptions JSONB DEFAULT '[]'::jsonb,
        attempts_count INTEGER DEFAULT 0,
        last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT uq_user_topic UNIQUE(user_id, topic_id)
      );

      -- Revision plans
      CREATE TABLE IF NOT EXISTS revision_plans (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        days_available INTEGER NOT NULL,
        hours_per_day NUMERIC(4,2) NOT NULL,
        exam_date DATE,
        schedule JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_rev_plans_user ON revision_plans(user_id);
    `);

    console.log('All database tables & indexes created successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
