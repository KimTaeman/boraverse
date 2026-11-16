import { isUuid, validateMagic, validReply, type MagicInput, type MagicWrite, type MagicReply, type Audience, type PublicMessage, publicMessage } from "../../lib/magic/validation.ts";
const visitorKey = "boraverse-magic-visitor-v1";
const pendingKey = "boraverse-magic-pending-v1";
const submittedKey = "boraverse-magic-submissions-v1";
export type MagicIntent = { action: "submit"; kind: Audience; title: string; text: string; consent: true } | { action: "react"; messageId: string; active: boolean } | { action: "remove"; messageId: string } | { action: "report"; messageId: string; reason: "harmful" | "private_information" | "other" };
export function visitor() {
  let token = localStorage.getItem(visitorKey);
  if (!isUuid(token)) { token = crypto.randomUUID(); localStorage.setItem(visitorKey, token); }
  return token;
}
export function pendingMagic(): MagicWrite | null {
  const raw = localStorage.getItem(pendingKey);
  if (!raw) return null;
  const parsed = validateMagic(JSON.parse(raw));
  if (!parsed || parsed.action === "draw") throw new Error("An earlier request could not be opened. Your saved keepsakes are unchanged.");
  return parsed;
}
export function submittedMagic(): { id: string; kind: Audience }[] {
  const raw = localStorage.getItem(submittedKey); if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(item => item && isUuid(item.id) && ["bangtan", "army"].includes(item.kind))) throw new Error("Submission history could not be opened.");
  return data;
}
async function request(input: RequestInfo, init: RequestInit = {}) {
  const timeout = new AbortController();
  const abort = () => timeout.abort();
  if (init.signal?.aborted) abort(); else init.signal?.addEventListener("abort", abort, { once: true });
  const timer = window.setTimeout(abort, 15000);
  try { return await fetch(input, { ...init, signal: timeout.signal }); }
  catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(timeout.signal.aborted ? "That is taking longer than expected. Your shared request can be retried safely." : "You may be offline. Your request was not confirmed. Reconnect and try again.");
  }
  finally { clearTimeout(timer); init.signal?.removeEventListener("abort", abort); }
}
async function post(input: MagicInput, signal?: AbortSignal): Promise<MagicReply> {
  const response = await request("/api/magic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal });
  const body = await response.json();
  if (!response.ok) {
    if (input.action !== "draw" && [400, 403, 404, 409, 413].includes(response.status)) { try { localStorage.removeItem(pendingKey); } catch {} }
    throw new Error(typeof body.message === "string" ? body.message : "The shop could not confirm your request. Please try again.");
  }
  if (!validReply(body, input)) throw new Error("The shop could not confirm this response. Your request is kept for a safe retry.");
  return body;
}
export async function sendMagic(intent: MagicIntent, signal?: AbortSignal) {
  const token = visitor();
  const pending = pendingMagic();
  const input = pending || { ...intent, visitorToken: token, requestId: crypto.randomUUID() };
  if (pending) {
    const { visitorToken: priorToken, requestId: priorKey, ...prior } = pending;
    void priorKey;
    if (priorToken !== token || JSON.stringify(prior) !== JSON.stringify(intent)) throw new Error("An earlier request needs checking first. Use Retry earlier request above.");
  }
  if (!pending) localStorage.setItem(pendingKey, JSON.stringify(input));
  return finishWrite(input, signal);
}
async function finishWrite(input: MagicWrite, signal?: AbortSignal) {
  const reply = await post(input, signal);
  try {
    if (reply.status === "submitted" && input.action === "submit") {
      const entries = submittedMagic();
      if (!entries.some(item => item.id === reply.submissionId)) localStorage.setItem(submittedKey, JSON.stringify([{ id: reply.submissionId, kind: input.kind }, ...entries].slice(0, 50)));
    }
    if (reply.status === "withdrawn") localStorage.setItem(submittedKey, JSON.stringify(submittedMagic().filter(item => item.id !== reply.messageId)));
    localStorage.removeItem(pendingKey);
  } catch { /* A confirmed server result remains valid when local history cannot be updated. */ }
  return reply;
}
export async function retryMagic(signal?: AbortSignal) {
  const input = pendingMagic(); if (!input) throw new Error("There is no earlier request to retry.");
  return finishWrite(input, signal);
}
export async function drawMagic(previousId?: string, signal?: AbortSignal) {
  let token: string; try { token = visitor(); } catch { token = crypto.randomUUID(); }
  const input: MagicInput = { action: "draw", visitorToken: token, ...(previousId ? { previousId } : {}) };
  return post(input, signal);
}
export async function collection(cursor?: string, signal?: AbortSignal) {
  const response = await request("/api/magic" + (cursor ? "?cursor=" + encodeURIComponent(cursor) : ""), { signal });
  if (!response.ok) throw new Error("The shared collection is resting. Please try again shortly.");
  const body = await response.json();
  if (body.status !== "ok" || !Array.isArray(body.items) || body.items.length > 12 || !body.items.every(publicMessage) || (body.nextCursor !== null && !isUuid(body.nextCursor)) || typeof body.writesEnabled !== "boolean") throw new Error("The collection could not be confirmed.");
  return body as { status: "ok"; items: PublicMessage[]; nextCursor: string | null; writesEnabled: boolean };
}
