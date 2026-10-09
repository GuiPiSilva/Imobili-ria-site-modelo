import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, eq, type Tenant, type Listing } from '@/lib/imob-db';
import { appOrigin } from '@/lib/tera-session';
const schema = z.object({
  tenant_id: z.string().uuid(), property_id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120), phone: z.string().trim().min(8).max(30),
  email: z.union([z.string().email().max(200),z.literal('')]).default(''),
  message: z.string().trim().max(2000).default(''), website: z.string().max(200).default('')
}).strict();
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== appOrigin()) return NextResponse.json({error:'Origem inválida.'},{status:403});
  try {
    const body = schema.parse(await req.json());
    if (body.website) return NextResponse.json({ok:true}); // honeypot
    const tenants=await db<Tenant[]>('imob_tenants',{query:{id:eq(body.tenant_id),status:'eq.active',select:'*'}});
    if (!tenants[0]) return NextResponse.json({error:'Imobiliária não encontrada.'},{status:404});
    if (body.property_id) {
      const listing=await db<Listing[]>('imob_properties',{query:{id:eq(body.property_id),tenant_id:eq(body.tenant_id),status:'eq.published',select:'*'}});
      if (!listing.length) return NextResponse.json({error:'Imóvel não encontrado.'},{status:404});
    }
    await db('imob_leads',{method:'POST',body:{tenant_id:body.tenant_id,property_id:body.property_id||null,name:body.name,phone:body.phone,email:body.email||null,message:body.message,stage:'new'}});
    return NextResponse.json({ok:true},{status:201});
  } catch {return NextResponse.json({error:'Não foi possível enviar seu interesse.'},{status:400})}
}
