import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

export type IdentitySession = { sub: string; name: string; email: string; exp: number };
export const SESSION_COOKIE = 'tera_imoveis_session';
export const PENDING_COOKIE = 'tera_imoveis_oauth';
export const SESSION_AGE = 60 * 60 * 8;

export function oauthNonce() { return randomBytes(32).toString('base64url'); }
export function challenge(verifier: string) { return createHash('sha256').update(verifier).digest('base64url'); }
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET precisa ter ao menos 32 caracteres.');
  return value;
}
function mac(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
export function signPayload(value: object) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return payload + '.' + mac(payload);
}
export function verifyPayload<T>(token: string | undefined): T | null {
  if (!token) return null;
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;
    const expected = Buffer.from(mac(payload));
    const actual = Buffer.from(signature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T;
  } catch { return null; }
}
export function getIdentitySession(token: string | undefined): IdentitySession | null {
  const session = verifyPayload<IdentitySession>(token);
  if (!session || !session.sub || typeof session.exp !== 'number' || session.exp < Date.now() / 1000) return null;
  return session;
}
export function cookieSecure() { return (process.env.APP_URL || '').startsWith('https://'); }
export function appOrigin() {
  const url = new URL(process.env.APP_URL || 'http://localhost:3000');
  return url.origin;
}
