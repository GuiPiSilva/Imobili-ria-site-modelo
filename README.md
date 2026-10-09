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


## Plataforma de gestão multi-imobiliária (TeraApps Identity)

O site anterior permanece demonstrativo. A plataforma de gestão é acessada em \`/acesso\`, proprietários/gerentes/corretores em \`/painel\` e administradores centrais em \`/master\`. Cada imobiliária gerencia seus próprios dados e tem vitrine em \`/vitrine/{slug}\`.

### Autenticação Tera ID

O login utiliza o provedor **TeraApps** hospedado em \`https://teraapps.netlify.app\`, com Firebase Authentication e e-mail confirmado; não utiliza o login legado da TeraCode. O fluxo é Authorization Code + PKCE S256: \`GET /api/auth/login\` redireciona para \`https://teraapps.netlify.app/sso\` e \`GET /api/auth/callback\` troca o código em \`POST https://teraapps.netlify.app/api/oauth/token\`. A resposta validada contém \`{token_type:"tera_identity",user:{sub,email,email_verified,name}}\`; não existe endpoint \`userinfo\` neste fluxo.

O aplicativo de identidade tem client ID fixo \`tera_imoveis_web\`. Este cliente foi implementado no repositório \`GuiPiSilva/TeraApps\`, com callbacks permitidos por correspondência exata: \`https://imobiliaria-site-modelo.vercel.app/api/auth/callback\` e \`http://localhost:3000/api/auth/callback\`. Para domínio customizado, autorize explicitamente o endereço exato na variável \`TERA_IMOVEIS_REDIRECT_URIS\` do servidor TeraApps. Não use callbacks de domínio diferente nem curingas.

A autenticação é diferente da autorização: **qualquer usuário que confirme sua Tera ID poderá fazer login, mas somente quem tiver vínculo ativo no banco imobiliário acessará um painel**. O Master exige que o \`sub\` (Firebase Auth UID verificado, não e-mail) esteja listado em \`TERA_MASTER_SUBS\`.

### Recursos iniciais
- Painel Master com criação/suspensão de imobiliárias, planos e vínculos de proprietários.
- Imóveis publicados nas vitrines individuais, CRM e leads do site, visitas agendadas, equipe e financeiro simples.
- Permissões verificadas no servidor: Master, owner, manager e agent; consultas e gravações com \`tenant_id\`.
- Banco de dados Postgres segregado por imobiliária, RLS habilitada e nenhuma policy pública.

### Configurar no ambiente Vercel

1. Crie um projeto Supabase *dedicado ao imobiliário*, execute o SQL de \`db/schema.sql\` e guarde \`SUPABASE_URL\` e a chave de serviço **somente no painel da Vercel**.
2. Configure as variáveis descritas em \`.env.example\`: \`APP_URL=https://imobiliaria-site-modelo.vercel.app\`, \`TERAAPPS_AUTH_URL=https://teraapps.netlify.app\`, \`TERAAPPS_CLIENT_ID=tera_imoveis_web\`, \`SESSION_SECRET\`, \`SUPABASE_URL\`, \`SUPABASE_SERVICE_ROLE_KEY\` e \`TERA_MASTER_SUBS\`.
3. Aguarde a versão da TeraApps com o cliente \`tera_imoveis_web\` ser publicada. Confirme \`GET https://teraapps.netlify.app/api/oauth/client?client_id=tera_imoveis_web&redirect_uri=https%3A%2F%2Fimobiliaria-site-modelo.vercel.app%2Fapi%2Fauth%2Fcallback\`.
4. No Firebase Console da TeraApps, em Authentication > Users, obtenha o **UID** do usuário que será Master e configure este UID em \`TERA_MASTER_SUBS\`. Não conceda Master apenas pelo e-mail.
5. Teste \`/acesso\`, \`/master\`, vincule o UID de cada proprietário à sua imobiliária; o proprietário então entra por \`/painel\`.
6. Cadastre imóveis, publique na vitrine e confira a entrada dos contatos no CRM.

**Antes do uso comercial:** configurar proteção anti-spam/rate limiting e consentimento LGPD; testar autorização cruzada entre tenants e revogação; adicionar monitoramento, auditoria e backups. O financeiro é um livro simples sem emissão de boletos, cobrança recorrente ou integração fiscal. O catálogo original do site não foi substituído pelos novos anúncios de empresas.

