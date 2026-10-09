import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Maximize2 } from 'lucide-react';
import { db, eq, isUuid, type Tenant, type Listing } from '@/lib/imob-db';
import { LeadForm } from '@/components/lead-form';
export const dynamic='force-dynamic';
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
export default async function ImovelVitrine({params}:{params:Promise<{slug:string;id:string}>}) {
  const {slug,id}=await params;
  if(!/^[a-z0-9-]{3,80}$/.test(slug)||!isUuid(id))notFound();
  const tenants=await db<Tenant[]>('imob_tenants',{query:{slug:eq(slug),status:'eq.active',select:'*'}});
  if(!tenants[0])notFound();
  const listings=await db<Listing[]>('imob_properties',{query:{tenant_id:eq(tenants[0].id),id:eq(id),status:'eq.published',select:'*'}});
  if(!listings[0])notFound();
  const p=listings[0];
  return <main id="conteudo" className="container listing-detail">
    <Link href={'/vitrine/'+slug} className="admin-back"><ArrowLeft size={16}/> Voltar para {tenants[0].name}</Link>
    <div className="listing-columns"><article><div className="listing-image">{p.image_url?<img src={p.image_url} alt={p.title}/>:<div className="showcase-placeholder">Imagem não disponível</div>}</div><p className="eyebrow">IMÓVEL • {p.deal_type==='venda'?'VENDA':'LOCAÇÃO'}</p><h1>{p.title}</h1><p className="listing-area"><MapPin size={18}/>{p.neighborhood}, {p.city}<Maximize2 size={17}/>{p.area_m2} m²</p><h2>Sobre este imóvel</h2><p className="listing-description">{p.description||'Fale com a imobiliária para saber mais sobre esta oportunidade.'}</p></article>
    <aside className="listing-contact"><div className="listing-price"><span>{p.deal_type==='venda'?'Valor de venda':'Aluguel mensal'}</span><strong>{brl(p.price)}</strong></div><LeadForm tenantId={tenants[0].id} propertyId={p.id}/></aside></div>
  </main>;
}
