import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
export default function SemAcesso() {
  return <main id="conteudo" className="admin-login-wrap"><div className="admin-login"><LockKeyhole size={32}/><h1>Conta verificada. Acesso pendente.</h1><p>Seu login TeraApps foi reconhecido, mas você ainda não foi vinculado a uma imobiliária ativa. Solicite ao administrador Master o vínculo do ID da sua conta.</p><Link className="admin-primary" href="/acesso">Voltar ao acesso</Link></div></main>;
}
