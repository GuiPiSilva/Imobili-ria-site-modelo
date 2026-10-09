'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
export function FieldSelect({ id, label, value, onChange, options }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: [
        string,
        string
    ][];
}) { return <div className='field'><label id={`${id}-label`}>{label}</label><Select value={value} onValueChange={onChange}><SelectTrigger id={id} aria-labelledby={`${id}-label`} className='select-control'><SelectValue /></SelectTrigger><SelectContent position='popper'>{options.map(([value, title]) => <SelectItem key={value} value={value}>{title}</SelectItem>)}</SelectContent></Select></div>; }
export const purposeOptions: [
    string,
    string
][] = [['todos', 'Comprar ou alugar'], ['comprar', 'Comprar'], ['alugar', 'Alugar']];
export const typeOptions: [
    string,
    string
][] = [['todos', 'Todos os tipos'], ['casa', 'Casa'], ['predio', 'Prédio comercial'], ['galpao', 'Galpão']];
export const cityOptions: [
    string,
    string
][] = [['todas', 'Todas as cidades'], ['Barueri', 'Barueri'], ['Santana de Parnaíba', 'Santana de Parnaíba'], ['Osasco', 'Osasco']];
export function SearchForm() { const [purpose, setPurpose] = useState('comprar'), [type, setType] = useState('todos'), [city, setCity] = useState('todas'); const router = useRouter(); return <form className='search-form' onSubmit={e => { e.preventDefault(); router.push(`/imoveis?${new URLSearchParams({ purpose, type, city })}`); }}><FieldSelect id='home-purpose' label='Eu quero' value={purpose} onChange={setPurpose} options={purposeOptions}/><FieldSelect id='home-type' label='Tipo de imóvel' value={type} onChange={setType} options={typeOptions}/><FieldSelect id='home-city' label='Onde você procura?' value={city} onChange={setCity} options={cityOptions}/><button className='button search-button' type='submit'><Search size={18}/>Buscar imóveis</button></form>; }
