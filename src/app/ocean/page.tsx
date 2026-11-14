import Link from "next/link";
import type { Viewport } from "next";
import type { CSSProperties } from "react";
import { art } from "@/content/art";
import OceanExperience from "@/components/ocean/experience";
export const metadata = { title: "Our Little Purple Ocean" };
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0d0923" };

export default function Ocean() {
  return <section className="ocean-page">
    <div className="ocean-observatory" style={{ "--ocean-sky-mobile": `url("${art["ocean.sky"].src}")`, "--ocean-sky-desktop": `url("${art["ocean.skyDesktop"].src}")` } as CSSProperties}>
      <div className="ocean-topbar"><Link className="back-link" href="/">← Back to the village</Link><span>The Little Boraverse</span></div>
      <div className="ocean-intro"><p className="eyebrow">BANGKOK 2026 · A SHARED SKY</p>
        <h1>Our Little <em>Purple Ocean</em></h1>
        <p>One little light. One beautiful memory.</p>
      </div>
      <div className="requires-js"><OceanExperience /></div>
      <noscript><style>{".ocean-observatory > .requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">Adding a light needs JavaScript. You can still explore the village.</p>
      <aside className="ocean-credits" aria-label="About this fan project">
        <p>Unofficial ARMY-made fan project. Not affiliated with BTS, BIGHIT MUSIC, HYBE, or the venue.</p>
        <p>AI-generated illustration draft · <Link href="/about">About</Link> · <Link href="/privacy">Privacy</Link></p>
      </aside>
    </div>
  </section>;
}
