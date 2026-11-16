# Ocean database setup

The migration and `ocean_app` NOLOGIN group role were applied to the configured project on 2026-11-12 and the migration version was recorded in Supabase history. Do not rerun `ocean-app-role.sql` on that project. A dedicated restricted login has been created and verified through the transaction pooler. The local app uses this login; the existing administrator configuration was preserved in the ignored `.env.admin.local` backup. Keep `OCEAN_WRITE_ENABLED=false` until rate limits and live write-path integration tests have been verified. The private schema must not be exposed through the Supabase Data API. The dedicated INHERIT LOGIN role is a member of the group and its credentials are stored outside Git. Use the dedicated login through the transaction pooler; do not use the postgres owner or public client credentials. Confirm the private schema is absent from the exposed Data API schemas.

The owner-approved application limits are 60 requests per minute globally and 5 per visitor token. Vercel now applies an additional 120 POSTs per source IP per fixed 60-second window to `/api/ocean/contribute`. Expired rate buckets are deleted during successful write attempts after one day; arrange scheduled cleanup if the app is retired. The live edge threshold was verified with writes disabled. A separate controlled deployed write check is still required before enabling writes.

For rollback, disable writes first. Back up the contribution table if its data matters. A destructive rollback can then drop the two Ocean tables and, only if empty and dedicated to Ocean, the private schema. Never drop contribution data without the owner's approval.

The draft uses node-postgres with pipelining disabled and one checked-out client per transaction. Configure `DATABASE_CA_CERT_PATH` to point to the trusted root certificate downloaded from Supabase when the system trust store does not recognize the database certificate. Certificate and hostname verification must remain enabled.

The rollback-only database setup tests require the administrator credentials, not the restricted app role. Use a separate development database or the ignored administrator backup and do not run destructive tests against real contributions.

The restricted login can be checked without leaving data by running `node --env-file=.env.local tests/ocean-live-rollback.integration.mjs` while `OCEAN_WRITE_ENABLED=false`. This exercises the database operations inside a transaction and verifies rollback; it does not test a committed contribution or the live HTTP write endpoint.

`node --env-file=.env.local tests/ocean-http-rollback.integration.mjs` also exercises the actual contribution handler against the restricted login within a rolled-back transaction. It checks responses and confirmed counts without committing a contribution; it does not replace a controlled deployed HTTP test.

## Magic Shop — source prepared, migration not applied

`migrations/20261116133329_magic_shop.sql` extends the existing private schema and restricted `ocean_app` role; keep that schema outside the Data API. Do not recreate the Ocean role/schema or change its existing login. The Magic integration test applies the migration and a temporary owner role grant within BEGIN, then rolls everything back. It creates no persistent messages or tables and is not a deployment check.

Keep `MAGIC_WRITE_ENABLED=false` until the owner applies the versioned migration through the existing owner-only migration workflow, records it in migration history, verifies restricted-role reads/writes, and confirms review/privacy/usage readiness. The migration itself is not idempotent: check history first. No real schema was changed by this implementation. Ocean's separate gate stays false.

Owner review uses ignored `.env.admin.local` overriding the restricted connection. For example:

```sh
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs list
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs show <message-uuid>
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs publish <message-uuid>
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs reject <message-uuid>
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs reports
node --env-file=.env.local --env-file=.env.admin.local scripts/review-magic.mjs hide <message-uuid>
```

Review the complete text privately before publishing: original supportive writing only, no contact details, links, harassment, copyrighted lyrics or implication of direct delivery to BTS. Publish/reject acts only on pending entries; hide withdraws a published entry. The web application never receives the owner credentials. Reports do not automatically delete text; review them promptly. Disable Magic writes first if review capacity or usage becomes unsafe; hiding/owner review still works independently. Do not drop shared records without owner approval and a retention/export review.

Rollback-only verification command (both gates off):

```sh
MAGIC_WRITE_ENABLED=false OCEAN_WRITE_ENABLED=false node --env-file=.env.local --env-file=.env.admin.local tests/magic-database.integration.mjs
```

This checks serial idempotency/RLS/withdrawal semantics, not simultaneous multi-connection races or a committed deployed write.
