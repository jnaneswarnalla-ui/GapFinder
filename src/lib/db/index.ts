import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing");
}

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
} else {
  if (!global.__dbPool) {
    global.__dbPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  pool = global.__dbPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production' && duration > 500) {
    console.log('[DB slow query]', { text: text.slice(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  return await pool.connect();
}

export default pool;
