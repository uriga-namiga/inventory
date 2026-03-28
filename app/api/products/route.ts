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

// GET - 전체 제품 목록 조회
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT
        id, name, image_url, purchase_price, sale_price, margin_rate,
        quantity, link, supplier,
        TO_CHAR(purchase_date, 'YYYY-MM-DD') as purchase_date,
        created_at, updated_at
       FROM products
       ORDER BY created_at DESC`
    );

    return NextResponse.json(result.rows, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('제품 조회 에러:', error);
    return NextResponse.json(
      { error: '제품 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 새 제품 생성 (인증 필요)
export async function POST(request: Request) {
  try {
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

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

    // 구매처가 입력되었으면 suppliers 테���블에 저장
    if (supplier && supplier.trim()) {
      await pool.query(
        'INSERT INTO suppliers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [supplier.trim()]
      );
    }

    const result = await pool.query(
      `INSERT INTO products (name, image_url, purchase_price, sale_price, margin_rate, quantity, link, supplier, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, image_url || null, purchase_price, sale_price, margin_rate, quantity || 0, link || null, supplier || null, purchase_date || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('제품 생성 에러:', error);
    return NextResponse.json(
      { error: '제품 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
