import type { OceanAdapter, OceanResult } from "./mock";

export async function attemptPreview(adapter: OceanAdapter, key: { current: string | null }, makeKey: () => string): Promise<OceanResult | "failed"> {
  key.current ??= makeKey();
  try {
    const result = await adapter.contribute(key.current);
    key.current = null;
    return result;
  } catch {
    return "failed";
  }
}
