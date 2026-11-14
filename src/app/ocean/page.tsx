import Link from "next/link";
import { art } from "@/content/art";
import OceanExperience from "@/components/ocean/experience";
export const metadata = { title: "Our Little Purple Ocean" };

export default function Ocean() {
  return <section className="ocean-page">
    <Link className="back-link" href="/">← Back to the village</Link>
    <div className="ocean-observatory" style={{ backgroundImage: `url("${art["ocean.sky"].src}")` }}>
    <div className="ocean-intro"><p className="eyebrow">BANGKOK 2026 · A SHARED SKY</p>
    <h1>Our Little <em>Purple Ocean</em></h1>
    <p>One little light. One beautiful memory.</p></div>
    <div className="requires-js"><OceanExperience /></div>
    <noscript><style>{".requires-js{display:none}.no-js{display:block}"}</style></noscript><p className="no-js">Adding a light needs JavaScript. You can still explore the village.</p>
    </div>
    <p className="ocean-art-note">A little world in the making · original placeholder illustration</p>
  </section>;
}
