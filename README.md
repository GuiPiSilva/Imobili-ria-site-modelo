# Tera Imóveis

Site de imobiliária em Next.js, React e TypeScript, preparado para Vercel.

## Executar localmente

Requer Node.js 24.x e pnpm 11.25.0.

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Abra http://localhost:3000.

## Verificar e compilar

```sh
pnpm test
pnpm check
pnpm build
pnpm start
```

## Publicar na Vercel

- Importe este repositório pela integração GitHub.
- Framework: Next.js. Diretório raiz: a raiz do repositório.
- Node.js: 24.x. Branch de produção: main.
- Instalação: pnpm install --frozen-lockfile. Build: pnpm build.
- Diretório de saída: padrão do Next.js. Não informe dist.
- Nenhuma variável de ambiente é necessária nesta versão.
- Novos commits na main poderão atualizar o site pela integração Git.

## Funcionalidades

Catálogo de casas, prédios comerciais e galpões; filtros, busca e ordenação; páginas individuais com custos; foto ampliada; favoritos locais; ficha para download; formulário validado com resumo para copiar ou baixar; páginas sobre e privacidade; estados de carregamento, erro e busca vazia.

## Personalização

- Imóveis e preços: lib/properties.ts.
- Cores e responsividade: app/globals.css.
- Fotos: public/images. Fontes e licenças: lib/image-sources.json.
- Marca, menu e rodapé: components/site-shell.tsx.
- Demais textos: app e components.

Nome e catálogo são demonstrativos. Valores e localizações são ilustrativos; as fotos não correspondem aos endereços. O formulário não envia mensagens, confirma visitas ou grava contatos. Configure os anúncios reais e o canal de atendimento antes do uso comercial.

A identidade visual e os fluxos foram preservados na adaptação do projeto para o Next.js padrão. A revisão visual pelo navegador foi bloqueada na sessão de criação. A ferramenta WebMCP é opcional e depende do suporte do navegador.
