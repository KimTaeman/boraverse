-- Private schema: expose only through the server-side application role.
create schema if not exists app_private;
revoke all on schema app_private from public;

create table app_private.ocean_contributions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  visitor_hash text not null unique,
  concert_day text not null default 'unspecified'
    check (concert_day in ('2026-12-03', '2026-12-05', '2026-12-06', 'unspecified')),
  accepted_at timestamptz not null default now()
);
create index ocean_contributions_day_idx on app_private.ocean_contributions (concert_day);
revoke all on app_private.ocean_contributions from public;

create table app_private.ocean_rate_buckets (
  bucket_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  primary key (bucket_hash, window_start)
);
create index ocean_rate_buckets_window_idx on app_private.ocean_rate_buckets (window_start);
revoke all on app_private.ocean_rate_buckets from public;

-- Defense in depth: the application role must be configured with explicit access.
alter table app_private.ocean_contributions enable row level security;
alter table app_private.ocean_rate_buckets enable row level security;
