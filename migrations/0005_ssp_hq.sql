-- Super Admin HQ: last seen for assigned TukodPH operators.

alter table operator_accounts
  add column if not exists last_seen_at timestamptz;
