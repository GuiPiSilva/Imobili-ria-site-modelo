'use client';
import { usePathname } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { Toaster } from '@/components/ui/sonner';
export function AdminRouteShell({children}:{children:React.ReactNode}) {
  const path=usePathname();
  if (['/painel','/master','/acesso','/sem-acesso'].some(p=>path===p||path.startsWith(p+'/'))) return <>{children}<Toaster theme="light" position="top-right"/></>;
  return <SiteShell>{children}</SiteShell>;
}
