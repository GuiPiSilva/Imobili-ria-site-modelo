'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { Heart, Menu, House, X } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
const FavoritesContext = createContext<{
    ids: string[];
    ready: boolean;
    toggle: (id: string) => void;
}>({ ids: [], ready: false, toggle: () => { } });
export const useFavorites = () => useContext(FavoritesContext);
export function Logo() { return <Link href='/' className='logo' aria-label='Tera Imóveis — página inicial'><span className='logo-mark'><House strokeWidth={1.5} size={27}/></span><span>tera<span className='logo-sub'>IMÓVEIS</span></span></Link>; }
export function SiteShell({ children }: {
    children: React.ReactNode;
}) { const [ids, setIds] = useState<string[]>([]), [ready, setReady] = useState(false), [open, setOpen] = useState(false); const pathname = usePathname(); useEffect(() => { try {
    const saved = JSON.parse(localStorage.getItem('tera-favoritos') || '[]');
    if (Array.isArray(saved))
        setIds(saved.filter(x => typeof x === 'string'));
}
catch { } setReady(true); }, []); const toggle = (id: string) => { const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]; setIds(next); try {
    localStorage.setItem('tera-favoritos', JSON.stringify(next));
}
catch {
    toast.info('Favoritos disponíveis nesta visita. O navegador não permitiu salvá-los.');
} toast.success(next.includes(id) ? 'Imóvel adicionado aos favoritos.' : 'Imóvel removido dos favoritos.'); }; const nav = [['/imoveis?purpose=comprar', 'Comprar'], ['/imoveis?purpose=alugar', 'Alugar'], ['/imoveis?type=galpao', 'Galpões'], ['/sobre', 'Sobre a Tera']]; return <FavoritesContext.Provider value={{ ids, ready, toggle }}><a className='skip-link' href='#conteudo'>Pular para o conteúdo</a><header className='site-header'><div className='container header-inner'><Logo /><nav className='desktop-nav' aria-label='Navegação principal'>{nav.map(([href, label]) => <Link key={label} href={href} className={pathname === '/sobre' && href === '/sobre' ? 'current' : ''}>{label}</Link>)}</nav><div className='header-actions'><Link href='/favoritos' className='favorites-link' aria-label={`Favoritos${ready ? `, ${ids.length} imóveis` : ''}`}><Heart size={20}/><span className='favorite-label'>Favoritos</span>{ids.length > 0 && <span className='counter'>{ids.length}</span>}</Link><Link href='/contato' className='button header-contact'>Fale com a gente</Link><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className='icon-button mobile-menu' aria-label='Abrir menu'><Menu /></button></SheetTrigger><SheetContent className='mobile-sheet' showCloseButton={false}><SheetTitle>Explore a Tera</SheetTitle><SheetDescription>Encontre o espaço que combina com seus planos.</SheetDescription><SheetClose asChild><button className='icon-button sheet-close' aria-label='Fechar menu'><X /></button></SheetClose><nav aria-label='Navegação mobile'>{[['/', 'Início'], ...nav, ['/favoritos', 'Favoritos'], ['/contato', 'Fale com a gente']].map(([href, label]) => <Link href={href} key={label} onClick={() => setOpen(false)}>{label}</Link>)}</nav><p className='muted'>Casas, prédios e galpões.<br />Compra e locação.</p></SheetContent></Sheet></div></div></header>{children}<footer className='site-footer'><div className='container footer-main'><div><Logo /><p>Espaços para os seus próximos planos.</p><p className='demo-note'>Catálogo demonstrativo. Imóveis, valores, características e localizações são ilustrativos; as fotos são referências.</p></div><div><h2>Encontre seu imóvel</h2><Link href='/imoveis?type=casa'>Casas</Link><Link href='/imoveis?type=predio'>Prédios comerciais</Link><Link href='/imoveis?type=galpao'>Galpões</Link></div><div><h2>Vamos conversar</h2><Link href='/sobre'>Sobre a Tera</Link><Link href='/contato'>Tenho interesse em um imóvel</Link><Link href='/favoritos'>Meus favoritos</Link><Link href='/acesso'>Área da imobiliária</Link></div></div><div className='container footer-bottom'><span>© {new Date().getFullYear()} Tera Imóveis</span><Link href='/privacidade'>Privacidade e uso do site</Link><span>Uma criação TeraApps</span></div></footer><Toaster theme='light' position='bottom-right'/></FavoritesContext.Provider>; }
