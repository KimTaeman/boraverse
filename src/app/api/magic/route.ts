import { getLetters, magicAction } from "@/lib/server/magic";
import { handleMagic, magicError } from "@/lib/magic/http";
import { isUuid } from "@/lib/magic/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor");
  if ([...params.keys()].some(key => key !== "cursor") || (cursor && !isUuid(cursor))) return magicError("INVALID", 400, "Please reopen the letter collection.");
  try {
    return Response.json({ status: "ok", ...await getLetters(cursor || undefined), writesEnabled: process.env.MAGIC_WRITE_ENABLED === "true" }, { headers: { "Cache-Control": "no-store" } });
  } catch { return magicError("UNAVAILABLE", 503, "The shared collection is resting. You can still explore the shop."); }
}
export async function POST(request: Request) { return handleMagic(request, process.env.MAGIC_WRITE_ENABLED === "true", magicAction); }
