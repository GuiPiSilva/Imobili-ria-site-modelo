'use client';
import { Empty } from '@/components/ui/empty';
export default function ErrorPage({ reset }: {
    reset: () => void;
}) { return <main id='conteudo' className='container section'><Empty className='empty-state'><h1 style={{ fontSize: '2.2rem' }}>A página não carregou desta vez.</h1><p>Você pode tentar novamente. Se o problema continuar, volte à página inicial.</p><button className='button' onClick={reset}>Tentar novamente</button><a className='text-link' href='/'>Voltar ao início</a></Empty></main>; }
