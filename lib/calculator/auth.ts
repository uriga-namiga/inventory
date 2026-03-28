import { cookies } from 'next/headers';

export async function verifyAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('calculator_admin_session');
    if (!session?.value) return false;
    // UUID v4 형식 검증 (랜덤 토큰인지 확인)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(session.value);
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}
