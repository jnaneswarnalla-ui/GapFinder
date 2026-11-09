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
  const res = await pool.query(`
    SELECT content, ts_rank_cd(tsv, plainto_tsquery('english', 'photolysis of water photosynthesis')) as rank
    FROM chunks
    WHERE user_id = 'usr_demo_gapfinder_2026'
    ORDER BY rank DESC
    LIMIT 3;
  `);
  console.log('Lexical ranks:', res.rows.map(r => ({ rank: r.rank, snippet: r.content.slice(0, 80) })));
  await pool.end();
}
run();
