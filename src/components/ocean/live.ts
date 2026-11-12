const visitorKey = "boraverse-ocean-visitor";
const pendingKey = "boraverse-ocean-pending";
const retryKey = "boraverse-ocean-retry-after";

export class OceanRateLimit extends Error { constructor(public retryAt: number) { super("rate limited"); } }

export type OceanReply = { status: "accepted" | "already_contributed"; totalLights: number };

export async function oceanFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { window.clearTimeout(timer); }
}

export async function submitLight(): Promise<OceanReply> {
  const retryAt = Number(localStorage.getItem(retryKey));
  if (Number.isFinite(retryAt) && retryAt > Date.now()) throw new OceanRateLimit(retryAt);
  let visitor = localStorage.getItem(visitorKey);
  if (!visitor) {
    visitor = crypto.randomUUID();
    localStorage.setItem(visitorKey, visitor);
  }
  let key = localStorage.getItem(pendingKey);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(pendingKey, key);
  }
  const response = await oceanFetch("/api/ocean/contribute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorToken: visitor, idempotencyKey: key, concertDay: "unspecified" }),
  });
  if (response.status === 429) {
    const value = response.headers.get("Retry-After");
    const seconds = value && /^\d+$/.test(value) ? Number(value) : 60;
    const retryAt = Date.now() + Math.max(1, Number.isSafeInteger(seconds) ? seconds : 60) * 1000;
    localStorage.setItem(retryKey, String(retryAt));
    throw new OceanRateLimit(retryAt);
  }
  if (response.status === 409) localStorage.removeItem(pendingKey);
  if (!response.ok) throw new Error("unavailable");
  const result = await response.json();
  if ((result.status !== "accepted" && result.status !== "already_contributed") || !Number.isSafeInteger(result.totalLights) || result.totalLights < 0) throw new Error("invalid response");
  localStorage.removeItem(pendingKey);
  return result;
}
