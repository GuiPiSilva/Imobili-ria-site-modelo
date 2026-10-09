'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Building2, LayoutDashboard, House, Users, CalendarDays, Wallet, UserCog, Settings2, Plus, ExternalLink, ArrowUpRight, Search, Menu, X, LogOut, TrendingUp, Handshake, ChevronDown, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import type { Tenant, Listing, Lead, Visit, Invoice, Membership } from '@/lib/imob-db';
import type { IdentitySession } from '@/lib/tera-session';

type Section = 'overview'|'properties'|'leads'|'visits'|'invoices'|'team'|'settings';
type FormKind = 'properties'|'leads'|'visits'|'invoices'|'members';
type Props = { person:IdentitySession;tenant:Tenant;tenants:Tenant[];role:Membership['role'];master:boolean;properties:Listing[];leads:Lead[];visits:Visit[];invoices:Invoice[];members:Membership[] };
const formatBRL=(num:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(num);
const fmtDate=(date:string)=>{const d=new Date(date);return Number.isFinite(d.getTime())?d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}):'-'};
const stageLabels:Record<string,string>={new:'Novo',contacted:'Em contato',visit:'Visita',proposal:'Proposta',won:'Fechado',lost:'Perdido'};
const roles:Record<string,string>={owner:'Proprietário',manager:'Gerente',agent:'Corretor'};
const navItems:[Section,string,typeof House][]=[['overview','Visão geral',LayoutDashboard],['properties','Imóveis',House],['leads','CRM / Leads',Handshake],['visits','Visitas',CalendarDays],['invoices','Financeiro',Wallet],['team','Equipe',Users],['settings','Configurações',Settings2]];
const inputClass='admin-input';
export function AdminWorkbench({person,tenant,tenants,role,master,properties,leads,visits,invoices,members}:Props) {
  const router=useRouter();
  const [section,setSection]=useState<Section>('overview');
  const [form,setForm]=useState<FormKind|null>(null);
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState('');
  const [mobileNav,setMobileNav]=useState(false);
  const canEdit=role!=='agent';
  const canOwner=role==='owner';
  const all=useMemo(()=>({
    properties:properties.filter(p=>(p.title+' '+p.city+' '+p.neighborhood).toLowerCase().includes(search.toLowerCase())),
    leads:leads.filter(p=>(p.name+' '+p.phone+' '+(p.email||'')).toLowerCase().includes(search.toLowerCase()))
  }),[properties,leads,search]);
  const months=useMemo(()=>Array.from({length:6},(_,i)=>{
    const now=new Date();const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
    return {label:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),count:leads.filter(l=>{const v=new Date(l.created_at);return v.getFullYear()===d.getFullYear()&&v.getMonth()===d.getMonth()}).length};
  }),[leads]);
  const maxMonth=Math.max(1,...months.map(m=>m.count));
  async function mutate(resource:FormKind, method:'POST'|'PATCH',payload:Record<string,unknown>) {
    const res=await fetch('/api/admin/'+resource+'?tenant='+encodeURIComponent(tenant.id),{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const out=await res.json().catch(()=>({}));
    if(!res.ok)throw Error(out.error||'Não foi possível salvar.');
    router.refresh();
    return out;
  }
  async function create(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();if(!form)return;
    setSaving(true);
    try{
      const values=Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string,string>;
      let data:Record<string,unknown>={...values};
      if(form==='properties'){data={...values,price:Number(values.price),area_m2:Number(values.area_m2)}}
      if(form==='invoices'){data={...values,amount:Number(values.amount)}}
      if(form==='visits'){data={...values,scheduled_at:new Date(values.scheduled_at).toISOString()}}
      if(form==='leads'&&!data.property_id)delete data.property_id;
      await mutate(form,'POST',data);
      toast.success('Registro salvo com sucesso.');setForm(null);
    }catch(e){toast.error(e instanceof Error?e.message:'Erro ao salvar.')}
    finally{setSaving(false)}
  }
  async function edit(resource:FormKind,id:string,patch:Record<string,unknown>) {
    setSaving(true);
    try{await mutate(resource,'PATCH',{id,...patch});toast.success('Atualizado com sucesso.')}
    catch(e){toast.error(e instanceof Error?e.message:'Não foi possível atualizar.')}
    finally{setSaving(false)}
  }
  const available=navItems.filter(([key])=>(key!=='team'&&key!=='invoices')||canOwner);
  function show(key:Section){setSection(key);setForm(null);setSearch('');setMobileNav(false)}
  const sectionTitle:Record<Section,string>={overview:'Visão geral',properties:'Gestão de imóveis',leads:'CRM e oportunidades',visits:'Agenda de visitas',invoices:'Gestão financeira',team:'Equipe da imobiliária',settings:'Configurações'};
  const addTypes:Partial<Record<Section,FormKind>>={properties:'properties',leads:'leads',visits:'visits',invoices:'invoices',team:'members'};
  const buttonAdd=addTypes[section];
  return <div className="admin-app">
    <aside className={'admin-sidebar '+(mobileNav?'is-open':'')}>
      <div className="admin-brand"><span className="admin-brand-icon"><Building2 size={22}/></span><div><strong>tera<span>imóveis</span></strong><small>GESTÃO & CRM</small></div><button className="admin-close-nav" onClick={()=>setMobileNav(false)} aria-label="Fechar menu"><X size={21}/></button></div>
      <div className="admin-tenant"><span className="admin-tenant-avatar">{tenant.name.slice(0,1).toUpperCase()}</span><span><strong>{tenant.name}</strong><small>{roles[role]} · {tenant.plan.toUpperCase()}</small></span><ChevronDown size={16}/></div>
      <p className="admin-nav-caption">ESPAÇO DE TRABALHO</p>
      <nav className="admin-nav" aria-label="Navegação administrativa">{available.map(([key,label,Icon])=><button type="button" key={key} className={section===key?'active':''} onClick={()=>show(key)}><Icon size={19}/>{label}{key==='leads'&&leads.length>0&&<span className="admin-nav-counter">{leads.length}</span>}</button>)}</nav>
      {master&&<Link className="admin-master-link" href="/master"><ShieldCheck size={19}/> Painel Master <ArrowUpRight size={16}/></Link>}
      <div className="admin-sidebar-bottom"><span className="admin-online-dot"/>Conta verificada via TeraApps <form action="/api/auth/logout" method="POST"><button type="submit"><LogOut size={16}/> Sair</button></form></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-open-nav" onClick={()=>setMobileNav(true)} aria-label="Abrir menu"><Menu size={22}/></button><div className="admin-breadcrumb">Workspace <span>/</span> {sectionTitle[section]}</div><div className="admin-top-actions"><Link target="_blank" rel="noopener noreferrer" href={'/vitrine/'+tenant.slug} className="admin-visit-site"><ExternalLink size={16}/> Ver meu site</Link><span className="admin-profile-avatar" title={person.name}>{(person.name||person.email).slice(0,1).toUpperCase()}</span></div></header>
      <div className="admin-content">
        <div className="admin-heading"><div><p className="admin-eyebrow">TERA IMÓVEIS / {tenant.name.toUpperCase()}</p><h1>{sectionTitle[section]}</h1><p>{section==='overview'?'Tudo o que acontece na sua imobiliária, em um só lugar.':section==='properties'?'Publique e acompanhe seus anúncios.':section==='leads'?'Cada novo contato é uma oportunidade de negócio.':section==='visits'?'Mantenha o calendário de visitas organizado.':section==='invoices'?'Organize receitas e despesas da operação.':section==='team'?'Controle o acesso dos profissionais.':'Gerencie as informações da sua operação.'}</p></div><div className="admin-heading-actions">{buttonAdd&&<button type="button" className="admin-primary" onClick={()=>setForm(form===buttonAdd?null:buttonAdd)}><Plus size={18}/>{form===buttonAdd?'Fechar cadastro':({properties:'Novo imóvel',leads:'Novo lead',visits:'Agendar visita',invoices:'Novo lançamento',members:'Adicionar membro'} as Record<FormKind,string>)[buttonAdd]}</button>}</div></div>
        {form && <section className="admin-panel admin-new-form"><div className="admin-panel-title"><h2>{({properties:'Cadastrar imóvel',leads:'Cadastrar contato',visits:'Agendar uma visita',invoices:'Novo lançamento',members:'Vincular profissional'} as Record<FormKind,string>)[form]}</h2><button aria-label="Fechar" onClick={()=>setForm(null)}><X size={18}/></button></div>
          {form==='members'&&<p className="admin-help">O profissional precisa ter uma conta TeraApps. Insira o ID da identidade (campo <code>sub</code>) — e-mail sozinho não libera acesso.</p>}
          <form onSubmit={create} className="admin-create-form">
            {form==='properties'&&<div className="admin-form-grid">
              <label className="full">Título do imóvel<input className={inputClass} name="title" placeholder="Ex.: Casa moderna em Alphaville" required minLength={3} maxLength={160}/></label>
              <label>Tipo<select className={inputClass} name="type"><option value="casa">Casa</option><option value="apartamento">Apartamento</option><option value="predio">Prédio</option><option value="galpao">Galpão</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option></select></label>
              <label>Finalidade<select className={inputClass} name="deal_type"><option value="venda">Venda</option><option value="locacao">Locação</option></select></label>
              <label>Cidade<input className={inputClass} name="city" required placeholder="Barueri"/></label>
              <label>Bairro<input className={inputClass} name="neighborhood" placeholder="Alphaville"/></label>
              <label>Preço (R$)<input className={inputClass} name="price" type="number" min={0} step="0.01" required/></label>
              <label>Área (m²)<input className={inputClass} name="area_m2" type="number" min={0} step=".01" required/></label>
              <label className="full">URL HTTPS da foto<input className={inputClass} name="image_url" type="url" placeholder="https://.../foto.jpg"/></label>
              <label className="full">Descrição<textarea className={inputClass} name="description" rows={3} maxLength={6000}/></label>
              <label>Status<select className={inputClass} name="status"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
            </div>}
            {form==='leads'&&<div className="admin-form-grid"><label>Nome<input className={inputClass} required name="name"/></label><label>WhatsApp<input className={inputClass} required name="phone" minLength={8}/></label><label>E-mail<input className={inputClass} name="email" type="email"/></label><label>Imóvel<select className={inputClass} name="property_id"><option value="">Sem imóvel específico</option>{properties.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label className="full">Observações<textarea className={inputClass} name="message" rows={3}/></label><input type="hidden" name="stage" value="new"/></div>}
            {form==='visits'&&<div className="admin-form-grid"><label>Cliente<select className={inputClass} name="lead_id" required><option value="">Selecione um lead</option>{leads.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label>Data e hora<input className={inputClass} name="scheduled_at" type="datetime-local" required/></label><label className="full">Observações<textarea className={inputClass} name="notes" rows={3}/></label><input type="hidden" name="status" value="scheduled"/></div>}
            {form==='invoices'&&<div className="admin-form-grid"><label>Descrição<input className={inputClass} name="title" required/></label><label>Valor R$<input className={inputClass} name="amount" type="number" min={0} step=".01" required/></label><label>Vencimento<input className={inputClass} name="due_date" type="date" required/></label><label>Categoria<select className={inputClass} name="category"><option value="receita">Receita</option><option value="despesa">Despesa</option></select></label><input type="hidden" name="status" value="pending"/></div>}
            {form==='members'&&<div className="admin-form-grid"><label>ID TeraApps (sub)<input className={inputClass} name="identity_sub" required/></label><label>Nome de exibição<input className={inputClass} name="display_name"/></label><label>Permissão<select className={inputClass} name="role"><option value="agent">Corretor</option><option value="manager">Gerente</option></select></label><input type="hidden" name="status" value="active"/></div>}
            <div className="admin-form-actions"><button disabled={saving} className="admin-primary">{saving?'Salvando...':'Salvar registro'}</button><button className="admin-ghost" type="button" onClick={()=>setForm(null)}>Cancelar</button></div>
          </form>
        </section>}
        {section==='overview'&&<>
          <div className="admin-stat-grid">
            {[{label:'Imóveis cadastrados',value:properties.length,sub:properties.filter(p=>p.status==='published').length+' publicados',Icon:House},{label:'Leads recebidos',value:leads.length,sub:leads.filter(l=>l.stage==='new').length+' aguardando contato',Icon:Users},{label:'Visitas agendadas',value:visits.filter(v=>v.status==='scheduled').length,sub:'Agenda da imobiliária',Icon:CalendarDays},{label:'Negociações fechadas',value:leads.filter(l=>l.stage==='won').length,sub:'Negócios marcados como ganhos',Icon:CheckCircle2}].map(x=><div className="admin-stat" key={x.label}><div className="admin-stat-line"><span>{x.label}</span><x.Icon size={19}/></div><strong>{x.value}</strong><small>{x.sub}</small></div>)}
          </div>
          <div className="admin-overview-grid"><section className="admin-panel"><div className="admin-panel-title"><div><h2>Captação de clientes</h2><p>Leads registrados nos últimos 6 meses</p></div><TrendingUp size={19}/></div><div className="admin-chart">{months.map(m=><div className="admin-chart-item" key={m.label}><strong>{m.count}</strong><div className="admin-chart-track"><span style={{height:(8+86*m.count/maxMonth)+'%'}}/></div><small>{m.label}</small></div>)}</div></section>
          <section className="admin-panel"><div className="admin-panel-title"><div><h2>Últimos contatos</h2><p>Acompanhe as oportunidades recentes</p></div><button className="admin-inline-link" onClick={()=>show('leads')}>Ver todos <ArrowUpRight size={16}/></button></div><div className="admin-activity">{leads.slice(0,5).map(l=><div key={l.id}><span className="admin-activity-avatar">{l.name.slice(0,1)}</span><div><strong>{l.name}</strong><small>{l.phone}</small></div><span className={'admin-status '+l.stage}>{stageLabels[l.stage]||l.stage}</span></div>)}{!leads.length&&<div className="admin-empty">Os contatos recebidos pelo site aparecerão aqui.</div>}</div></section></div>
          <div className="admin-panel"><div className="admin-panel-title"><div><h2>Acessos rápidos</h2><p>Atalhos para sua operação</p></div></div><div className="admin-shortcuts"><button onClick={()=>{show('properties');setForm('properties')}}><House size={19}/> Adicionar imóvel <ArrowUpRight size={16}/></button><button onClick={()=>show('leads')}><Handshake size={19}/> Abrir CRM <ArrowUpRight size={16}/></button><button onClick={()=>{show('visits');setForm('visits')}}><CalendarDays size={19}/> Agendar visita <ArrowUpRight size={16}/></button><Link href={'/vitrine/'+tenant.slug} target="_blank"><ExternalLink size={19}/> Site público <ArrowUpRight size={16}/></Link></div></div>
        </>}
        {section==='properties'&&<section className="admin-panel"><div className="admin-panel-title"><h2>Portfólio de imóveis <span className="admin-pill">{properties.length}</span></h2><label className="admin-search"><Search size={17}/><input placeholder="Buscar imóvel..." value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Imóvel</th><th>Tipo / finalidade</th><th>Valor</th><th>Publicação</th><th></th></tr></thead><tbody>{all.properties.map(p=><tr key={p.id}><td><div className="admin-listing-cell">{p.image_url?<img src={p.image_url} alt=""/>:<span className="admin-image-empty"><House size={20}/></span>}<div><strong>{p.title}</strong><small>{p.neighborhood}, {p.city}</small></div></div></td><td>{p.type} <span className="admin-table-secondary">· {p.deal_type}</span></td><td><strong>{formatBRL(Number(p.price))}</strong><small>{p.area_m2} m²</small></td><td><span className={'admin-status '+p.status}>{p.status==='published'?'Publicado':p.status==='draft'?'Rascunho':'Arquivado'}</span></td><td>{canEdit?<select aria-label={'Status de '+p.title} disabled={saving} className="admin-row-select" value={p.status} onChange={e=>edit('properties',p.id,{status:e.target.value})}><option value="draft">Rascunho</option><option value="published">Publicar</option><option value="archived">Arquivar</option></select>:null}</td></tr>)}</tbody></table>{!all.properties.length&&<div className="admin-empty">Nenhum imóvel encontrado. Cadastre seu primeiro anúncio para começar.</div>}</div></section>}
        {section==='leads'&&<section className="admin-panel"><div className="admin-panel-title"><h2>Pipeline de atendimento <span className="admin-pill">{leads.length}</span></h2><label className="admin-search"><Search size={17}/><input placeholder="Buscar cliente..." value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="admin-pipeline">{Object.entries(stageLabels).map(([key,label])=><div key={key}><strong>{leads.filter(l=>l.stage===key).length}</strong><span>{label}</span></div>)}</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Cliente</th><th>Contato</th><th>Recebido em</th><th>Etapa</th></tr></thead><tbody>{all.leads.map(l=><tr key={l.id}><td><strong>{l.name}</strong><small>{l.message||'Sem observações'}</small></td><td>{l.phone}<small>{l.email}</small></td><td>{fmtDate(l.created_at)}</td><td><select aria-label={'Etapa de '+l.name} disabled={saving} value={l.stage} className="admin-row-select" onChange={e=>edit('leads',l.id,{stage:e.target.value})}>{Object.entries(stageLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></td></tr>)}</tbody></table>{!all.leads.length&&<div className="admin-empty">Nenhuma oportunidade registrada ainda. Os interessados enviados pela vitrine entram automaticamente no CRM.</div>}</div></section>}
        {section==='visits'&&<section className="admin-panel"><div className="admin-panel-title"><h2>Agenda da equipe</h2><CalendarDays size={20}/></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Data e hora</th><th>Cliente</th><th>Observações</th><th>Status</th></tr></thead><tbody>{visits.map(v=><tr key={v.id}><td><strong>{new Date(v.scheduled_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</strong></td><td>{leads.find(l=>l.id===v.lead_id)?.name||'Contato não encontrado'}</td><td>{v.notes||'—'}</td><td><select className="admin-row-select" disabled={saving} value={v.status} onChange={e=>edit('visits',v.id,{status:e.target.value})}><option value="scheduled">Agendada</option><option value="completed">Realizada</option><option value="cancelled">Cancelada</option></select></td></tr>)}</tbody></table>{!visits.length&&<div className="admin-empty">Você ainda não possui visitas agendadas.</div>}</div></section>}
        {section==='invoices'&&canOwner&&<><div className="admin-stat-grid two"><div className="admin-stat"><div className="admin-stat-line"><span>Receitas registradas</span><Wallet size={19}/></div><strong>{formatBRL(invoices.filter(x=>x.category==='receita'&&x.status==='paid').reduce((n,x)=>n+Number(x.amount),0))}</strong><small>Recebimentos marcados como pagos</small></div><div className="admin-stat"><div className="admin-stat-line"><span>Despesas registradas</span><TrendingUp size={19}/></div><strong>{formatBRL(invoices.filter(x=>x.category==='despesa'&&x.status==='paid').reduce((n,x)=>n+Number(x.amount),0))}</strong><small>Pagamentos marcados como pagos</small></div></div><section className="admin-panel"><div className="admin-panel-title"><h2>Lançamentos financeiros</h2><p>Controle interno — não emite boletos ou notas fiscais</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Descrição</th><th>Tipo</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>{invoices.map(i=><tr key={i.id}><td><strong>{i.title}</strong></td><td>{i.category==='receita'?'Receita':'Despesa'}</td><td>{i.due_date.split('-').reverse().join('/')}</td><td>{formatBRL(Number(i.amount))}</td><td><select className="admin-row-select" value={i.status} disabled={saving} onChange={e=>edit('invoices',i.id,{status:e.target.value})}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="late">Atrasado</option></select></td></tr>)}</tbody></table>{!invoices.length&&<div className="admin-empty">Adicione receitas e despesas para acompanhar seu financeiro.</div>}</div></section></>}
        {section==='team'&&canOwner&&<section className="admin-panel"><div className="admin-panel-title"><h2>Acessos da equipe</h2><p>Cada profissional usa a própria conta TeraApps</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Profissional</th><th>Identidade TeraApps</th><th>Permissão</th><th>Status</th></tr></thead><tbody>{members.map(m=><tr key={m.id}><td><strong>{m.display_name||'Conta vinculada'}</strong></td><td><code>{m.identity_sub}</code></td><td>{m.role==='owner'?'Proprietário':<select className="admin-row-select" value={m.role} disabled={saving} onChange={e=>edit('members',m.id,{role:e.target.value})}><option value="agent">Corretor</option><option value="manager">Gerente</option></select>}</td><td>{m.role==='owner'?<span className="admin-status published">Protegido</span>:<select className="admin-row-select" value={m.status} disabled={saving} onChange={e=>edit('members',m.id,{status:e.target.value})}><option value="active">Ativo</option><option value="disabled">Bloqueado</option></select>}</td></tr>)}</tbody></table>{!members.length&&<div className="admin-empty">Nenhum membro cadastrado.</div>}</div></section>}
        {section==='settings'&&<div className="admin-settings-grid"><section className="admin-panel"><h2>Identidade da imobiliária</h2><div className="admin-setting-row"><span>Nome</span><strong>{tenant.name}</strong></div><div className="admin-setting-row"><span>Endereço do site</span><Link href={'/vitrine/'+tenant.slug}>/vitrine/{tenant.slug} <ExternalLink size={13}/></Link></div><div className="admin-setting-row"><span>Plano</span><strong>{tenant.plan.toUpperCase()}</strong></div><div className="admin-setting-row"><span>Status</span><span className={'admin-status '+tenant.status}>{tenant.status==='active'?'Ativa':'Suspensa'}</span></div></section><section className="admin-panel"><h2>Segurança de acesso</h2><p className="admin-help"><ShieldCheck size={18}/> Autenticação centralizada pelo TeraApps Identity com PKCE. A permissão é conferida em cada operação pelo servidor e associada à imobiliária.</p><div className="admin-setting-row"><span>Conta</span><strong>{person.email}</strong></div><div className="admin-setting-row"><span>Nível de acesso</span><strong>{roles[role]}</strong></div><div className="admin-setting-row"><span>Identidade (sub)</span><code>{person.sub}</code></div></section></div>}
        <div className="admin-footer">© {new Date().getFullYear()} Tera Imóveis <span>Plataforma segura pela TeraApps</span></div>
      </div>
    </div>
  </div>;
}
