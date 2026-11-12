export type Keepsake = { id: string; title: string; text: string };
const key = "boraverse-keepsakes-v1";
export function readKeepsakes(): Keepsake[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((item) => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.text === "string")) throw new Error("Invalid keepsakes");
  return data;
}
export function saveKeepsake(title: string, text: string) {
  const items = readKeepsakes();
  localStorage.setItem(key, JSON.stringify([{ id: crypto.randomUUID(), title, text }, ...items]));
}
