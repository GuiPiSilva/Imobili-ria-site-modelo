import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, MapPin, ArrowUpRight, Home } from 'lucide-react';
import { db, eq, type Tenant, type Listing } from '@/lib/imob-db';
export const dynamic='force-dynamic';
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
export default async function Vitrine({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  if(!/^[a-z0-9-]{3,80}$/.test(slug))notFound();
  const tenants=await db<Tenant[]>('imob_tenants',{query:{slug:eq(slug),status:'eq.active',select:'*'}});
  if(!tenants[0])notFound();
  const tenant=tenants[0];
  const listings=await db<Listing[]>('imob_properties',{query:{tenant_id:eq(tenant.id),status:'eq.published',select:'*',order:'created_at.desc'}});
  return <main id="conteudo" className="showcase">
    <section className="showcase-hero"><div className="container"><p className="eyebrow">IMOBILIÁRIA PARCEIRA • TERA IMÓVEIS</p><h1>{tenant.name}</h1><p>Encontre seu próximo imóvel. Explore oportunidades de compra e locação e fale diretamente com a equipe.</p><div className="showcase-hero-bottom"><span><Building2 size={17}/> {listings.length} imóveis publicados</span><Link href="/imoveis">Explorar outros imóveis <ArrowUpRight size={15}/></Link></div></div></section>
    <section className="container showcase-content"><div className="section-heading"><div><p className="eyebrow">NOSSA SELEÇÃO</p><h2>Imóveis disponíveis</h2></div></div>
      {listings.length?<div className="showcase-grid">{listings.map(p=><Link key={p.id} href={'/vitrine/'+slug+'/imovel/'+p.id} className="showcase-card"><div className="showcase-image">{p.image_url?<img src={p.image_url} alt={'Fotografia de '+p.title} loading="lazy"/>:<div className="showcase-placeholder"><Home size={42}/></div>}<span className="showcase-tag">{p.deal_type==='venda'?'À venda':'Para alugar'}</span></div><div className="showcase-card-body"><p className="showcase-location"><MapPin size={14}/>{p.neighborhood}, {p.city}</p><h3>{p.title}</h3><div className="showcase-card-bottom"><strong>{brl(p.price)}{p.deal_type==='locacao'&&<small>/mês</small>}</strong><span>{p.area_m2} m²</span></div></div></Link>)}</div>:<div className="admin-empty">Nenhum imóvel anunciado no momento. Volte em breve para conferir as novidades.</div>}
    </section>
  </main>;
}
