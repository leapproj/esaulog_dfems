-- Operator accounts (tenant + SSP), staff roster, extra festival columns.

create table if not exists operator_accounts (
  id text primary key,
  username text not null unique,
  pass_hash text not null,
  kind text not null default 'tenant',
  display_name text not null default '',
  organization_name text not null default '',
  contact_email text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists operator_accounts_kind_idx on operator_accounts (kind);

create table if not exists staff_members (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  full_name text not null,
  role text not null default 'volunteer',
  phone text not null default '',
  email text not null default '',
  status text not null default 'active',
  assigned_event_id text,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists staff_members_festival_idx on staff_members (festival_id);

create table if not exists partner_requests (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  kind text not null default 'sponsor',
  organization_name text not null,
  contact_name text not null default '',
  contact_email text not null default '',
  notes text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
