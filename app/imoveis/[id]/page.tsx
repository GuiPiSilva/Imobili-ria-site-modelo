import { notFound } from 'next/navigation';
import { properties } from '@/lib/properties';
import { PropertyDetail } from '@/components/property-detail';
export const dynamicParams = false;
export function generateStaticParams() {
    return properties.map(({ id }) => ({ id }));
}
export async function generateMetadata({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const { id } = await params; const p = properties.find(p => p.id === id); return { title: p ? p.title : 'Imóvel não encontrado', description: p ? `${p.title}. ${p.neighborhood}, ${p.city}. ${p.area} m². Anúncio demonstrativo.` : 'Este imóvel não foi encontrado.' }; }
export default async function Detail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const { id } = await params; const p = properties.find(p => p.id === id); if (!p)
    notFound(); return <PropertyDetail property={p}/>; }
