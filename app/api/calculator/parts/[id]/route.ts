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

// PUT - 파츠 수정 (인증 필요)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, category, price, image_url } = body;
    
    const pool = getPool();
    const result = await pool.query(
      `UPDATE parts 
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           price = COALESCE($3, price),
           image_url = COALESCE($4, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, category, price, image_url, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '파츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ part: result.rows[0] });
  } catch (error) {
    console.error('파츠 수정 에러:', error);
    return NextResponse.json(
      { error: '파츠 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 파츠 삭제 (인증 필요)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const isAuthenticated = await verifyAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    const pool = getPool();
    
    // 파츠 정보 조회 (이미지 URL 가져오기)
    const partResult = await pool.query('SELECT image_url FROM parts WHERE id = $1', [id]);

    if (partResult.rows.length === 0) {
      return NextResponse.json(
        { error: '파츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // TODO: Cloudinary에서 이미지 삭제 (향후 구현)
    // const imageUrl = partResult.rows[0].image_url;
    // if (imageUrl) {
    //   await deleteFromCloudinary(imageUrl);
    // }

    // 파츠 삭제
    await pool.query('DELETE FROM parts WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('파츠 삭제 에러:', error);
    return NextResponse.json(
      { error: '파츠 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
