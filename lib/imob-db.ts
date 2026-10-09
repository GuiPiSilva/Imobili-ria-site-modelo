import 'server-only';

export type Resource = 'imob_tenants' | 'imob_memberships' | 'imob_properties' | 'imob_leads' | 'imob_visits' | 'imob_invoices';
export type Tenant = { id: string; name: string; slug: string; status: 'active' | 'suspended'; plan: string; created_at: string };
export type Membership = { id: string; tenant_id: string; identity_sub: string; display_name: string; role: 'owner' | 'manager' | 'agent'; status: 'active' | 'disabled' };
export type Listing = { id: string; tenant_id: string; title: string; type: string; deal_type: string; city: string; neighborhood: string; price: number; area_m2: number; image_url: string | null; description: string; status: string; created_at: string };
export type Lead = { id: string; tenant_id: string; name: string; email: string | null; phone: string; message: string | null; property_id: string | null; stage: string; created_at: string };
export type Visit = { id: string; tenant_id: string; lead_id: string; scheduled_at: string; notes: string | null; status: string };
export type Invoice = { id: string; tenant_id: string; title: string; amount: number; due_date: string; status: string; category: string };

// Apenas no servidor. Quando o banco ainda não está provisionado,
 // as telas administrativas exibem uma explicação em vez de quebrar.
export function isImobDatabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('SUPABASE_URL deve usar HTTPS.');
  return { url: parsed.origin, key };
}
export async function db<T>(table: Resource, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; query?: Record<string,string>; body?: unknown } = {}): Promise<T> {
  const { url, key } = config();
  const qs = new URLSearchParams(options.query || {});
  const response = await fetch(url + '/rest/v1/' + table + '?' + qs.toString(), {
    method: options.method || 'GET',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.text();
    console.error('Banco imobiliário:', response.status, error.slice(0, 350));
    throw new Error('Falha ao consultar ou salvar dados. Verifique a configuração e as permissões do banco.');
  }
  return await response.json() as T;
}
export const eq = (value: string) => 'eq.' + value;
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function getMemberships(sub: string) {
  return db<Membership[]>('imob_memberships', { query: { identity_sub: eq(sub), status: 'eq.active', select: '*' } });
}
export async function resolveTenant(sub: string, tenantId: string) {
  if (!isUuid(tenantId)) return null;
  const [tenants, membership] = await Promise.all([
    db<Tenant[]>('imob_tenants', { query: { id: eq(tenantId), status: 'eq.active', select: '*' } }),
    db<Membership[]>('imob_memberships', { query: { tenant_id: eq(tenantId), identity_sub: eq(sub), status: 'eq.active', select: '*' } })
  ]);
  if (!tenants[0] || !membership[0]) return null;
  return { tenant: tenants[0], membership: membership[0] };
}
export function isMaster(sub: string) {
  return (process.env.TERA_MASTER_SUBS || '').split(',').map(x => x.trim()).filter(Boolean).includes(sub);
}
