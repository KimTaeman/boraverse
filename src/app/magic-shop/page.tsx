import Link from "next/link";
import type { CSSProperties } from "react";
import Shop from "@/components/magic/shop";
import { art } from "@/content/art";
import "@/components/magic/shop.css";
export const metadata = { title: "Magic Shop" };
export default function MagicShop() {
  return <section className="magic-page" style={{ "--magic-sky": `url("${art["magic.sky"].src}")`, "--magic-interior": `url("${art["magic.interior"].src}")` } as CSSProperties}><div className="requires-js"><Shop /></div><noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><div className="no-js"><h1>Magic Shop</h1><p>JavaScript is needed to use letters and fortunes. You can still explore the village.</p><Link href="/">Back to the village</Link></div></section>;
}
