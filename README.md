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


## Plataforma de gestão multi-imobiliária (nova versão)

A gestão é acessada por **/acesso** (login pela TeraCode/TeraApps Identity, Authorization Code + PKCE).
O **/painel** é exclusivo dos proprietários, gestores e corretores vinculados a uma imobiliária. O **/master** é restrito aos IDs autenticados especificados em TERA_MASTER_SUBS. Cada empresa possui sua vitrine pública em **/vitrine/{slug}**.

### Recursos implementados
- Controle Master: cadastra empresas, indica proprietário via ID de identidade TeraCode, define plano, suspende e reativa.
- Gestão imobiliária: cadastro e publicação de anúncios (imóveis próprios da empresa), CRM de leads, agendamento de visitas, equipe e financeiro simples.
- Permissões e segregação: master global; owner administra a própria empresa; manager administra anúncios/CRM/visitas; agent trabalha em CRM/visitas; operações validadas no servidor por tenant_id.
- Leads enviados pelas páginas públicas entram na base CRM da imobiliária indicada.
- Cookies HttpOnly assinados com HMAC, OAuth2 PKCE e validação da identidade via /api/oauth/userinfo da TeraCode.
- Banco Postgres com tabelas por tenant, validações, RLS ligado e sem acesso direto a anon/authenticated.

### Configuração para colocar em funcionamento
1. Crie um **projeto Supabase dedicado** e execute o script de \`db/schema.sql\` no editor SQL desse projeto. Não utilize um banco de outro cliente.
2. No deploy Vercel da imobiliária, configure \`APP_URL\`, \`TERACODE_AUTH_URL\`, \`TERACODE_CLIENT_ID=tera-imoveis\`, \`SESSION_SECRET\` (mínimo 32 caracteres aleatórios), \`SUPABASE_URL\`, \`SUPABASE_SERVICE_ROLE_KEY\` e \`TERA_MASTER_SUBS\`. Veja \`.env.example\`.
3. No banco TeraCode Identity, registre o cliente OAuth \`tera-imoveis\` na tabela \`oauth_clients\`, com \`redirect_uris\` contendo a **URL exata** \`https://SEU-DOMINIO/api/auth/callback\` e \`active=true\`. Verifique a definição real da tabela antes do INSERT.
4. Consulte o \`id\` na tabela \`identity_users\` da TeraCode (ou o campo \`sub\` retornado por userinfo de uma autenticação autorizada). Configure **somente** os IDs verificados de administradores centrais em \`TERA_MASTER_SUBS\` (lista separada por vírgulas).
5. Faça login em \`/acesso\`, entre em \`/master\`, crie a imobiliária e vincule o \`sub\` da identidade TeraCode de seu proprietário. O dono utiliza o mesmo login e será encaminhado para \`/painel\`.
6. Cadastre anúncios no painel e marque os aprovados como **Publicado**; eles aparecerão automaticamente em \`/vitrine/{slug}\`. Formulários da vitrine alimentam o CRM.

**Segurança operacional:** o segredo do Supabase e os IDs Master só podem existir no ambiente servidor, nunca com prefixo NEXT_PUBLIC_ nem em commits. Antes de divulgar comercialmente o CRM, implemente limitação de requisições e CAPTCHA no formulário público, registro de auditoria, backup e políticas de privacidade/LGPD.

**Limites atuais:** o catálogo inicial da home segue **demonstrativo** e independente das vitrines multiempresa. O financeiro é controle interno de lançamentos — não processa pagamentos, boletos, repasses ou notas fiscais. Não há integração automática com portais, WhatsApp, gateways de assinatura ou cobrança de planos. O registro no provedor OAuth e a configuração do banco são etapas externas necessárias para liberar os novos painéis em produção.
