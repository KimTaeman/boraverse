import Link from "next/link";
import OceanPreview from "@/components/ocean/experience";
export default function Ocean() {
  return <section className="ocean-page">
    <Link className="back-link" href="/">← Back to the village</Link>
    <p className="eyebrow">A LITTLE LIGHT, TOGETHER</p>
    <h1>Our Little Purple Ocean</h1>
    <p>One little light. One beautiful memory.</p>
    <p>The shared ocean is still being prepared. Explore a preview of what’s coming.</p>
    <OceanPreview />
    <noscript><p>This preview needs JavaScript. You can still explore the village.</p></noscript>
  </section>;
}
