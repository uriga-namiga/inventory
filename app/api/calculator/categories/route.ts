import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyAuth } from '@/lib/calculator/auth';

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

// GET - 카테고리 목록 조회 (공개)
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY is_default DESC, created_at ASC'
    );
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('카테고리 조회 에러:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 카테고리 추가 (인증 필요)
export async function POST(request: Request) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '카테고리 이름을 입력해주세요.' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );

    return NextResponse.json({ category: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 카테고리입니다.' }, { status: 409 });
    }
    console.error('카테고리 생성 에러:', error);
    return NextResponse.json({ error: '카테고리 추가에 실패했습니다.' }, { status: 500 });
  }
}
