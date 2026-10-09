-- Execute em um projeto Supabase dedicado à plataforma imobiliária.
-- A identidade é verificada pela TeraCode; o banco armazena vínculos e dados de negócio.
create extension if not exists pgcrypto;
create table if not exists public.imob_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active','suspended')),
  plan text not null default 'starter' check (plan in ('starter','pro','enterprise')),
  created_at timestamptz not null default now()
);
create table if not exists public.imob_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.imob_tenants(id) on delete cascade,
  identity_sub text not null check (length(identity_sub) > 0),
  display_name text not null default '',
  role text not null check (role in ('owner','manager','agent')),
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now(),
  unique (tenant_id, identity_sub)
);
create table if not exists public.imob_properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.imob_tenants(id) on delete cascade,
  title text not null,
  type text not null check (type in ('casa','apartamento','predio','galpao','terreno','comercial')),
  deal_type text not null check (deal_type in ('venda','locacao')),
  city text not null,
  neighborhood text not null default '',
  price numeric(15,2) not null check (price >= 0),
  area_m2 numeric(12,2) not null default 0 check (area_m2 >= 0),
  image_url text,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  unique (id, tenant_id)
);
create table if not exists public.imob_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.imob_tenants(id) on delete cascade,
  property_id uuid,
  name text not null,
  email text,
  phone text not null,
  message text,
  stage text not null default 'new' check (stage in ('new','contacted','visit','proposal','won','lost')),
  created_at timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (property_id,tenant_id) references public.imob_properties(id,tenant_id)
);
create table if not exists public.imob_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.imob_tenants(id) on delete cascade,
  lead_id uuid not null,
  scheduled_at timestamptz not null,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  foreign key (lead_id,tenant_id) references public.imob_leads(id,tenant_id)
);
create table if not exists public.imob_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.imob_tenants(id) on delete cascade,
  title text not null,
  amount numeric(15,2) not null check (amount >= 0),
  due_date date not null,
  category text not null default 'receita' check (category in ('receita','despesa')),
  status text not null default 'pending' check (status in ('pending','paid','late')),
  created_at timestamptz not null default now()
);
create index if not exists idx_imob_properties_tenant on public.imob_properties(tenant_id,status);
create index if not exists idx_imob_leads_tenant on public.imob_leads(tenant_id,created_at desc);
create index if not exists idx_imob_memberships_sub on public.imob_memberships(identity_sub);
create index if not exists idx_imob_visits_tenant on public.imob_visits(tenant_id,scheduled_at);
create index if not exists idx_imob_invoices_tenant on public.imob_invoices(tenant_id,due_date);
alter table public.imob_tenants enable row level security;
alter table public.imob_memberships enable row level security;
alter table public.imob_properties enable row level security;
alter table public.imob_leads enable row level security;
alter table public.imob_visits enable row level security;
alter table public.imob_invoices enable row level security;
-- Usuários públicos não possuem acesso direto a estas tabelas.
revoke all on public.imob_tenants, public.imob_memberships, public.imob_properties, public.imob_leads, public.imob_visits, public.imob_invoices from anon, authenticated;
grant select,insert,update,delete on public.imob_tenants, public.imob_memberships, public.imob_properties, public.imob_leads, public.imob_visits, public.imob_invoices to service_role;
-- Sem policies para anon/authenticated: somente API confiável valida sessão e escopo.
