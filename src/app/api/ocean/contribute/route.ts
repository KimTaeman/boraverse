import { validateContribution } from "@/lib/ocean/validation";
import { contribute } from "@/lib/server/ocean";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
function error(code: string, message: string, status: number, extra?: Record<string, string>) {
  return Response.json({ status: "error", code, message }, { status, headers: { ...headers, ...extra } });
}

export async function POST(request: Request) {
  if (process.env.OCEAN_WRITE_ENABLED !== "true") return error("UNAVAILABLE", "The ocean is resting. Please try again later.", 503);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return error("INVALID", "Please check your request.", 400);
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > 1024)) return error("TOO_LARGE", "Please check your request.", 413);
  const reader = request.body?.getReader();
  if (!reader) return error("INVALID", "Please check your request.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); return error("TOO_LARGE", "Please check your request.", 413); }
      chunks.push(value);
    }
    const body = validateContribution(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!body) return error("INVALID", "Please check your request.", 400);
    const result = await contribute(body);
    if (result.status === "rate_limited") return error("RATE_LIMITED", "Please try again a little later.", 429, { "Retry-After": "60" });
    if (result.status === "conflict") return error("CONFLICT", "Please start a new request.", 409);
    return Response.json(result, { status: result.status === "accepted" ? 201 : 200, headers });
  } catch (e) {
    if (e instanceof SyntaxError) return error("INVALID", "Please check your request.", 400);
    return error("UNAVAILABLE", "The ocean is resting. Please try again later.", 503);
  }
}
