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

// GET - 제품 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    client = await getDbClient();
    const result = await client.query(
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

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('제품 조회 에러:', error);
    return NextResponse.json(
      { error: '제품을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}

// PUT - 제품 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
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
  } finally {
    if (client) await client.end();
  }
}

// DELETE - 제품 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    client = await getDbClient();
    const result = await client.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '제품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '제품이 삭제되었습니다.' });
  } catch (error) {
    console.error('제품 삭제 에러:', error);
    return NextResponse.json(
      { error: '제품 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}
