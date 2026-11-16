"use client";
import Link from "next/link";
export default function MagicEntryLink() {
  return <Link className="button" href="/magic-shop" onClick={() => { try { sessionStorage.setItem("boraverse-magic-entered-v1", "1"); } catch {} }}>Explore this little corner</Link>;
}
