# Launch readiness — not ready

Status reviewed 2026-11-12. This is a pre-launch checklist, not an approval to deploy or print.

## Blocking items

- **Ocean:** The private schema migration and restricted group role have been applied to the configured project; a dedicated restricted login has not yet been created. Keep `OCEAN_WRITE_ENABLED=false`. Follow `supabase/README.md`, verify private schema and role permissions, then test real aggregate reads, a controlled contribution, idempotent retry, rate limits, database outage, and the write kill switch before enabling writes. Review the proposed global limit with the owner and configure a trusted ingress limit appropriate to the host.
- **QR:** No family variants are approved. The `01` records are placeholders and currently show the fallback. Approve original artwork, copy and stable IDs, choose the real HTTPS domain, verify every resulting route, and freeze it before printing. Do not print sample or placeholder URLs as production codes.
- **Hosting:** No production deployment, domain, TLS route, monitoring or rollback has been verified. Confirm host terms and budget, configure secrets server-side, verify CA availability on the host, and deploy only with owner approval.
- **Real devices and print:** Test Android and iPhone browsers, keyboard and reduced motion, poor connectivity, image saving, and actual QR print samples on each material. Check glare, quiet zones, cutting margins and sleeve fit before a print run.
- **Content and rights:** The gacha and Magic Shop use provisional original text and placeholder art. The song picker has only two official video links; review final selections, wording, attribution and licenses. Review and finalize the privacy statement and retention policy for the actual hosting setup.

## Recovery

1. Turn off Ocean writes through `OCEAN_WRITE_ENABLED` and redeploy the configuration according to the selected host's procedure; confirm a write receives 503 without modifying the count.
2. Keep the rest of the site available where possible. Check provider status and logs without exposing tokens, IDs or secrets.
3. Verify the database before re-enabling writes. Preserve unresolved client idempotency keys; do not compensate with invented counts.
4. Roll back the application using the host's documented mechanism. Do not drop Ocean tables or erase contributions as part of routine rollback.

## Local evidence

The production dependency audit, lint, TypeScript, unit tests, production build and browser smoke suite were run locally. Browser tests use mocked Ocean responses or the disabled write switch; they are not evidence of a successful production contribution. The two placeholder SVG files occupy approximately 8 KiB combined on disk. A full performance audit and physical-device checks remain outstanding.
