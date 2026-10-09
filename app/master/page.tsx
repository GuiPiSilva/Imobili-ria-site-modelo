import { redirect } from 'next/navigation';
import { requireIdentity } from '@/lib/imob-access';
import { db, isMaster, isImobDatabaseConfigured, type Tenant, type Membership } from '@/lib/imob-db';
import { MasterDashboard } from '@/components/master-dashboard';
import { AdminSetupPending } from '@/components/admin-setup-pending';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administração Master', robots: { index: false, follow: false } };
export default async function Master() {
  const person=await requireIdentity();
  if(!isMaster(person.sub)) redirect('/sem-acesso');
  if (!isImobDatabaseConfigured()) return <AdminSetupPending email={person.email} isMaster />;
  const [tenants,members]=await Promise.all([
    db<Tenant[]>('imob_tenants',{query:{select:'*',order:'created_at.desc'}}),
    db<Membership[]>('imob_memberships',{query:{select:'*',order:'created_at.asc'}})
  ]);
  return <MasterDashboard person={person} tenants={tenants} members={members}/>;
}
