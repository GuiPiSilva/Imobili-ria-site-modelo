import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/imob-access';
import { db, isMaster, isUuid, eq, type Tenant } from '@/lib/imob-db';
import { appOrigin } from '@/lib/tera-session';
export const runtime = 'nodejs';
const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ownerSub: z.string().trim().min(1).max(120),
  ownerName: z.string().trim().max(120).default(''),
  plan: z.enum(['starter','pro','enterprise']).default('starter')
}).strict();
const patchSchema = z.object({ id: z.string().uuid(), status: z.enum(['active','suspended']).optional(), plan: z.enum(['starter','pro','enterprise']).optional() }).strict();
const error = (message:string,status:number) => NextResponse.json({error:message},{status});
async function authorize(req:NextRequest,write=false) {
  const person = await session();
  if (!person) return error('Faça login novamente.',401);
  if (!isMaster(person.sub)) return error('Somente Master.',403);
  if (write && req.headers.get('origin')!==appOrigin()) return error('Origem não autorizada.',403);
  return null;
}
export async function GET(req:NextRequest) {
  const denied = await authorize(req);if(denied)return denied;
  try {
    const [tenants, members] = await Promise.all([
      db<Tenant[]>('imob_tenants',{query:{select:'*',order:'created_at.desc'}}),
      db<unknown[]>('imob_memberships',{query:{select:'*',order:'created_at.desc'}})
    ]);
    return NextResponse.json({tenants,members},{headers:{'Cache-Control':'no-store'}});
  } catch {return error('Banco de dados indisponível.',503)}
}
export async function POST(req:NextRequest) {
  const denied = await authorize(req,true);if(denied)return denied;
  try {
    const input = createSchema.parse(await req.json());
    const rows = await db<Tenant[]>('imob_tenants',{method:'POST',body:{name:input.name,slug:input.slug,plan:input.plan}});
    const tenant = rows[0];
    if (!tenant) return error('Falha ao criar imobiliária.',500);
    try {
      await db('imob_memberships',{method:'POST',body:{tenant_id:tenant.id,identity_sub:input.ownerSub,display_name:input.ownerName,role:'owner',status:'active'}});
    } catch {
      await db('imob_tenants',{method:'DELETE',query:{id:eq(tenant.id)}});
      throw new Error('Falha ao vincular proprietário.');
    }
    return NextResponse.json(tenant,{status:201});
  } catch(e) {console.error('master-create:',e instanceof Error?e.message:'erro');return error(e instanceof z.ZodError?'Dados de cadastro inválidos.':'Não foi possível cadastrar a imobiliária (verifique slug e ID do proprietário).',400)}
}
export async function PATCH(req:NextRequest) {
  const denied = await authorize(req,true);if(denied)return denied;
  try {
    const {id,...changes} = patchSchema.parse(await req.json());
    if (!isUuid(id) || !Object.keys(changes).length) return error('Alteração inválida.',400);
    const rows = await db<Tenant[]>('imob_tenants',{method:'PATCH',query:{id:eq(id)},body:changes});
    if (!rows.length) return error('Imobiliária não encontrada.',404);
    return NextResponse.json(rows[0]);
  } catch {return error('Não foi possível alterar a imobiliária.',400)}
}
