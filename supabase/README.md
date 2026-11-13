# Ocean database setup

The migration and `ocean_app` NOLOGIN group role were applied to the configured project on 2026-11-12 and the migration version was recorded in Supabase history. Do not rerun `ocean-app-role.sql` on that project. A dedicated restricted login has been created and verified through the transaction pooler. The local app uses this login; the existing administrator configuration was preserved in the ignored `.env.admin.local` backup. Keep `OCEAN_WRITE_ENABLED=false` until rate limits and live write-path integration tests have been verified. The private schema must not be exposed through the Supabase Data API. The dedicated INHERIT LOGIN role is a member of the group and its credentials are stored outside Git. Use the dedicated login through the transaction pooler; do not use the postgres owner or public client credentials. Confirm the private schema is absent from the exposed Data API schemas.

The proposed rate limits are 60 requests per minute globally and 5 per visitor token. Expired rate buckets are deleted during successful write attempts after one day; arrange scheduled cleanup if the app is retired. These limits need operational review and do not replace a trusted ingress limit.

For rollback, disable writes first. Back up the contribution table if its data matters. A destructive rollback can then drop the two Ocean tables and, only if empty and dedicated to Ocean, the private schema. Never drop contribution data without the owner's approval.

The draft uses node-postgres with pipelining disabled and one checked-out client per transaction. Configure `DATABASE_CA_CERT_PATH` to point to the trusted root certificate downloaded from Supabase when the system trust store does not recognize the database certificate. Certificate and hostname verification must remain enabled.

The rollback-only database setup tests require the administrator credentials, not the restricted app role. Use a separate development database or the ignored administrator backup and do not run destructive tests against real contributions.
