import { validateMagic, type MagicInput, type MagicReply } from "./validation.ts";
export type MagicFailure = { status: "rate_limited" | "conflict" | "not_found" | "full" };
export function magicError(code: string, status: number, message: string) {
  return Response.json({ status: "error", code, message }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
}
export async function handleMagic(request: Request, enabled: boolean, perform: (input: MagicInput) => Promise<MagicReply | MagicFailure>) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return magicError("INVALID", 403, "Please share from the Magic Shop page.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) return magicError("INVALID", 400, "Please check your words and try again.");
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > 8192)) return magicError("TOO_LARGE", 413, "Please keep your message a little shorter.");
  const reader = request.body?.getReader();
  if (!reader) return magicError("INVALID", 400, "Please check your words and try again.");
  try {
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return magicError("TOO_LARGE", 413, "Please keep your message a little shorter."); }
      chunks.push(value);
    }
    const input = validateMagic(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!input) return magicError("INVALID", 400, "Use plain words without links or contact details, and choose public sharing before submitting.");
    if (input.action !== "draw" && !enabled) return magicError("UNAVAILABLE", 503, "Sharing is resting for now. You can still keep your words privately.");
    const result = await perform(input);
    if (result.status === "rate_limited") return magicError("RATE_LIMITED", 429, "A little pause, then try again in a minute.");
    if (result.status === "conflict") return magicError("CONFLICT", 409, "This request could not be matched. Your words are still here.");
    if (result.status === "not_found") return magicError("NOT_FOUND", 404, "This message is no longer available.");
    if (result.status === "full") return magicError("UNAVAILABLE", 503, "The review basket is full. Keep your words and try another day.");
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return magicError(error instanceof SyntaxError ? "INVALID" : "UNAVAILABLE", error instanceof SyntaxError ? 400 : 503, "The shop could not confirm that request. Keep your words and try again.");
  }
}
