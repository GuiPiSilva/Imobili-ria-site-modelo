import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIdentitySession, SESSION_COOKIE } from '@/lib/tera-session';
import { getMemberships, resolveTenant, isMaster, type Tenant, type Membership, db } from '@/lib/imob-db';

export async function session() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getIdentitySession(token);
}
export async function requireIdentity() {
  const person = await session();
  if (!person) redirect('/acesso');
  return person;
}
export async function getTenantChoices(sub: string) {
  if (isMaster(sub)) return db<Tenant[]>('imob_tenants', { query: { select: '*', order: 'created_at.desc' } });
  const memberships = await getMemberships(sub);
  if (!memberships.length) return [];
  const tenants = await db<Tenant[]>('imob_tenants', { query: { id: 'in.(' + memberships.map(m => m.tenant_id).join(',') + ')', status: 'eq.active', select: '*', order: 'name.asc' } });
  return tenants;
}
export async function requireTenant(tenantId: string) {
  const person = await requireIdentity();
  if (isMaster(person.sub)) {
    const matches = await db<Tenant[]>('imob_tenants', { query: { id: 'eq.' + tenantId, select: '*' } });
    if (!matches[0]) redirect('/painel');
    return { person, tenant: matches[0], membership: { role: 'owner', identity_sub: person.sub } as Membership, master: true };
  }
  const match = await resolveTenant(person.sub, tenantId);
  if (!match) redirect('/sem-acesso');
  return { person, ...match, master: false };
}
