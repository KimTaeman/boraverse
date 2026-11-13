import Link from "next/link";
export const metadata = { title: "Privacy" };

export default function Privacy() { return <><h1>Privacy</h1><p>The Little Boraverse does not ask for an account or your name. If you try to add a light, your browser stores an anonymous token and a request key so it can safely retry. Clearing browser storage removes them and may allow another contribution.</p><p>The server uses a hash of that token to prevent repeated contributions and keeps short-lived rate-limit records. Hosting and database providers may process technical request information. The shared Ocean may be unavailable while it is being prepared.</p><Link href="/">← Back to the village</Link></>; }
