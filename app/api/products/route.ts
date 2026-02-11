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
    const { name, image_url, purchase_price, sale_price, margin_rate, quantity, link } = body;

    // 유효성 검사
    if (!name || purchase_price === undefined || sale_price === undefined) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    client = await getDbClient();
    const result = await client.query(
      `INSERT INTO products (name, image_url, purchase_price, sale_price, margin_rate, quantity, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, image_url || null, purchase_price, sale_price, margin_rate, quantity || 0, link || null]
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
