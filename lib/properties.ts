export type Property = {
    id: string;
    title: string;
    type: 'casa' | 'predio' | 'galpao';
    purpose: 'comprar' | 'alugar';
    city: string;
    neighborhood: string;
    price: number;
    area: number;
    beds?: number;
    baths: number;
    parking: number;
    image: string;
    alt: string;
    description: string;
    features: string[];
    fee: number;
    tax: number;
    floors?: number;
    height?: number;
};
export const typeLabels = { casa: 'Casa', predio: 'Prédio comercial', galpao: 'Galpão' };
export const properties: Property[] = [
    { id: 'TI-101', title: 'Casa com jardim e espaços integrados', type: 'casa', purpose: 'comprar', city: 'Barueri', neighborhood: 'Alphaville', price: 2450000, area: 320, beds: 4, baths: 5, parking: 4, image: 'casa-1', alt: 'Casa contemporânea com jardim e fachada envidraçada', description: 'Sala e área externa conectadas para aproveitar a casa em diferentes momentos do dia. A distribuição dos ambientes combina espaço para receber com a privacidade dos quartos.', features: ['4 suítes', 'Jardim privativo', 'Área de convivência', 'Cozinha integrada', 'Lavabo', 'Lavanderia'], fee: 980, tax: 460 },
    { id: 'TI-201', title: 'Prédio para um novo capítulo da sua empresa', type: 'predio', purpose: 'alugar', city: 'Barueri', neighborhood: 'Centro', price: 28000, area: 850, baths: 8, parking: 12, image: 'predio-1', alt: 'Fachada de prédio comercial contemporâneo', description: 'Pavimentos independentes permitem organizar recepção, equipes e salas de reunião de acordo com a operação. Uma opção para quem procura reunir a empresa em um único endereço.', features: ['3 pavimentos', 'Recepção', 'Salas moduláveis', 'Elevador', 'Copa por pavimento', 'Estacionamento'], fee: 0, tax: 1250, floors: 3 },
    { id: 'TI-301', title: 'Galpão com espaço para a operação crescer', type: 'galpao', purpose: 'alugar', city: 'Santana de Parnaíba', neighborhood: 'Tamboré', price: 42000, area: 1800, baths: 6, parking: 10, image: 'galpao-1', alt: 'Galpão industrial com ampla área operacional', description: 'Área operacional ampla, acessos para carga e um bloco de apoio administrativo. A configuração permite separar circulação, armazenamento e rotina do escritório.', features: ['Pé-direito de 10 m', '2 docas', 'Pátio de manobra', 'Escritório de apoio', 'Vestiários', 'Acesso para caminhões'], fee: 0, tax: 2100, height: 10 },
    { id: 'TI-102', title: 'Casa para viver com mais espaço', type: 'casa', purpose: 'alugar', city: 'Barueri', neighborhood: 'Aldeia da Serra', price: 12500, area: 260, beds: 3, baths: 4, parking: 3, image: 'casa-2', alt: 'Casa residencial com área externa arborizada', description: 'Ambientes bem distribuídos, quartos reservados e uma área externa para desacelerar. A casa oferece espaço para a rotina em família e para quem trabalha de casa.', features: ['3 suítes', 'Quintal', 'Escritório', 'Sala de jantar', 'Despensa', 'Varanda'], fee: 720, tax: 320 },
    { id: 'TI-202', title: 'Prédio comercial com pavimentos flexíveis', type: 'predio', purpose: 'comprar', city: 'Osasco', neighborhood: 'Vila Yara', price: 5600000, area: 1100, baths: 10, parking: 16, image: 'predio-2', alt: 'Edifício comercial de vários pavimentos', description: 'Pavimentos que podem receber diferentes equipes ou atividades. A área de apoio e o estacionamento ajudam a organizar o fluxo de funcionários e visitantes.', features: ['4 pavimentos', 'Elevador', 'Recepção', 'Salas de reunião', 'Copa', '16 vagas'], fee: 0, tax: 1850, floors: 4 },
    { id: 'TI-302', title: 'Galpão com pátio e apoio administrativo', type: 'galpao', purpose: 'comprar', city: 'Barueri', neighborhood: 'Jardim Belval', price: 4800000, area: 1500, baths: 4, parking: 8, image: 'galpao-2', alt: 'Estrutura de galpão industrial com espaço para armazenamento', description: 'Uma estrutura para acomodar estoque, produção ou distribuição, conforme a atividade e suas exigências. O bloco administrativo fica separado da área de trabalho.', features: ['Pé-direito de 8 m', 'Portão para carga', 'Pátio', 'Mezanino', 'Área administrativa', 'Vestiários'], fee: 0, tax: 1480, height: 8 },
    { id: 'TI-103', title: 'Casa com varanda e quintal', type: 'casa', purpose: 'comprar', city: 'Santana de Parnaíba', neighborhood: 'Centro', price: 980000, area: 190, beds: 3, baths: 3, parking: 2, image: 'casa-2', alt: 'Casa com varanda e espaço externo', description: 'Uma casa de proporções confortáveis, com varanda e quintal para aproveitar ao ar livre. Os espaços sociais ficam próximos da cozinha, facilitando o dia a dia.', features: ['3 quartos', 'Varanda', 'Quintal', 'Cozinha independente', 'Lavanderia', '2 vagas'], fee: 0, tax: 210 },
    { id: 'TI-203', title: 'Prédio para atendimento e escritórios', type: 'predio', purpose: 'alugar', city: 'Osasco', neighborhood: 'Centro', price: 19000, area: 620, baths: 6, parking: 8, image: 'predio-2', alt: 'Fachada de prédio destinado a escritórios', description: 'Espaços para organizar atendimento, salas de trabalho e apoio. A ocupação deve considerar as adaptações e autorizações necessárias para cada atividade.', features: ['2 pavimentos', 'Recepção', 'Salas independentes', 'Copa', 'Depósito', '8 vagas'], fee: 0, tax: 980, floors: 2 },
    { id: 'TI-303', title: 'Galpão para logística e armazenamento', type: 'galpao', purpose: 'alugar', city: 'Osasco', neighborhood: 'Industrial Anhanguera', price: 32000, area: 1200, baths: 4, parking: 6, image: 'galpao-1', alt: 'Área coberta de galpão para logística', description: 'Área coberta com acesso para veículos de carga e ambientes de apoio. Uma opção para planejar a organização do estoque e o fluxo da operação.', features: ['Pé-direito de 9 m', 'Doca', 'Acesso para carga', 'Escritório', 'Vestiários', 'Pátio'], fee: 0, tax: 1600, height: 9 }
];
export function money(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value); }
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export type Filters = {
    purpose: string;
    type: string;
    city: string;
    budget: string;
    area: string;
    sort: string;
    q: string;
};
export const defaultFilters: Filters = { purpose: 'todos', type: 'todos', city: 'todas', budget: 'todos', area: 'todos', sort: 'destaques', q: '' };
export const allowedFilters: Record<keyof Filters, string[] | null> = { purpose: ['todos', 'comprar', 'alugar'], type: ['todos', 'casa', 'predio', 'galpao'], city: ['todas', 'Barueri', 'Santana de Parnaíba', 'Osasco'], budget: ['todos', '15000', '30000', '50000', '1000000', '3000000', '6000000'], area: ['todos', '200', '500', '1000', '1500'], sort: ['destaques', 'menor', 'maior', 'area'], q: null };
export function validateFilters(input: Record<string, unknown>): Filters { const filters = { ...defaultFilters }; for (const key of Object.keys(filters) as (keyof Filters)[]) {
    const value = input[key];
    if (typeof value === 'string' && (!allowedFilters[key] || allowedFilters[key]!.includes(value)))
        filters[key] = key === 'q' ? value.slice(0, 120) : value;
} return filters; }
export function filterProperties(f: Filters) { let list = properties.filter(p => (f.purpose === 'todos' || p.purpose === f.purpose) && (f.type === 'todos' || p.type === f.type) && (f.city === 'todas' || p.city === f.city) && (f.budget === 'todos' || p.price <= Number(f.budget)) && (f.area === 'todos' || p.area >= Number(f.area)) && (!f.q || normalize(`${p.title} ${p.city} ${p.neighborhood} ${p.id} ${typeLabels[p.type]}`).includes(normalize(f.q)))); if (f.sort === 'menor')
    list.sort((a, b) => a.price - b.price); if (f.sort === 'maior')
    list.sort((a, b) => b.price - a.price); if (f.sort === 'area')
    list.sort((a, b) => b.area - a.area); return list; }
