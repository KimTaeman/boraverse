import Link from "next/link";
import Gacha from "@/components/arcade/gacha";
export const metadata = { title: "Little Surprise Gacha" };

export default function GachaPage() { return <><Link className="back-link" href="/arcade">← Back to the arcade</Link><h1>Little Surprise Gacha</h1><div className="requires-js"><Gacha /></div><noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">JavaScript is needed to use the gacha. You can still explore the village.</p></>; }
