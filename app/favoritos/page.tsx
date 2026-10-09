import { Favorites } from '@/components/favorites';
export const metadata = { title: 'Seus favoritos' };
export default function Page() { return <main id='conteudo'><div className='container page-heading'><p className='eyebrow'>ESCOLHAS PARA REVER COM CALMA</p><h1>Seus favoritos.</h1><p>Reúna os espaços que chamaram a sua atenção e compare as possibilidades.</p></div><Favorites /></main>; }
