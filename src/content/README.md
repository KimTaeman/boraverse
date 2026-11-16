# Content registry

`freebies.ts` lists the eight planned families and their existing destinations. Each family has an existing unapproved `01` record with original draft copy for owner review; no variant ID, copy or artwork has been approved. The review table is in `docs/08-CONTENT-AND-LORE.md`. `examples/freebies.sample.json` contains planning examples only and is not a production route manifest.

Add a variant only after its ID and original copy are approved. Mark it `approved: true` only after owner review. Unknown and unapproved variants always show a friendly fallback. Do not print a QR until its final HTTPS route and the physical sample have been tested.
