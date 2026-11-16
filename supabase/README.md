# Ocean database setup

The migration and `ocean_app` NOLOGIN group role were applied to the configured project on 2026-11-12 and the migration version was recorded in Supabase history. Do not rerun `ocean-app-role.sql` on that project. A dedicated restricted login has been created and verified through the transaction pooler. The local app uses this login; the existing administrator configuration was preserved in the ignored `.env.admin.local` backup. Keep `OCEAN_WRITE_ENABLED=false` until rate limits and live write-path integration tests have been verified. The private schema must not be exposed through the Supabase Data API. The dedicated INHERIT LOGIN role is a member of the group and its credentials are stored outside Git. Use the dedicated login through the transaction pooler; do not use the postgres owner or public client credentials. Confirm the private schema is absent from the exposed Data API schemas.

The owner-approved application limits are 60 requests per minute globally and 5 per visitor token. Vercel now applies an additional 120 POSTs per source IP per fixed 60-second window to `/api/ocean/contribute`. Expired rate buckets are deleted during successful write attempts after one day; arrange scheduled cleanup if the app is retired. The live edge threshold was verified with writes disabled. A separate controlled deployed write check is still required before enabling writes.

For rollback, disable writes first. Back up the contribution table if its data matters. A destructive rollback can then drop the two Ocean tables and, only if empty and dedicated to Ocean, the private schema. Never drop contribution data without the owner's approval.

The draft uses node-postgres with pipelining disabled and one checked-out client per transaction. Configure `DATABASE_CA_CERT_PATH` to point to the trusted root certificate downloaded from Supabase when the system trust store does not recognize the database certificate. Certificate and hostname verification must remain enabled.

The rollback-only database setup tests require the administrator credentials, not the restricted app role. Use a separate development database or the ignored administrator backup and do not run destructive tests against real contributions.

The restricted login can be checked without leaving data by running `node --env-file=.env.local tests/ocean-live-rollback.integration.mjs` while `OCEAN_WRITE_ENABLED=false`. This exercises the database operations inside a transaction and verifies rollback; it does not test a committed contribution or the live HTTP write endpoint.

`node --env-file=.env.local tests/ocean-http-rollback.integration.mjs` also exercises the actual contribution handler against the restricted login within a rolled-back transaction. It checks responses and confirmed counts without committing a contribution; it does not replace a controlled deployed HTTP test.

## Magic Shop — migrated, public activation pending

`migrations/20261116133329_magic_shop.sql` extends the existing private schema and restricted `ocean_app` role; keep that schema outside the Data API. Do not recreate the Ocean role/schema or change its existing login. The Magic integration test applies the migration and a temporary owner role grant within BEGIN, then rolls everything back. It creates no persistent messages or tables and is not a deployment check.

Migration `20261116133329` was applied on 2026-11-16 after the owner continued the source handoff, with its SQL recorded atomically in `supabase_migrations.schema_migrations`. All five new tables have RLS; the existing restricted website login can read them without superuser or RLS-bypass privileges. Ocean contributions were preserved. The migration is not idempotent: it is now recorded and must not be reapplied. Keep `MAGIC_WRITE_ENABLED=false` pending public deployment/activation and review/privacy/usage readiness; Ocean's separate gate stays false.

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

Pre-migration rollback-only verification (both gates off; intentionally refuses once Magic tables already exist):

```sh
MAGIC_WRITE_ENABLED=false OCEAN_WRITE_ENABLED=false node --env-file=.env.local --env-file=.env.admin.local tests/magic-database.integration.mjs
```

This checks serial idempotency/RLS/withdrawal semantics, not simultaneous multi-connection races or a committed deployed write.

### Controlled check after migration

Use an isolated production build bound to loopback; do not enable public/hosted writes. In one terminal:

```sh
MAGIC_WRITE_ENABLED=true OCEAN_WRITE_ENABLED=false npm run start -- --hostname 127.0.0.1 --port 3468
```

In another terminal:

```sh
MAGIC_WRITE_ENABLED=false OCEAN_WRITE_ENABLED=false node --env-file=.env.local tests/magic-live.integration.mjs
```

The test reads the restricted connection from `.env.local` and owner configuration from ignored `.env.admin.local`. It accepts only HTTP loopback port 3468. It commits synthetic pending records, retries the same request, inspects/rejects with the real owner command, checks the reviewed status and withdrawal, and submits two simultaneous transactions through separate restricted connections. It verifies one row and publication denial, then removes only its generated request/message IDs and visitor rate buckets. Global rate accounting is preserved; no synthetic text is ever published. Stop the temporary write-enabled server afterward. A failed cleanup needs private owner inspection before rerunning; never wipe real messages or reset all rate buckets.

This verifies the local production HTTP path and hosted database, not the deployed public HTTP endpoint or operational moderation availability. Final artwork and phone/print QA remain separate.
