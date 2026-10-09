import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { session } from '@/lib/imob-access';
import { db, isMaster } from '@/lib/imob-db';
import { appOrigin } from '@/lib/tera-session';
const schema = z.object({ tenant_id:z.string().uuid(), identity_sub:z.string().trim().min(1).max(120),display_name:z.string().trim().max(120).default(''),role:z.enum(['owner','manager','agent']) }).strict();
export async function POST(req:NextRequest) {
  const person = await session();
  if (!person) return NextResponse.json({error:'Login necessário.'},{status:401});
  if (!isMaster(person.sub) || req.headers.get('origin') !== appOrigin()) return NextResponse.json({error:'Não autorizado.'},{status:403});
  try {
    const values=schema.parse(await req.json());
    const result=await db<unknown[]>('imob_memberships',{method:'POST',body:values});
    return NextResponse.json(result[0],{status:201});
  } catch {return NextResponse.json({error:'Não foi possível vincular a conta (verifique se já está vinculada).'},{status:400})}
}
