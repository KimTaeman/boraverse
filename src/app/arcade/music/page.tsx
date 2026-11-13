import Link from "next/link";
import Music from "@/components/arcade/music";
export const metadata = { title: "Let a song find you" };

export default function MusicPage() { return <><Link className="back-link" href="/arcade">← Back to the arcade</Link><h1>Let a song find you</h1><div className="requires-js"><Music /></div><noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">JavaScript is needed to use the song picker. You can still explore the village.</p></>; }
