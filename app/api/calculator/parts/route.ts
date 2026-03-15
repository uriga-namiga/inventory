import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyAuth } from '@/lib/calculator/auth';

// Serverless 환경에서 Pool 재사용을 위한 글로벌 변수
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1, // Serverless에서는 연결 수 최소화
    });
  }
  return pool;
}

// GET - 파츠 목록 조회 (공개)
// 클라이언트에서 필터링하므로 전체 목록만 반환
export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    const queryStart = Date.now();
    const pool = getPool();
    const result = await pool.query('SELECT * FROM parts ORDER BY created_at DESC');
    const queryTime = Date.now() - queryStart;
    const totalTime = Date.now() - startTime;
    
    console.log(`[PERF] Parts API - Query: ${queryTime}ms, Total: ${totalTime}ms`);
    
    return NextResponse.json({ 
      parts: result.rows,
      _perf: process.env.NODE_ENV === 'development' ? { queryTime, totalTime } : undefined
    });
  } catch (error) {
    console.error('파츠 조회 에러:', error);
    return NextResponse.json(
      { error: '파츠 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 파츠 생성 (인증 필요)
export async function POST(request: Request) {
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
    
    const pool = getPool();
    const result = await pool.query(
      'INSERT INTO parts (name, category, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, category, price, image_url || null]
    );

    return NextResponse.json({ part: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('파츠 생성 에러:', error);
    return NextResponse.json(
      { error: '파츠 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}
