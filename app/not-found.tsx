import Link from 'next/link';
import { Search } from 'lucide-react';
import { Empty } from '@/components/ui/empty';
export default function NotFound() { return <main id='conteudo' className='container section'><Empty className='empty-state'><Search size={34}/><p className='eyebrow'>PÁGINA NÃO ENCONTRADA</p><h1 style={{ fontSize: '2.3rem' }}>Vamos encontrar outro caminho.</h1><p>Este endereço não existe ou o imóvel não está no catálogo. A busca continua na página de imóveis.</p><Link href='/imoveis' className='button'>Voltar para os imóveis</Link></Empty></main>; }
