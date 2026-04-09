import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

export async function query(text: string, params?: any[]) {
    const result = await pool.query(text, params);
    return result.rows;
}

export default pool;