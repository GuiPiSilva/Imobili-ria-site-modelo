import { Catalog } from '@/components/catalog';
export const metadata = { title: 'Encontre seu imóvel', description: 'Filtre casas, prédios comerciais e galpões por cidade, preço, área e finalidade.' };
export default async function Imoveis({ searchParams }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) { const initial = await searchParams; return <main id='conteudo'><Catalog initial={initial}/></main>; }
