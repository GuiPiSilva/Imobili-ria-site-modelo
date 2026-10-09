import { NextResponse } from 'next/server';
import { oauthNonce, challenge, signPayload, PENDING_COOKIE, cookieSecure, appOrigin } from '@/lib/tera-session';

export const runtime = 'nodejs';
export async function GET() {
  try {
    const state = oauthNonce();
    const verifier = oauthNonce();
    const origin = appOrigin();
    const idp = new URL(process.env.TERAAPPS_AUTH_URL || '');
    if (idp.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(idp.hostname)) throw Error('Provedor inválido');
    const clientId = process.env.TERAAPPS_CLIENT_ID || 'tera_imoveis_web';
    const redirectUri = origin + '/api/auth/callback';
    const target = new URL('/sso', idp.origin);
    target.searchParams.set('client_id', clientId);
    target.searchParams.set('redirect_uri', redirectUri);
    target.searchParams.set('state', state);
    target.searchParams.set('code_challenge', challenge(verifier));
    target.searchParams.set('code_challenge_method', 'S256');
    const response = NextResponse.redirect(target);
    response.cookies.set(PENDING_COOKIE, signPayload({ state, verifier, exp: Date.now() + 600000 }), { httpOnly: true, secure: cookieSecure(), sameSite: 'lax', path: '/', maxAge: 600 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.json({ error: 'SSO não configurado. Defina TERAAPPS_AUTH_URL, APP_URL e SESSION_SECRET.' }, { status: 503 });
  }
}
