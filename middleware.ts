import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isPublicPath(pathname: string): boolean {
  // 로그인 페이지
  if (pathname.startsWith('/calculator/admin/login')) return true;

  // 계산기 공개 페이지 (관리자 제외)
  if (pathname === '/calculator') return true;
  if (pathname === '/calculator/practice') return true;

  // 인증 관련 API
  if (pathname.startsWith('/api/calculator/auth/')) return true;

  // 공개 읽기 API (GET만 허용하려면 route handler에서 처리)
  if (pathname === '/api/calculator/parts') return true;
  if (pathname === '/api/calculator/categories') return true;

  // 정적 파일
  if (pathname.startsWith('/_next/')) return true;
  if (pathname === '/favicon.ico') return true;

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 인증 불필요
  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // 그 외 모든 경로는 인증 필요
  const session = request.cookies.get('calculator_admin_session');
  if (!session?.value) {
    // API 요청이면 401 반환
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    // 페이지 요청이면 로그인으로 리다이렉트
    return NextResponse.redirect(
      new URL('/calculator/admin/login', request.url)
    );
  }

  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
