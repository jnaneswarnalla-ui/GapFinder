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

const res = await pool.query(`
  SELECT 
    (SELECT count(*) FROM users) as users,
    (SELECT count(*) FROM materials) as materials,
    (SELECT count(*) FROM chunks) as chunks,
    (SELECT count(*) FROM topics) as topics,
    (SELECT count(*) FROM past_paper_questions) as ppq,
    (SELECT count(*) FROM quiz_attempts) as attempts,
    (SELECT count(*) FROM topic_mastery) as mastery,
    (SELECT count(*) FROM revision_plans) as plans;
`);
console.log('Database Counts:', res.rows[0]);
await pool.end();
