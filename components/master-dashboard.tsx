'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Building2, ShieldCheck, Users, Plus, ExternalLink, LogOut, Crown, CheckCircle2, AlertTriangle, ArrowUpRight, Globe, Settings2 } from 'lucide-react';
import type { Tenant, Membership } from '@/lib/imob-db';
import type { IdentitySession } from '@/lib/tera-session';
type Props={person:IdentitySession;tenants:Tenant[];members:Membership[]};
export function MasterDashboard({person,tenants,members}:Props) {
  const router=useRouter();
  const [mode,setMode]=useState<'tenants'|'create'|'member'>('tenants');
  const [busy,setBusy]=useState(false);
  const [filter,setFilter]=useState('');
  async function api(url:string,method:'POST'|'PATCH',body:Record<string,unknown>) {
    const response=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(payload.error||'Operação não realizada.');
    router.refresh();return payload;
  }
  async function add(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);
    try {
      const data=Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string,string>;
      if(mode==='create') await api('/api/master/tenants','POST',data);
      if(mode==='member') await api('/api/master/members','POST',data);
      toast.success('Alteração salva com sucesso.');setMode('tenants');
    }catch(e){toast.error(e instanceof Error?e.message:'Erro ao salvar.')}finally{setBusy(false)}
  }
  async function update(id:string,patch:Record<string,unknown>) {
    setBusy(true);try{await api('/api/master/tenants','PATCH',{id,...patch});toast.success('Imobiliária atualizada.')}
    catch(e){toast.error(e instanceof Error?e.message:'Falha na atualização.')}finally{setBusy(false)}
  }
  const active=tenants.filter(t=>t.status==='active').length;
  const owners=members.filter(m=>m.role==='owner'&&m.status==='active').length;
  return <div className="admin-app master-app">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="admin-brand-icon"><Crown size={21}/></span><div><strong>tera<span>master</span></strong><small>CONTROLE DA PLATAFORMA</small></div></div>
      <div className="admin-tenant"><span className="admin-tenant-avatar"><ShieldCheck size={24}/></span><span><strong>Super Admin</strong><small>Ambiente TeraApps</small></span></div>
      <p className="admin-nav-caption">PLATAFORMA</p>
      <nav className="admin-nav"><button className={mode==='tenants'?'active':''} onClick={()=>setMode('tenants')}><Building2 size={19}/> Imobiliárias <span className="admin-nav-counter">{tenants.length}</span></button><button className={mode==='create'?'active':''} onClick={()=>setMode('create')}><Plus size={19}/> Nova imobiliária</button><button className={mode==='member'?'active':''} onClick={()=>setMode('member')}><Users size={19}/> Vincular usuários</button></nav>
      <div className="admin-sidebar-bottom"><span className="admin-online-dot"/> Master autenticado <form method="POST" action="/api/auth/logout"><button><LogOut size={16}/> Sair da conta</button></form></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><div className="admin-breadcrumb">TeraApps <span>/</span> Controle Master</div><div className="admin-top-actions"><Link className="admin-visit-site" href="/"><Globe size={16}/> Site público</Link><span className="admin-profile-avatar">{person.name.slice(0,1).toUpperCase()}</span></div></header>
      <div className="admin-content"><div className="admin-heading"><div><p className="admin-eyebrow">ADMINISTRAÇÃO CENTRAL / TERAAPPS</p><h1>Controle Master <ShieldCheck className="admin-heading-icon" size={28}/></h1><p>Gerencie imobiliárias, licenças e quem pode acessar cada ambiente.</p></div><button className="admin-primary" onClick={()=>setMode('create')}><Plus size={17}/> Nova imobiliária</button></div>
      <div className="admin-stat-grid master-stats">{[{title:'Imobiliárias',value:tenants.length,note:'Contas cadastradas',Icon:Building2},{title:'Ativas',value:active,note:'Operações habilitadas',Icon:CheckCircle2},{title:'Proprietários',value:owners,note:'Vínculos ativos',Icon:Users},{title:'Suspensas',value:tenants.length-active,note:'Acesso da equipe bloqueado',Icon:AlertTriangle}].map(v=><div className="admin-stat" key={v.title}><div className="admin-stat-line"><span>{v.title}</span><v.Icon size={19}/></div><strong>{v.value}</strong><small>{v.note}</small></div>)}</div>
      {mode==='create'&&<section className="admin-panel master-form"><div className="admin-panel-title"><div><h2>Cadastrar imobiliária</h2><p>Nova empresa com espaço, site e CRM independentes</p></div></div><form onSubmit={add} className="admin-create-form"><div className="admin-form-grid"><label>Nome da imobiliária<input name="name" required minLength={2} maxLength={120} placeholder="Ex.: Imobiliária Alpha"/></label><label>Identificador do site (slug)<input name="slug" required minLength={3} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="imobiliaria-alpha"/></label><label>ID verificado do proprietário (sub)<input name="ownerSub" required placeholder="ID retornado pela TeraApps"/></label><label>Nome do proprietário<input name="ownerName" placeholder="Nome de exibição"/></label><label>Plano<select name="plan"><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label></div><p className="admin-help">O proprietário precisa ter uma identidade criada na TeraApps. Informar somente o e-mail não concede permissão. O sistema libera o acesso quando o <code>sub</code> validado no login corresponder a este vínculo.</p><div className="admin-form-actions"><button className="admin-primary" disabled={busy}>{busy?'Cadastrando...':'Criar imobiliária'}</button><button className="admin-ghost" type="button" onClick={()=>setMode('tenants')}>Cancelar</button></div></form></section>}
      {mode==='member'&&<section className="admin-panel master-form"><div className="admin-panel-title"><div><h2>Vincular conta TeraApps</h2><p>Associe um usuário verificado a uma imobiliária.</p></div></div><form onSubmit={add} className="admin-create-form"><div className="admin-form-grid"><label>Imobiliária<select required name="tenant_id"><option value="">Selecione</option>{tenants.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label><label>ID de identidade (sub)<input name="identity_sub" required/></label><label>Nome de exibição<input name="display_name"/></label><label>Permissão<select name="role"><option value="owner">Proprietário</option><option value="manager">Gerente</option><option value="agent">Corretor</option></select></label></div><div className="admin-form-actions"><button disabled={busy} className="admin-primary">{busy?'Salvando...':'Vincular usuário'}</button><button type="button" className="admin-ghost" onClick={()=>setMode('tenants')}>Cancelar</button></div></form></section>}
      {mode==='tenants'&&<section className="admin-panel"><div className="admin-panel-title"><div><h2>Imobiliárias cadastradas</h2><p>Administre os acessos e os planos de cada empresa.</p></div><input className="admin-master-search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar imobiliária..." aria-label="Buscar imobiliária"/></div>
      <div className="admin-tenant-list">{tenants.filter(t=>(t.name+' '+t.slug).toLowerCase().includes(filter.toLowerCase())).map(t=><div className="admin-tenant-card" key={t.id}><div className="admin-tenant-card-head"><span className="admin-tenant-avatar">{t.name.slice(0,1).toUpperCase()}</span><div><h3>{t.name}</h3><p>/vitrine/{t.slug}</p></div><span className={'admin-status '+t.status}>{t.status==='active'?'Ativa':'Suspensa'}</span></div>
      <div className="admin-tenant-card-data"><div><span>Equipe</span><strong>{members.filter(m=>m.tenant_id===t.id&&m.status==='active').length}</strong></div><div><span>Proprietário</span><strong>{members.filter(m=>m.tenant_id===t.id&&m.role==='owner').map(m=>m.display_name||m.identity_sub).join(', ')||'Sem vínculo'}</strong></div><div><span>Criada em</span><strong>{new Date(t.created_at).toLocaleDateString('pt-BR')}</strong></div></div>
      <div className="admin-tenant-actions"><label>Plano <select disabled={busy} value={t.plan} onChange={e=>update(t.id,{plan:e.target.value})}><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label><button disabled={busy} className="admin-ghost" onClick={()=>update(t.id,{status:t.status==='active'?'suspended':'active'})}>{t.status==='active'?'Suspender acesso':'Reativar'}</button><Link className="admin-ghost" href={'/painel?tenant='+t.id}><Settings2 size={16}/> Gerenciar</Link><Link className="admin-ghost" href={'/vitrine/'+t.slug} target="_blank"><ExternalLink size={16}/> Vitrine</Link></div></div>)}
      {!tenants.length&&<div className="admin-empty"><Building2 size={32}/><h3>Nenhuma imobiliária cadastrada</h3><p>Crie sua primeira imobiliária para liberar o painel do proprietário.</p><button className="admin-primary" onClick={()=>setMode('create')}><Plus size={17}/> Cadastrar</button></div>}</div></section>}
      <div className="admin-panel master-security"><ShieldCheck size={24}/><div><h2>Segurança da plataforma</h2><p>Acesso Master somente para IDs TeraApps explicitamente permitidos no servidor. Imobiliárias não acessam dados de outras empresas. Suspender uma empresa bloqueia o painel e a vitrine pública.</p></div></div>
      <div className="admin-footer">© {new Date().getFullYear()} TeraApps <span>Identidade verificada: {person.email}</span></div>
      </div>
    </main>
  </div>;
}
