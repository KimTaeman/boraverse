import Link from "next/link";
import MagicEntryLink from "@/components/magic/entry-link";
import { ComingSoon } from "@/components/shell";
import { approvedFreebie } from "@/content/freebies";

export const metadata = { title: "A little surprise" };

export default async function Card({ params }: { params: Promise<{ family: string; variant: string }> }) {
  const { family, variant } = await params;
  const card = approvedFreebie(family, variant);
  if (!card) return <ComingSoon title="A little surprise" description="This surprise is not ready to open yet. You can still explore the village." />;
  return <><p className="eyebrow">A LITTLE SURPRISE FOR YOU</p><h1>{card.title}</h1><p>{card.message}</p>{card.destination === "/magic-shop" ? <MagicEntryLink /> : <Link className="button" href={card.destination}>Explore this little corner</Link>}<p><Link href="/">Visit the village</Link></p></>;
}
