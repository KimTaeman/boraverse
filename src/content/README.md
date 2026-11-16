# Content registry

`freebies.ts` lists the eight planned families and their existing destinations. Each family has an existing `01` record. The owner approved its English message body on 2026-11-16 (D014); separate titles, IDs/destination freeze, final artwork/source rights and public release remain pending, so every record stays `approved: false`. The review table is in `docs/08-CONTENT-AND-LORE.md`. `examples/freebies.sample.json` contains planning examples only and is not a production route manifest.

Add a variant only after its ID and original copy are approved. Mark it `approved: true` only after the remaining title, route/destination and artwork/source-rights reviews pass; message-body approval alone is not public-release approval. Unknown and unapproved variants always show a friendly fallback. Do not print a QR until its final HTTPS route and the physical sample have been tested.
