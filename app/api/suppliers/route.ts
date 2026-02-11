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

// GET - 구매처 목록 조회
export async function GET() {
  let client;
  try {
    client = await getDbClient();
    const result = await client.query(
      'SELECT name FROM suppliers ORDER BY name ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('구매처 조회 에러:', error);
    return NextResponse.json(
      { error: '구매처 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    if (client) await client.end();
  }
}
