-- Tenant ERP: packages, applications, planning, CMS blocks, income, co-partner.

alter table festivals add column if not exists package_id text;
alter table festivals add column if not exists copartner boolean not null default false;

create table if not exists license_packages (
  id text primary key,
  slug text not null unique,
  name text not null,
  kind text not null default 'self_serve',
  price_php integer not null default 0,
  billing text not null default 'per season',
  description text not null default '',
  features_json text not null default '[]',
  commission_pct integer not null default 0
);

create table if not exists tenant_applications (
  id text primary key,
  user_id text not null,
  organization_name text not null,
  festival_name text not null,
  city text not null default '',
  province text not null default '',
  contact_name text not null default '',
  contact_email text not null default '',
  package_id text not null references license_packages(id),
  notes text not null default '',
  status text not null default 'pending',
  festival_id text,
  created_at timestamptz not null default now()
);
create index if not exists tenant_applications_user_idx on tenant_applications (user_id);

create table if not exists festival_licenses (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  package_id text not null references license_packages(id),
  user_id text not null,
  status text not null default 'active',
  started_at timestamptz not null default now()
);

create table if not exists planning_items (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  key text not null,
  label text not null,
  done boolean not null default false,
  unique (festival_id, key)
);

create table if not exists cms_blocks (
  id text primary key,
  page_id text not null references festival_pages(id) on delete cascade,
  festival_id text not null references festivals(id) on delete cascade,
  kind text not null default 'text',
  heading text not null default '',
  body text not null default '',
  meta_json text not null default '{}',
  sort_order integer not null default 0,
  visible boolean not null default true
);
create index if not exists cms_blocks_page_idx on cms_blocks (page_id, sort_order);

create table if not exists sponsor_income (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  sponsor_id text,
  channel text not null default 'physical',
  amount_php integer not null default 0,
  recognized_on date not null,
  note text not null default ''
);

create table if not exists copartner_agreements (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  user_id text not null,
  status text not null default 'requested',
  commission_pct integer not null default 30,
  notes text not null default '',
  created_at timestamptz not null default now()
);
