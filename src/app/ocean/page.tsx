import Link from "next/link";
import OceanExperience from "@/components/ocean/experience";
export default function Ocean() {
  return <section className="ocean-page">
    <Link className="back-link" href="/">← Back to the village</Link>
    <p className="eyebrow">A LITTLE LIGHT, TOGETHER</p>
    <h1>Our Little Purple Ocean</h1>
    <p>One little light. One beautiful memory.</p>
    <OceanExperience />
    <noscript><p>Adding a light needs JavaScript. You can still explore the village.</p></noscript>
  </section>;
}
