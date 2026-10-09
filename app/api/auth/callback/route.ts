import { NextRequest, NextResponse } from 'next/server';
import { PENDING_COOKIE, SESSION_COOKIE, SESSION_AGE, cookieSecure, appOrigin, signPayload, verifyPayload } from '@/lib/tera-session';

export const runtime = 'nodejs';
type Pending = { state: string; verifier: string; exp: number };
type UserInfo = { sub: string; name: string; email: string; issuer: string; client_id: string };
function errorRedirect(reason: string) {
  return NextResponse.redirect(new URL('/acesso?erro=' + encodeURIComponent(reason), appOrigin()));
}
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const pending = verifyPayload<Pending>(req.cookies.get(PENDING_COOKIE)?.value);
  const state = q.get('state');
  const code = q.get('code');
  if (!pending || pending.exp < Date.now() || !state || state !== pending.state || !code) return errorRedirect('Fluxo de autenticação inválido ou expirado.');
  try {
    const origin = new URL(process.env.TERACODE_AUTH_URL || '').origin;
    const clientId = process.env.TERACODE_CLIENT_ID || 'tera-imoveis';
    const tokenResponse = await fetch(origin + '/api/oauth/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, redirect_uri: appOrigin() + '/api/auth/callback', code, code_verifier: pending.verifier }),
      cache: 'no-store', signal: AbortSignal.timeout(12000),
    });
    if (!tokenResponse.ok) throw Error('Código de acesso recusado');
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) throw Error('Token ausente');
    const infoResponse = await fetch(origin + '/api/oauth/userinfo', {
      headers: { Authorization: 'Bearer ' + token.access_token }, cache: 'no-store', signal: AbortSignal.timeout(12000),
    });
    if (!infoResponse.ok) throw Error('Identidade não verificada');
    const info = await infoResponse.json() as UserInfo;
    if (!info.sub || info.issuer !== 'teracode' || info.client_id !== clientId) throw Error('Emissor ou aplicativo inválido');
    const response = NextResponse.redirect(new URL('/painel', appOrigin()));
    response.cookies.set(SESSION_COOKIE, signPayload({ sub: info.sub, name: info.name, email: info.email, exp: Math.floor(Date.now() / 1000) + SESSION_AGE }), { httpOnly: true, secure: cookieSecure(), sameSite: 'lax', path: '/', maxAge: SESSION_AGE });
    response.cookies.delete(PENDING_COOKIE);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (e) {
    console.error('TeraApps SSO:', e instanceof Error ? e.message : 'erro');
    return errorRedirect('Não foi possível validar sua conta TeraApps.');
  }
}
