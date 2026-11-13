import Link from "next/link";
import Shop from "@/components/magic/shop";
export const metadata = { title: "Magic Shop" };

export default function MagicShop() { return <><h1>Magic Shop</h1><div className="requires-js"><Shop /></div><noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">JavaScript is needed to use letters and fortunes. You can still explore the village.</p><Link href="/">Back to the village</Link></>; }
