import { cookies } from 'next/headers';

export async function verifyAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('calculator_admin_session');
    return session?.value === 'authenticated';
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}
