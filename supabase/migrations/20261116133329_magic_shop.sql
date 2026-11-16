-- Requires the existing private schema and restricted ocean_app group role.
create table app_private.magic_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  kind text not null check(kind in ('bangtan','army')),
  title text not null check(char_length(title) between 1 and 80),
  body text not null check(char_length(body) between 1 and 1200 and (kind='bangtan' or char_length(body)<=500)),
  author_hash text not null check(author_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending' check(status in ('pending','published','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create index magic_published_idx on app_private.magic_messages(kind,id desc) where status='published';
create index magic_review_idx on app_private.magic_messages(created_at,id) where status='pending';
create table app_private.magic_requests (
  request_id uuid primary key,
  visitor_hash text not null check(visitor_hash ~ '^[0-9a-f]{64}$'),
  operation text not null check(operation in ('submit','react','remove','report')),
  payload_hash text not null,
  result_id uuid,
  created_at timestamptz not null default now()
);
create table app_private.magic_reactions (
  message_id uuid not null references app_private.magic_messages(id) on delete cascade,
  visitor_hash text not null check(visitor_hash ~ '^[0-9a-f]{64}$'),
  active boolean not null default true,
  primary key(message_id,visitor_hash)
);
create index magic_active_reactions_idx on app_private.magic_reactions(message_id) where active;
create table app_private.magic_reports (
  request_id uuid primary key references app_private.magic_requests(request_id),
  message_id uuid not null references app_private.magic_messages(id) on delete cascade,
  reporter_hash text not null,
  reason text not null check(reason in ('harmful','private_information','other')),
  created_at timestamptz not null default now()
);
create table app_private.magic_rate_buckets (
  bucket_hash text not null,
  window_start timestamptz not null,
  hits integer not null check(hits>0),
  primary key(bucket_hash,window_start)
);
create index magic_rate_cleanup_idx on app_private.magic_rate_buckets(window_start);
alter table app_private.magic_messages enable row level security;
alter table app_private.magic_requests enable row level security;
alter table app_private.magic_reactions enable row level security;
alter table app_private.magic_reports enable row level security;
alter table app_private.magic_rate_buckets enable row level security;
revoke all on app_private.magic_messages,app_private.magic_requests,app_private.magic_reactions,app_private.magic_reports,app_private.magic_rate_buckets from public,anon,authenticated;
grant select,insert on app_private.magic_messages to ocean_app;
grant update(status,published_at) on app_private.magic_messages to ocean_app;
grant select,insert on app_private.magic_requests to ocean_app;
grant update(result_id) on app_private.magic_requests to ocean_app;
grant select,insert,update on app_private.magic_reactions to ocean_app;
grant select,insert on app_private.magic_reports to ocean_app;
grant select,insert,update,delete on app_private.magic_rate_buckets to ocean_app;
create policy magic_message_read on app_private.magic_messages for select to ocean_app
  using(status='published' or author_hash=current_setting('app.magic_visitor',true));
create policy magic_message_submit on app_private.magic_messages for insert to ocean_app
  with check(status='pending' and published_at is null and author_hash=current_setting('app.magic_visitor',true));
create policy magic_message_withdraw on app_private.magic_messages for update to ocean_app
  using(author_hash=current_setting('app.magic_visitor',true))
  with check(author_hash=current_setting('app.magic_visitor',true) and status='withdrawn' and published_at is null);
-- Request metadata contains no message body. The server counts it for the global capacity guard.
create policy magic_request_read on app_private.magic_requests for select to ocean_app using(true);
create policy magic_request_insert on app_private.magic_requests for insert to ocean_app with check(visitor_hash=current_setting('app.magic_visitor',true));
create policy magic_request_result on app_private.magic_requests for update to ocean_app
  using(visitor_hash=current_setting('app.magic_visitor',true)) with check(visitor_hash=current_setting('app.magic_visitor',true));
create policy magic_reaction_read on app_private.magic_reactions for select to ocean_app
  using(exists(select 1 from app_private.magic_messages m where m.id=message_id and m.status='published'));
create policy magic_reaction_insert on app_private.magic_reactions for insert to ocean_app
  with check(visitor_hash=current_setting('app.magic_visitor',true) and exists(select 1 from app_private.magic_messages m where m.id=message_id and m.kind='bangtan' and m.status='published'));
create policy magic_reaction_update on app_private.magic_reactions for update to ocean_app
  using(visitor_hash=current_setting('app.magic_visitor',true))
  with check(visitor_hash=current_setting('app.magic_visitor',true) and exists(select 1 from app_private.magic_messages m where m.id=message_id and m.kind='bangtan' and m.status='published'));
create policy magic_report_read on app_private.magic_reports for select to ocean_app using(reporter_hash=current_setting('app.magic_visitor',true));
create policy magic_report_insert on app_private.magic_reports for insert to ocean_app
  with check(reporter_hash=current_setting('app.magic_visitor',true) and exists(select 1 from app_private.magic_messages m where m.id=message_id and m.status='published'));
create policy magic_bucket_access on app_private.magic_rate_buckets for all to ocean_app using(true) with check(true);
