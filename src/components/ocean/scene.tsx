import type { CSSProperties } from "react";
import { art } from "@/content/art";

const stars = Array.from({ length: 120 }, (_, i) => ({ x: 195 + (i * 137) % 610, y: 90 + (i * 73) % 390, r: i % 9 === 0 ? 2.6 : 1.1 }));

export default function OceanScene({ count, accepted, pending }: { count: number | null; accepted: boolean; pending: boolean }) {
  const density = count === null ? 0 : Math.min(120, count);
  const glow = density / 120;
  return <div className="ocean-scene ocean-preview" data-state={accepted ? "accepted" : pending ? "pending" : "quiet"} style={{ "--ocean-glow": glow } as CSSProperties} aria-hidden="true">
    <svg viewBox="0 0 1000 700" className="ocean-stars" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="ocean-trail"><stop stopColor="#bd91f5" stopOpacity="0" /><stop offset=".65" stopColor="#dca9ff" /><stop offset="1" stopColor="#fff0db" /></linearGradient>
        <radialGradient id="horizon-light"><stop stopColor="#bc86eb" stopOpacity=".5" /><stop offset="1" stopColor="#8c5bd0" stopOpacity="0" /></radialGradient>
      </defs>
      <g data-layer="distant-sky" fill="#ded0ff" opacity=".38">{stars.slice(0, 48).map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r * .45} />)}</g>
      <image data-layer="moon" href={art["ocean.moon"].src} x="750" y="35" width="130" height="130" className="ocean-moon" />
      <g data-layer="clouds" opacity=".55"><image href={art["ocean.cloudLeft"].src} x="-230" y="250" width="600" height="300" /><image href={art["ocean.cloudRight"].src} x="630" y="270" width="600" height="300" /></g>
      <g data-layer="collective-lights" opacity={glow}>
        <path d="M280 555 C430 570 350 453 490 401 S720 345 676 218" stroke="#bc8bf1" strokeWidth="80" opacity=".1" fill="none" />
        <path d="M280 555 C430 570 350 453 490 401 S720 345 676 218" stroke="#d7b0ff" strokeWidth="1" strokeDasharray="1 12" fill="none" />
      </g>
      <g data-layer="whale" className="ocean-whale" opacity={density === 0 ? 0 : .35 + glow * .65}>
        <image href={art["ocean.whale"].src} x="170" y="130" width="660" height="330" />
      </g>
      <g data-layer="contribution-stars" fill="#ffe5f9">{stars.slice(0, density).map((star, i) => <circle className="ocean-contribution-light" key={i} cx={star.x} cy={star.y} r={star.r} opacity={.45 + (i % 5) * .12} />)}</g>
      <ellipse data-layer="horizon-glow" cx="500" cy="580" rx="380" ry="170" fill="url(#horizon-light)" />

      <image data-layer="distant-stage" href={art["ocean.stage"].src} x="-300" y="110" width="1600" height="533" />
      <image data-layer="foreground-clouds" href={art["ocean.cloudForeground"].src} x="-250" y="440" width="1500" height="500" opacity=".55" />
      <image data-layer="crowd" href={art["ocean.crowd"].src} x="200" y="480" width="600" height="300" />
      <g data-layer="your-light" className={accepted ? "new-light" : pending ? "pending-light" : "waiting-light"}>
        <path className="your-light-trail" d="M533 560 Q440 470 555 378" fill="none" stroke="url(#ocean-trail)" strokeWidth="2" strokeDasharray="2 6" />
        <circle cx={accepted ? 555 : 533} cy={accepted ? 378 : 560} r="7" fill="#ffe7ff" className="your-light-orb" />
        {accepted && <image href={art["ocean.light"].src} x="507" y="346" width="96" height="64" />}
      </g>
    </svg>
    <span className="ocean-scene-caption">{density === 0 ? "A quiet sky, waiting for our little lights." : "A little brighter, because we’re here together."}</span>
  </div>;
}
