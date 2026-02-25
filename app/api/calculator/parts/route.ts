import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { verifyAuth } from '@/lib/calculator/auth';

async function getDbClient() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

// GET - 파츠 목록 조회 (공개)
export async function GET(request: Request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    client = await getDbClient();
    
    let query = 'SELECT * FROM parts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== '전체') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);
    
    return NextResponse.json({ parts: result.rows });
  } catch (error) {
    console.error('파츠 조회 에러:', error);
    return NextResponse.json(
      { error: '파츠 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}

// POST - 파츠 생성 (인증 필요)
export async function POST(request: Request) {
  let client;
  try {
    // 인증 확인
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, category, price, image_url } = body;

    // 유효성 검사
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    client = await getDbClient();
    
    const result = await client.query(
      `INSERT INTO parts (name, category, price, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, category, price, image_url || null]
    );

    return NextResponse.json({ part: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('파츠 생성 에러:', error);
    return NextResponse.json(
      { error: '파츠 등록에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}
