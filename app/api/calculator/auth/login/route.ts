import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';

// 인메모리 Rate Limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15분

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const now = Date.now();

    // 만료된 시도 리셋
    const attempt = loginAttempts.get(ip);
    if (attempt && now > attempt.resetAt) {
      loginAttempts.delete(ip);
    }

    // Rate limit 체크
    const current = loginAttempts.get(ip);
    if (current && current.count >= MAX_ATTEMPTS) {
      const remainMin = Math.ceil((current.resetAt - now) / 60000);
      return NextResponse.json(
        { error: `로그인 시도가 너무 많습니다. ${remainMin}분 후 다시 시도해주세요.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.CALCULATOR_ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('CALCULATOR_ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { error: '서버 설정 오류입니다.' },
        { status: 500 }
      );
    }

    // 타이밍 안전 비교 (timing-safe comparison)
    const passwordHash = createHash('sha256').update(password || '').digest();
    const adminHash = createHash('sha256').update(adminPassword).digest();
    const isValid = timingSafeEqual(passwordHash, adminHash);

    if (isValid) {
      // 성공 시 Rate limit 리셋
      loginAttempts.delete(ip);

      // 랜덤 세션 토큰 생성
      const sessionToken = randomUUID();

      const cookieStore = await cookies();
      cookieStore.set('calculator_admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      // 실패 카운트 증가
      const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
      entry.count++;
      loginAttempts.set(ip, entry);

      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
