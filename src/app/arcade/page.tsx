import Link from "next/link";
export const metadata = { title: "Bangtan Arcade" };

export default function Arcade() { return <><h1>Bangtan Arcade</h1><p>A little space for playful discoveries.</p><Link className="button" href="/arcade/gacha">Try the surprise gacha</Link><p><Link className="button" href="/arcade/music">Find a song</Link></p><p><Link href="/">Back to the village</Link></p></>; }
