const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const days = ["2026-12-03", "2026-12-05", "2026-12-06", "unspecified"] as const;
export type ConcertDay = (typeof days)[number];
export type Contribution = { visitorToken: string; idempotencyKey: string; concertDay: ConcertDay };

export function validateContribution(value: unknown): Contribution | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => !["visitorToken", "idempotencyKey", "concertDay"].includes(key))) return null;
  if (typeof body.visitorToken !== "string" || !uuid.test(body.visitorToken) || typeof body.idempotencyKey !== "string" || !uuid.test(body.idempotencyKey)) return null;
  const day = body.concertDay ?? "unspecified";
  if (typeof day !== "string" || !days.includes(day as ConcertDay)) return null;
  return { visitorToken: body.visitorToken.toLowerCase(), idempotencyKey: body.idempotencyKey.toLowerCase(), concertDay: day as ConcertDay };
}
