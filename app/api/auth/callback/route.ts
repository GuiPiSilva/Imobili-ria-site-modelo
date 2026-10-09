import { NextRequest, NextResponse } from 'next/server';
import { PENDING_COOKIE, SESSION_COOKIE, SESSION_AGE, cookieSecure, appOrigin, signPayload, verifyPayload } from '@/lib/tera-session';

export const runtime = 'nodejs';
type Pending = { state: string; verifier: string; exp: number };
type TeraIdResponse = {
  token_type?: string;
  user?: { sub?: string; name?: string; email?: string; email_verified?: boolean };
};
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
    const provider = new URL(process.env.TERAAPPS_AUTH_URL || '');
    if (provider.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(provider.hostname)) throw Error('Provedor TeraApps inválido');
    const clientId = process.env.TERAAPPS_CLIENT_ID || 'tera_imoveis_web';
    const tokenResponse = await fetch(provider.origin + '/api/oauth/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code', client_id: clientId,
        redirect_uri: appOrigin() + '/api/auth/callback',
        code, code_verifier: pending.verifier
      }),
      cache: 'no-store', signal: AbortSignal.timeout(12000),
    });
    if (!tokenResponse.ok) throw Error('Código de acesso recusado pela Tera ID');
    const identity = await tokenResponse.json() as TeraIdResponse;
    const user = identity.user;
    if (identity.token_type !== 'tera_identity' || !user ||
        typeof user.sub !== 'string' || !user.sub.trim() ||
        typeof user.email !== 'string' || !user.email.trim() || user.email_verified !== true) {
      throw Error('Identidade Tera ID não verificada');
    }
    const response = NextResponse.redirect(new URL('/painel', appOrigin()));
    response.cookies.set(SESSION_COOKIE, signPayload({
      sub: user.sub, name: user.name || user.email, email: user.email,
      exp: Math.floor(Date.now() / 1000) + SESSION_AGE
    }), { httpOnly: true, secure: cookieSecure(), sameSite: 'lax', path: '/', maxAge: SESSION_AGE });
    response.cookies.delete(PENDING_COOKIE);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Tera ID SSO:', error instanceof Error ? error.message : 'erro');
    const response = errorRedirect('Não foi possível validar sua conta TeraApps.');
    response.cookies.delete(PENDING_COOKIE);
    return response;
  }
}
