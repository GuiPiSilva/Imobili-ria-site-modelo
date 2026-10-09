import { redirect } from 'next/navigation';
import { requireIdentity, getTenantChoices, requireTenant } from '@/lib/imob-access';
import { db, eq, isMaster, type Listing, type Lead, type Visit, type Invoice, type Membership } from '@/lib/imob-db';
import { AdminWorkbench } from '@/components/admin-workbench';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel imobiliário', robots: { index: false, follow: false } };
export default async function Painel({searchParams}:{searchParams:Promise<{tenant?:string}>}) {
  const person = await requireIdentity();
  const tenants = await getTenantChoices(person.sub);
  if (!tenants.length) redirect(isMaster(person.sub)?'/master':'/sem-acesso');
  const q = await searchParams;
  const tenantId = q.tenant && tenants.some(t=>t.id===q.tenant) ? q.tenant : tenants[0].id;
  const access = await requireTenant(tenantId);
  const role = access.membership.role;
  const [properties,leads,visits,invoices,members] = await Promise.all([
    db<Listing[]>('imob_properties',{query:{tenant_id:eq(tenantId),select:'*',order:'created_at.desc'}}),
    db<Lead[]>('imob_leads',{query:{tenant_id:eq(tenantId),select:'*',order:'created_at.desc'}}),
    db<Visit[]>('imob_visits',{query:{tenant_id:eq(tenantId),select:'*',order:'scheduled_at.asc'}}),
    role==='owner' ? db<Invoice[]>('imob_invoices',{query:{tenant_id:eq(tenantId),select:'*',order:'due_date.asc'}}) : Promise.resolve([]),
    role==='owner' ? db<Membership[]>('imob_memberships',{query:{tenant_id:eq(tenantId),select:'*',order:'created_at.asc'}}) : Promise.resolve([])
  ]);
  return <AdminWorkbench person={person} tenant={access.tenant} tenants={tenants} role={role} master={access.master} properties={properties} leads={leads} visits={visits} invoices={invoices} members={members}/>;
}
