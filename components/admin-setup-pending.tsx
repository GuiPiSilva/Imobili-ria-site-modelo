import Link from 'next/link';
import { BadgeCheck, Database, ShieldCheck, ArrowLeft } from 'lucide-react';

// Apenas exibição. O login é exigido pela rota e a atribuição Master
// é determinada no servidor por TERA_MASTER_SUBS.
export function AdminSetupPending({ email, isMaster }: { email: string; isMaster: boolean }) {
  return <main id="conteudo" className="admin-login-wrap">
    <section className="admin-login admin-setup-state" aria-labelledby="setup-title">
      <span className="admin-setup-icon"><Database size={25} aria-hidden="true" /></span>
      <p className="eyebrow">GESTÃO IMOBILIÁRIA • IMOBI</p>
      <h1 id="setup-title">Seu login funcionou. Estamos preparando o painel.</h1>
      <p>Sua identidade Tera ID foi reconhecida. A plataforma imobiliária ainda precisa conectar seu banco de dados para exibir imóveis, clientes, visitas e relatórios.</p>
      <div className="admin-setup-details">
        <div><BadgeCheck size={18} aria-hidden="true" /><span>Tera ID autenticada<strong>{email}</strong></span></div>
        <div><ShieldCheck size={18} aria-hidden="true" /><span>Nível de acesso<strong>{isMaster ? 'Master reconhecido' : 'Aguardando liberação pela equipe'}</strong></span></div>
        <div><Database size={18} aria-hidden="true" /><span>Banco imobiliário<strong>Pendente de configuração</strong></span></div>
      </div>
      {isMaster ? <p className="admin-setup-help">Próximo passo: criar um projeto Supabase dedicado, executar a estrutura do banco e configurar as credenciais no projeto <strong>imobi</strong> da Vercel. Seu acesso Master já está configurado.</p> : <p className="admin-setup-help">O responsável pela plataforma precisa concluir a configuração do banco de dados. Você poderá tentar novamente depois.</p>}
      <Link className="admin-primary" href="/acesso"><ArrowLeft size={17} aria-hidden="true" /> Voltar ao acesso</Link>
    </section>
  </main>;
}
