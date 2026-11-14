export const confirmedKey = "boraverse-ocean-confirmed-v1";
const visitorKey = "boraverse-ocean-visitor";
const pendingKey = "boraverse-ocean-pending";
const retryKey = "boraverse-ocean-retry-after";

export class OceanRateLimit extends Error {
  retryAt: number;
  constructor(retryAt: number) { super("rate limited"); this.retryAt = retryAt; }
}

export class OceanUnavailable extends Error {}

export type OceanReply = { status: "accepted" | "already_contributed"; totalLights: number };

export async function oceanFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener("abort", abort, { once: true });
  const timer = window.setTimeout(abort, 15000);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { window.clearTimeout(timer); init.signal?.removeEventListener("abort", abort); }
}

export async function submitLight(signal?: AbortSignal): Promise<OceanReply> {
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
    method: "POST", signal,
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
  if (response.status === 503) throw new OceanUnavailable("unavailable");
  if (response.status === 409) localStorage.removeItem(pendingKey);
  if (!response.ok) throw new Error("unavailable");
  const result = await response.json();
  if ((result.status !== "accepted" && result.status !== "already_contributed") || !Number.isSafeInteger(result.totalLights) || result.totalLights < 0) throw new Error("invalid response");
  try { localStorage.removeItem(pendingKey); localStorage.setItem(confirmedKey, "1"); } catch { /* A confirmed response remains valid when browser storage is unavailable. */ }
  return result;
}
