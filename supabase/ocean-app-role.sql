-- Apply as the migration owner after reviewing role names and database grants.
-- Grant this NOLOGIN role to a dedicated LOGIN role whose password is stored outside Git.
create role ocean_app nologin;
grant usage on schema app_private to ocean_app;
grant select, insert on app_private.ocean_contributions to ocean_app;
grant select, insert, update, delete on app_private.ocean_rate_buckets to ocean_app;
create policy ocean_app_contributions on app_private.ocean_contributions for select to ocean_app using (true);
create policy ocean_app_contributions_insert on app_private.ocean_contributions for insert to ocean_app with check (true);
create policy ocean_app_buckets_select on app_private.ocean_rate_buckets for select to ocean_app using (true);
create policy ocean_app_buckets_insert on app_private.ocean_rate_buckets for insert to ocean_app with check (true);
create policy ocean_app_buckets_update on app_private.ocean_rate_buckets for update to ocean_app using (true) with check (true);
create policy ocean_app_buckets_delete on app_private.ocean_rate_buckets for delete to ocean_app using (true);
