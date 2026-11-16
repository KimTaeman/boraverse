export type FreebieFamily = "pokemon" | "tarot" | "license" | "meme" | "quote" | "invitation" | "banknote" | "receipt";
type Destination = "/" | "/arcade" | "/magic-shop" | "/ocean";
type Family = { destination: Destination; variants: readonly { id: string; title: string; message: string; approved: boolean }[] };

// D015 approves these eight website previews; final artwork and printing remain unapproved.
const reviewed = (title: string, message: string) => [{ id: "01", title, message, approved: true }];
export const freebies: Record<FreebieFamily, Family> = {
  pokemon: { destination: "/arcade", variants: reviewed("A tiny companion for a big night", "Every great adventure needs a little sidekick. Meet a pocket-sized surprise in the arcade.") },
  tarot: { destination: "/magic-shop", variants: reviewed("The Little Lantern", "A small brave step can light the way. Visit the Magic Shop for a playful fortune, just for fun.") },
  license: { destination: "/arcade", variants: reviewed("Licensed to make little memories", "Permission to laugh too loudly, treasure small moments, and enjoy the arcade. A playful keepsake, not an official credential.") },
  meme: { destination: "/arcade", variants: reviewed("My serious plans have left the chat", "Today's agenda: find a little joy, collect a silly surprise, and call it a productive day.") },
  quote: { destination: "/magic-shop", variants: reviewed("A little kindness, folded for you", "You do not have to shine at full brightness every day. There is a quiet corner waiting for you in the Magic Shop.") },
  invitation: { destination: "/", variants: reviewed("You found our little universe", "Come in, take a breath, and wander at your own pace. There is a little magic here for you.") },
  banknote: { destination: "/arcade", variants: reviewed("One pocketful of possibility", "This pretend note has no cash value. The little surprises in our arcade are free, and your curiosity is all you need.") },
  receipt: { destination: "/ocean", variants: reviewed("A receipt for a little togetherness", "One shared sky. A memory to carry home. Visit our Purple Ocean and see the lights we are making together.") },
};

export function approvedFreebie(family: string, variant: string) {
  if (!Object.hasOwn(freebies, family)) return null;
  const entry = freebies[family as FreebieFamily];
  const item = entry.variants.find((item) => item.id === variant && item.approved);
  return item ? { ...item, destination: entry.destination } : null;
}
