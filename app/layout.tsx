import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
export const metadata: Metadata = { title: { default: 'Tera Imóveis | Casas, prédios e galpões', template: '%s | Tera Imóveis' }, description: 'Encontre casas, prédios comerciais e galpões para compra e locação em Barueri e região. Explore o catálogo demonstrativo da Tera Imóveis.', robots: { index: false, follow: false }, icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang='pt-BR'><body><SiteShell>{children}</SiteShell></body></html>; }
