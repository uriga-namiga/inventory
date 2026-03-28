import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyAuth } from '@/lib/calculator/auth';

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

// PUT - 카테고리 수정 (인증 필요)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '카테고리 이름을 입력해주세요.' }, { status: 400 });
    }

    const pool = getPool();

    // 기본 카테고리 수정 불가
    const check = await pool.query('SELECT is_default FROM categories WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (check.rows[0].is_default) {
      return NextResponse.json({ error: '기본 카테고리는 수정할 수 없습니다.' }, { status: 403 });
    }

    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );

    return NextResponse.json({ category: result.rows[0] });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 카테고리입니다.' }, { status: 409 });
    }
    console.error('카테고리 수정 에러:', error);
    return NextResponse.json({ error: '카테고리 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE - 카테고리 삭제 (인증 필요)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const pool = getPool();

    // 기본 카테고리 삭제 불가
    const check = await pool.query('SELECT is_default FROM categories WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (check.rows[0].is_default) {
      return NextResponse.json({ error: '기본 카테고리는 삭제할 수 없습니다.' }, { status: 403 });
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('카테고리 삭제 에러:', error);
    return NextResponse.json({ error: '카테고리 삭제에 실패했습니다.' }, { status: 500 });
  }
}
