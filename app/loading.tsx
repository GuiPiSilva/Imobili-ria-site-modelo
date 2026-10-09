import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() { return <main id='conteudo' className='container section' aria-busy='true'><p role='status' className='muted' style={{ marginBottom: 24 }}>Carregando os espaços para você…</p><div className='loading-cards'>{[1, 2, 3].map(n => <Skeleton className='h-80' key={n}/>)}</div></main>; }
