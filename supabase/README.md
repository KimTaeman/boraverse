# Ocean database setup

The migration is not applied automatically. Keep `OCEAN_WRITE_ENABLED=false` until the migration, database role, rate limits and integration tests have been verified. The private schema must not be exposed through the Supabase Data API. Review and apply `ocean-app-role.sql` as the migration owner, then grant its NOLOGIN group role to a dedicated INHERIT LOGIN role created securely outside Git. Use the dedicated login through the transaction pooler; do not use the postgres owner or public client credentials. Confirm the private schema is absent from the exposed Data API schemas.

The proposed rate limits are 60 requests per minute globally and 5 per visitor token. Expired rate buckets are deleted during successful write attempts after one day; arrange scheduled cleanup if the app is retired. These limits need operational review and do not replace a trusted ingress limit.

For rollback, disable writes first. Back up the contribution table if its data matters. A destructive rollback can then drop the two Ocean tables and, only if empty and dedicated to Ocean, the private schema. Never drop contribution data without the owner's approval.

The draft uses node-postgres with pipelining disabled and one checked-out client per transaction. Configure `DATABASE_CA_CERT_PATH` to point to the trusted root certificate downloaded from Supabase when the system trust store does not recognize the database certificate. Certificate and hostname verification must remain enabled.
