import { handleContribution } from "@/lib/ocean/http";
import { contribute } from "@/lib/server/ocean";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return handleContribution(request, process.env.OCEAN_WRITE_ENABLED === "true", contribute);
}
