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

// GET - 제품 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getPool();
    const result = await pool.query(
      `SELECT
        id, name, image_url, purchase_price, sale_price, margin_rate,
        quantity, link, supplier,
        TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date,
        created_at, updated_at
       FROM products
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('제품 조회 에러:', error);
    return NextResponse.json(
      { error: '제품을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT - 제품 수정 (인증 필요)
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
    const { name, image_url, purchase_price, sale_price, margin_rate, quantity, link, supplier, purchase_date } = body;

    // 유효성 검사
    if (!name || purchase_price === undefined || sale_price === undefined) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // 구매처가 입력되었으면 suppliers 테이블에 저장
    if (supplier && supplier.trim()) {
      await pool.query(
        'INSERT INTO suppliers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [supplier.trim()]
      );
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1, image_url = $2, purchase_price = $3, sale_price = $4,
           margin_rate = $5, quantity = $6, link = $7, supplier = $8, purchase_date = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, image_url || null, purchase_price, sale_price, margin_rate, quantity || 0, link || null, supplier || null, purchase_date || null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('제품 수정 에러:', error);
    return NextResponse.json(
      { error: '제품 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 제품 삭제 (인증 필요)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const pool = getPool();
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '제품��� 삭제되었습니다.' });
  } catch (error) {
    console.error('제품 삭제 에러:', error);
    return NextResponse.json(
      { error: '제품 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
