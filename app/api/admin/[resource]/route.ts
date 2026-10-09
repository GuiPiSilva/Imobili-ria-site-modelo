import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/imob-access';
import { db, eq, isMaster, isUuid, resolveTenant, type Resource } from '@/lib/imob-db';
import { appOrigin } from '@/lib/tera-session';

export const runtime = 'nodejs';
const resourceMap = { properties: 'imob_properties', leads: 'imob_leads', visits: 'imob_visits', invoices: 'imob_invoices', members: 'imob_memberships' } as const;
type Name = keyof typeof resourceMap;
const id = z.string().uuid();
const property = z.object({
  title: z.string().trim().min(3).max(160), type: z.enum(['casa','apartamento','predio','galpao','terreno','comercial']),
  deal_type: z.enum(['venda','locacao']), city: z.string().trim().min(2).max(100),
  neighborhood: z.string().trim().max(100).default(''), price: z.coerce.number().finite().min(0).max(10000000000),
  area_m2: z.coerce.number().finite().min(0).max(10000000),
  image_url: z.union([z.string().url().refine(v => v.startsWith('https://')).max(1000), z.literal('')]).default(''),
  description: z.string().trim().max(6000).default(''), status: z.enum(['draft','published','archived']).default('draft')
}).strict();
const lead = z.object({
  name: z.string().trim().min(2).max(120), email: z.union([z.string().email().max(200), z.literal('')]).default(''),
  phone: z.string().trim().min(8).max(30), message: z.string().trim().max(2000).default(''),
  property_id: z.union([id,z.literal('')]).default(''), stage: z.enum(['new','contacted','visit','proposal','won','lost']).default('new')
}).strict();
const visit = z.object({
  lead_id: id, scheduled_at: z.string().datetime({ offset: true }),
  notes: z.string().trim().max(2000).default(''), status: z.enum(['scheduled','completed','cancelled']).default('scheduled')
}).strict();
const invoice = z.object({
  title: z.string().trim().min(2).max(200), amount: z.coerce.number().finite().min(0).max(10000000000),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), category: z.enum(['receita','despesa']),
  status: z.enum(['pending','paid','late']).default('pending')
}).strict();
const member = z.object({
  identity_sub: z.string().trim().min(1).max(120), display_name: z.string().trim().max(120).default(''),
  role: z.enum(['manager','agent']), status: z.enum(['active','disabled']).default('active')
}).strict();
const schemas = { properties: property, leads: lead, visits: visit, invoices: invoice, members: member };
const patchSchemas = {
  properties: property.partial(), leads: lead.partial(), visits: visit.partial(), invoices: invoice.partial(),
  members: z.object({ display_name: z.string().trim().max(120).optional(), status: z.enum(['active','disabled']).optional(), role: z.enum(['manager','agent']).optional() }).strict()
};
function response(message: string, status: number) { return NextResponse.json({ error: message }, { status }); }
function canWrite(name: Name, role: string) {
  if (role === 'owner') return true;
  if (role === 'manager') return name === 'properties' || name === 'leads' || name === 'visits';
  return name === 'leads' || name === 'visits';
}
function canRead(name: Name, role: string) {
  if (role === 'owner') return true;
  if (role === 'manager') return name !== 'invoices' && name !== 'members';
  return name === 'properties' || name === 'leads' || name === 'visits';
}
async function context(req: NextRequest, name: string, write = false) {
  if (!(name in resourceMap)) return { error: response('Recurso não encontrado.', 404) };
  const person = await session();
  if (!person) return { error: response('Sessão expirada. Faça login novamente.', 401) };
  const tenantId = req.nextUrl.searchParams.get('tenant') || '';
  if (!isUuid(tenantId)) return { error: response('Imobiliária inválida.', 400) };
  let role = 'owner';
  if (isMaster(person.sub)) {
    const check = await db<{id:string;status:string}[]>('imob_tenants', {query:{id:eq(tenantId),select:'id,status'}});
    if (!check[0]) return {error:response('Imobiliária não encontrada.',404)};
  } else {
    const match = await resolveTenant(person.sub, tenantId);
    if (!match) return { error: response('Você não possui acesso a esta imobiliária.', 403) };
    role = match.membership.role;
  }
  const resource = name as Name;
  if (!(write ? canWrite(resource, role) : canRead(resource, role))) return { error: response('Permissão insuficiente.', 403) };
  return { tenantId, role, person, name: resource, table: resourceMap[resource] as Resource };
}
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  return origin === appOrigin();
}
function parseError(error: unknown) {
  if (error instanceof z.ZodError) return response(error.issues[0]?.message || 'Dados inválidos.', 400);
  return response('Não foi possível concluir a operação.', 500);
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params;
    const auth = await context(req, resource);
    if (auth.error) return auth.error;
    const rows = await db<unknown[]>(auth.table!, { query: { tenant_id: eq(auth.tenantId!), select: '*', order: 'created_at.desc', limit: '150' } });
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { console.error(e); return parseError(e); }
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    if (!sameOrigin(req)) return response('Origem não autorizada.', 403);
    const { resource } = await params;
    const auth = await context(req, resource, true);
    if (auth.error) return auth.error;
    const data = schemas[auth.name!].parse(await req.json()) as Record<string,unknown>;
    if (auth.name === 'leads' && !data.property_id) data.property_id = null;
    if (auth.name === 'properties' && !data.image_url) data.image_url = null;
    const rows = await db<unknown[]>(auth.table!, {method:'POST', body: { ...data, tenant_id: auth.tenantId }});
    return NextResponse.json(rows[0], {status:201});
  } catch (e) { console.error(e); return parseError(e); }
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    if (!sameOrigin(req)) return response('Origem não autorizada.', 403);
    const { resource } = await params;
    const auth = await context(req, resource, true);
    if (auth.error) return auth.error;
    const body = await req.json() as Record<string,unknown>;
    const rowId = id.parse(body.id);
    const { id: _id, ...data } = body;
    const valid = patchSchemas[auth.name!].parse(data) as Record<string,unknown>;
    if (!Object.keys(valid).length) return response('Nenhuma alteração informada.', 400);
    if (auth.name === 'members') {
      const rows = await db<{role:string;identity_sub:string}[]>('imob_memberships',{query:{id:eq(rowId),tenant_id:eq(auth.tenantId!),select:'role,identity_sub'}});
      if (!rows[0] || rows[0].role === 'owner' || rows[0].identity_sub === auth.person?.sub) return response('Este vínculo é protegido.',403);
    }
    const rows = await db<unknown[]>(auth.table!, {method:'PATCH',query:{id:eq(rowId),tenant_id:eq(auth.tenantId!)},body: valid});
    if (!rows.length) return response('Registro não encontrado nesta imobiliária.',404);
    return NextResponse.json(rows[0]);
  } catch (e) { console.error(e); return parseError(e); }
}
