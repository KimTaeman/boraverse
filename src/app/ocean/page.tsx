import Link from "next/link";
import { art } from "@/content/art";
export default function Ocean() {
  return <section className="ocean-page">
    <Link className="back-link" href="/">← Back to the village</Link>
    <p className="eyebrow">A LITTLE LIGHT, TOGETHER</p>
    <h1>Our Little Purple Ocean</h1>
    <p>One little light. One beautiful memory.</p>
    <div className="ocean-scene" aria-hidden="true" style={{ backgroundImage: `url("${art["ocean.sky"].src}")` }}><span>✧ &nbsp; ✦ &nbsp; ✧</span></div>
    <div className="ocean-notice"><h2>Something lovely is on its way</h2><p>Our shared ocean is still being prepared. For now, take a little moment by the water and explore the village.</p><Link className="button" href="/">Back to the village</Link></div>
  </section>;
}
