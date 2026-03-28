import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = [
  '/calculator/admin/login',
  '/calculator',
  '/api/calculator/auth/login',
  '/api/calculator/auth/logout',
  '/api/calculator/auth/verify',
  '/api/calculator/parts',
  '/api/calculator/categories',
];

function isPublicPath(pathname: string): boolean {
  // 정확히 일치하는 공개 경로
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // 정적 파일, 이미지 등
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

  // 그 외 모든 경로 (메인 페이지, 관리자 페이지, API 등)는 인증 필요
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
