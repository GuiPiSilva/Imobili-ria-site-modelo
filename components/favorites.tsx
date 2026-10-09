'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Empty } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from './site-shell';
import { properties } from '@/lib/properties';
import { PropertyCard } from './property-card';
export function Favorites() { const { ids, ready } = useFavorites(); const saved = properties.filter(p => ids.includes(p.id)); return <div className='container favorites-content'>{!ready ? <div className='loading-cards' aria-label='Carregando favoritos'>{[1, 2, 3].map(i => <Skeleton key={i} className='h-80'/>)}</div> : saved.length ? <><div className='favorites-intro'><p>{saved.length} {saved.length === 1 ? 'imóvel salvo' : 'imóveis salvos'} neste navegador.</p><Link href={`/contato?imoveis=${saved.map(p => p.id).join(',')}`} className='button'>Preparar interesse nos favoritos</Link></div><div className='property-grid'>{saved.map(p => <PropertyCard property={p} key={p.id}/>)}</div></> : <Empty className='empty-state'><Heart size={32}/><h2>Seu próximo espaço pode estar aqui.</h2><p>Toque no coração de um imóvel para guardá-lo. Suas escolhas ficam salvas neste navegador, sem precisar de cadastro.</p><Link href='/imoveis' className='button'>Explorar imóveis</Link></Empty>}</div>; }
