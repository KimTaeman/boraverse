"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <><h1>A little pause</h1><p>Something went wrong. Please try again or visit the village.</p><button className="button" onClick={reset}>Try again</button>{" "}<Link href="/">Back to the village</Link></>;
}
