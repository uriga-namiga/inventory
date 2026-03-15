import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

// GET - 구매처 목록 조회
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT name FROM suppliers ORDER BY name ASC');
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('구매처 조회 에러:', error);
    return NextResponse.json(
      { error: '구매처 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
