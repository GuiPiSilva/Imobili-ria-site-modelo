import type { Metadata } from 'next';
import './globals.css';
import { AdminRouteShell } from '@/components/admin-route-shell';
export const metadata: Metadata = { title: { default: 'Tera Imóveis | Casas, prédios e galpões', template: '%s | Tera Imóveis' }, description: 'Encontre casas, prédios comerciais e galpões para compra e locação em Barueri e região. Explore o catálogo demonstrativo da Tera Imóveis.', robots: { index: false, follow: false }, icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><AdminRouteShell>{children}</AdminRouteShell></body></html>;
}
