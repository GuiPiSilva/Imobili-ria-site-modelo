import Link from 'next/link';
import { ShieldCheck, Building2, Users, ArrowRight } from 'lucide-react';
export const metadata = { title: 'Acesso administrativo TeraApps' };
export default async function Acesso({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return <main id="conteudo" className="admin-login-wrap"><div className="admin-login">
    <div className="admin-login-icon"><ShieldCheck size={28}/></div>
    <p className="eyebrow">PORTAL DE GESTÃO • TERAAPPS</p>
    <h1>Sua imobiliária, sob controle.</h1>
    <p>Entre com sua identidade TeraApps para acessar imóveis, clientes, negociações e a gestão da sua equipe.</p>
    {erro && <p role="alert" className="admin-alert">{erro}</p>}
    <a className="admin-primary" href="/api/auth/login">Entrar com TeraApps <ArrowRight size={18}/></a>
    <div className="admin-login-features"><span><Building2 size={17}/> Gestão imobiliária</span><span><Users size={17}/> Equipe e CRM</span><span><ShieldCheck size={17}/> Verificação centralizada</span></div>
    <Link href="/" className="admin-muted-link">Voltar ao site público</Link>
  </div></main>;
}
