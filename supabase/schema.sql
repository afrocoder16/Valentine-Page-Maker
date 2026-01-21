-- Pages table for published Valentine pages.
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  template_id text not null,
  doc jsonb not null,
  status text not null default 'draft',
  entitlement_session_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists pages_slug_idx on public.pages (slug);
create index if not exists pages_entitlement_session_idx on public.pages (entitlement_session_id);

alter table public.pages enable row level security;

-- Public read-only access to published pages.
create policy "public read published pages"
  on public.pages
  for select
  using (status = 'published');

drop policy if exists "public insert published pages" on public.pages;

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  session_id text unique not null,
  plan text not null,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

create index if not exists entitlements_session_idx on public.entitlements (session_id);

alter table public.entitlements enable row level security;

create table if not exists public.pending_publishes (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  template_id text not null,
  doc jsonb not null,
  created_at timestamp with time zone default now()
);

create index if not exists pending_publishes_session_idx on public.pending_publishes (session_id);

alter table public.pending_publishes enable row level security;

