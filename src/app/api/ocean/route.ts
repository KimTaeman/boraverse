import { getOcean } from "@/lib/server/ocean";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ ...await getOcean(), writesEnabled: process.env.OCEAN_WRITE_ENABLED === "true" }, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=15" } });
  } catch {
    return Response.json({ status: "error", code: "UNAVAILABLE", message: "The ocean is resting. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
