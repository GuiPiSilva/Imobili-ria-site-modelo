import { NextResponse } from 'next/server';
import { appOrigin, SESSION_COOKIE, PENDING_COOKIE } from '@/lib/tera-session';
export async function POST() {
  const response = NextResponse.redirect(new URL('/', appOrigin()), 303);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(PENDING_COOKIE);
  return response;
}
