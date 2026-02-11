import { NextResponse } from 'next/server';
import { Client } from 'pg';

async function getDbClient() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

// GET - 전체 제품 목록 조회
export async function GET() {
  let client;
  try {
    client = await getDbClient();
    const result = await client.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('제품 조회 에러:', error);
    return NextResponse.json(
      { error: '제품 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}

// POST - 새 제품 생성
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { name, image_url, purchase_price, sale_price, margin_rate, quantity, link, supplier, purchase_date } = body;

    // 유효성 검사
    if (!name || purchase_price === undefined || sale_price === undefined) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    client = await getDbClient();
    
    // 구매처가 입력되었으면 suppliers 테이블에 저장
    if (supplier && supplier.trim()) {
      await client.query(
        `INSERT INTO suppliers (name) VALUES ($1) 
         ON CONFLICT (name) DO NOTHING`,
        [supplier.trim()]
      );
    }
    
    const result = await client.query(
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
  } finally {
    if (client) await client.end();
  }
}
