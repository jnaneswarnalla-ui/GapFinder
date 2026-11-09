import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await pool.query(`
    ALTER TABLE topic_mastery ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE topic_mastery ALTER COLUMN topic_id TYPE VARCHAR(255);
    ALTER TABLE topic_mastery ALTER COLUMN user_id TYPE VARCHAR(255);
    ALTER TABLE quiz_attempts ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE quiz_attempts ALTER COLUMN quiz_id TYPE VARCHAR(255);
    ALTER TABLE quiz_attempts ALTER COLUMN user_id TYPE VARCHAR(255);
    ALTER TABLE quizzes ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE quizzes ALTER COLUMN user_id TYPE VARCHAR(255);
    ALTER TABLE topics ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE topics ALTER COLUMN user_id TYPE VARCHAR(255);
    ALTER TABLE past_paper_questions ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE past_paper_questions ALTER COLUMN linked_topic_id TYPE VARCHAR(255);
    ALTER TABLE chunks ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE chunks ALTER COLUMN material_id TYPE VARCHAR(255);
    ALTER TABLE materials ALTER COLUMN id TYPE VARCHAR(255);
    ALTER TABLE revision_plans ALTER COLUMN id TYPE VARCHAR(255);
  `);
  console.log('All ID columns enlarged to VARCHAR(255) successfully!');
  await pool.end();
}

run();
