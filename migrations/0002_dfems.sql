-- eSAULOG DFEMS core schema. Idempotent. user_id columns are TEXT.

create table if not exists organizations (
  id text primary key,
  name text not null,
  kind text not null default 'organizer',
  city text not null default '',
  province text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists platform_members (
  user_id text not null,
  role text not null default 'ssp_admin',
  display_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id)
);

create table if not exists festivals (
  id text primary key,
  organization_id text not null references organizations(id),
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  description text not null default '',
  logo_text text not null default '',
  city text not null default '',
  province text not null default '',
  starts_on date not null,
  ends_on date not null,
  timezone text not null default 'Asia/Manila',
  status text not null default 'DRAFT',
  organizer_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  primary_color text not null default '#8FA392',
  hero_kicker text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists festivals_status_idx on festivals (status);

create table if not exists festival_members (
  festival_id text not null references festivals(id) on delete cascade,
  user_id text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (festival_id, user_id)
);

create table if not exists festival_pages (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  slug text not null,
  title text not null,
  body text not null default '',
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (festival_id, slug)
);

create table if not exists venues (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  address text not null default '',
  capacity integer not null default 0,
  kind text not null default 'outdoor',
  notes text not null default ''
);

create table if not exists event_categories (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  slug text not null
);

create table if not exists events (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  venue_id text references venues(id) on delete set null,
  category_id text references event_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  organizer text not null default '',
  event_type text not null default 'physical',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 0,
  registration_mode text not null default 'open',
  access_mode text not null default 'epass',
  status text not null default 'draft',
  published boolean not null default false,
  emergency_contact text not null default '',
  sponsor_id text,
  engagement_notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists events_festival_idx on events (festival_id, starts_at);

create table if not exists participants (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  user_id text,
  full_name text not null,
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  age_bracket text not null default '',
  status text not null default 'registered',
  created_at timestamptz not null default now()
);
create index if not exists participants_festival_idx on participants (festival_id);
create index if not exists participants_user_idx on participants (user_id);

create table if not exists event_registrations (
  id text primary key,
  event_id text not null references events(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table if not exists epasses (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  credential_id text not null unique,
  qr_payload text not null,
  nfc_id text,
  status text not null default 'active',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (festival_id, participant_id)
);

create table if not exists gates (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  event_id text references events(id) on delete cascade,
  name text not null
);

create table if not exists gate_access_keys (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  event_id text not null references events(id) on delete cascade,
  gate_id text references gates(id) on delete set null,
  code text not null unique,
  staff_role text not null default 'usher',
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  max_devices integer not null default 8,
  permission_scope text not null default 'checkin',
  active boolean not null default true
);

create table if not exists checkins (
  id text primary key,
  epass_id text not null references epasses(id) on delete cascade,
  event_id text not null references events(id) on delete cascade,
  gate_id text,
  access_key_id text,
  result text not null,
  reason text not null default '',
  checked_in_at timestamptz not null default now()
);
create index if not exists checkins_event_idx on checkins (event_id, checked_in_at);

create table if not exists badges (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon_key text not null default 'star'
);

create table if not exists missions (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  title text not null,
  description text not null default '',
  points integer not null default 0,
  badge_id text references badges(id) on delete set null,
  condition_type text not null default 'checkins',
  condition_value integer not null default 1,
  active boolean not null default true
);

create table if not exists participant_points (
  participant_id text not null references participants(id) on delete cascade,
  festival_id text not null references festivals(id) on delete cascade,
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (participant_id, festival_id)
);

create table if not exists participant_badges (
  participant_id text not null references participants(id) on delete cascade,
  badge_id text not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (participant_id, badge_id)
);

create table if not exists sponsors (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  tier text not null default 'official',
  logo_text text not null default '',
  website text not null default '',
  contact text not null default ''
);

create table if not exists sponsor_campaigns (
  id text primary key,
  sponsor_id text not null references sponsors(id) on delete cascade,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  description text not null default '',
  mission_id text references missions(id) on delete set null,
  status text not null default 'live',
  scans integer not null default 0,
  participants_count integer not null default 0
);

create table if not exists rewards (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  name text not null,
  description text not null default '',
  points_cost integer not null default 0,
  inventory integer not null default 0,
  sponsor_id text references sponsors(id) on delete set null
);

create table if not exists redemptions (
  id text primary key,
  reward_id text not null references rewards(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  status text not null default 'claimed',
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  user_id text,
  name text not null,
  category text not null default 'food',
  description text not null default '',
  location text not null default '',
  booster text not null default 'free',
  contact text not null default ''
);

create table if not exists products (
  id text primary key,
  vendor_id text not null references vendors(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_php integer not null default 0,
  available boolean not null default true
);

create table if not exists offers (
  id text primary key,
  vendor_id text not null references vendors(id) on delete cascade,
  festival_id text not null references festivals(id) on delete cascade,
  title text not null,
  description text not null default '',
  kind text not null default 'coupon',
  code text not null default '',
  active boolean not null default true
);

create table if not exists coupons (
  id text primary key,
  offer_id text not null references offers(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  code text not null,
  status text not null default 'issued',
  redeemed_at timestamptz
);

create table if not exists surveys (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  event_id text references events(id) on delete set null,
  title text not null,
  status text not null default 'open'
);

create table if not exists survey_questions (
  id text primary key,
  survey_id text not null references surveys(id) on delete cascade,
  prompt text not null,
  kind text not null default 'choice'
);

create table if not exists survey_responses (
  id text primary key,
  survey_id text not null references surveys(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  answers_json text not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists votes (
  id text primary key,
  event_id text not null references events(id) on delete cascade,
  participant_id text not null references participants(id) on delete cascade,
  choice text not null,
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table if not exists analytics_events (
  id text primary key,
  festival_id text,
  user_id text,
  participant_id text,
  name text not null,
  payload_json text not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_fest_idx on analytics_events (festival_id, name);

create table if not exists ai_recommendations (
  id text primary key,
  festival_id text not null references festivals(id) on delete cascade,
  title text not null,
  body text not null default '',
  severity text not null default 'info',
  status text not null default 'open',
  kind text not null default 'ops',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  actor_user_id text not null default '',
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  meta_json text not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists app_meta (
  key text primary key,
  value text not null
);
