import Link from "next/link";
import KeepsakeList from "@/components/keepsakes/list";
export default function Keepsakes() { return <><h1>My Keepsakes</h1><div className="requires-js"><KeepsakeList /></div><noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">JavaScript is needed to use your keepsakes. You can still explore the village.</p><p><Link href="/">Back to the village</Link></p></>; }
