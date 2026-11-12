export type FreebieFamily = "pokemon" | "tarot" | "license" | "meme" | "quote" | "invitation" | "banknote" | "receipt";
type Destination = "/" | "/arcade" | "/magic-shop" | "/ocean";
type Family = { destination: Destination; variants: readonly { id: string; title: string; message: string; approved: boolean }[] };

// Proposed examples only. No variant is approved for printing or public reveal.
const placeholder = () => [{ id: "01", title: "A little surprise", message: "A little moment made for you.", approved: false }];
export const freebies: Record<FreebieFamily, Family> = {
  pokemon: { destination: "/arcade", variants: placeholder() },
  tarot: { destination: "/magic-shop", variants: placeholder() },
  license: { destination: "/arcade", variants: placeholder() },
  meme: { destination: "/arcade", variants: placeholder() },
  quote: { destination: "/magic-shop", variants: placeholder() },
  invitation: { destination: "/", variants: placeholder() },
  banknote: { destination: "/arcade", variants: placeholder() },
  receipt: { destination: "/ocean", variants: placeholder() },
};

export function approvedFreebie(family: string, variant: string) {
  if (!Object.hasOwn(freebies, family)) return null;
  const entry = freebies[family as FreebieFamily];
  const item = entry.variants.find((item) => item.id === variant && item.approved);
  return item ? { ...item, destination: entry.destination } : null;
}
