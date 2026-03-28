import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/calculator/auth';

export async function GET() {
  try {
    const isAuthenticated = await verifyAuth();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    console.error('인증 확인 에러:', error);
    return NextResponse.json({ authenticated: false });
  }
}
