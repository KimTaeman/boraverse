# Content registry

`freebies.ts` lists the eight planned families and their existing destinations. Each family has an unapproved `01` placeholder; the owner has not approved any variant IDs or copy. `examples/freebies.sample.json` contains planning examples only and is not a production route manifest.

Add a variant only after its ID and original copy are approved. Mark it `approved: true` only after owner review. Unknown and unapproved variants always show a friendly fallback. Do not print a QR until its final HTTPS route and the physical sample have been tested.
