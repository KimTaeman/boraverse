import type { CSSProperties } from "react";
import Image from "next/image";
import { art } from "@/content/art";

const stars = Array.from({ length: 120 }, (_, i) => ({ x: 5 + (i * 137) % 990, y: 190 + (i * 73) % 550, r: i % 9 === 0 ? 2.6 : 1.1 }));

export default function OceanScene({ count, accepted, pending }: { count: number | null; accepted: boolean; pending: boolean }) {
  const density = count === null ? 0 : Math.min(120, count);
  const glow = density / 120;
  return <div className="ocean-scene ocean-preview" data-state={accepted ? "accepted" : pending ? "pending" : "quiet"} style={{ "--ocean-glow": glow } as CSSProperties} aria-hidden="true">
    <Image src={art["ocean.moon"].src} width={art["ocean.moon"].width} height={art["ocean.moon"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-moon" data-layer="moon" />
    <Image src={art["ocean.cloudLeft"].src} width={art["ocean.cloudLeft"].width} height={art["ocean.cloudLeft"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-left" data-layer="cloud-left" />
    <Image src={art["ocean.cloudRight"].src} width={art["ocean.cloudRight"].width} height={art["ocean.cloudRight"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-right" data-layer="cloud-right" />
    <Image src={art["ocean.stage"].src} width={art["ocean.stage"].width} height={art["ocean.stage"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-stage" data-layer="distant-stage" />
    <svg viewBox="0 0 900 450" className="ocean-whale" data-layer="whale" opacity={density === 0 ? 0 : .35 + glow * .65}>
      <image href={art["ocean.whale"].src} width="900" height="450" />
    </svg>
    <Image src={art["ocean.crowd"].src} width={art["ocean.crowd"].width} height={art["ocean.crowd"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-crowd" data-layer="crowd" />
    <Image src={art["ocean.cloudForeground"].src} width={art["ocean.cloudForeground"].width} height={art["ocean.cloudForeground"].height} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-foreground" data-layer="foreground-clouds" />
    <svg viewBox="0 0 1000 1000" className="ocean-stars" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ocean-trail"><stop stopColor="#bd91f5" stopOpacity="0" /><stop offset=".65" stopColor="#dca9ff" /><stop offset="1" stopColor="#fff0db" /></linearGradient>
        <radialGradient id="horizon-light"><stop stopColor="#bc86eb" stopOpacity=".4" /><stop offset="1" stopColor="#8c5bd0" stopOpacity="0" /></radialGradient>
      </defs>
      <g data-layer="distant-sky" fill="#ded0ff" opacity=".38">{stars.slice(0, 48).map((star, i) => <path key={i} d={`M${star.x} ${star.y}h0`} stroke="#ded0ff" strokeWidth={star.r * .7} strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}</g>
      <g data-layer="collective-lights" opacity={glow}>
        <path d="M280 680 C430 700 350 553 490 501 S720 445 676 318" stroke="#bc8bf1" strokeWidth="80" opacity=".1" fill="none" style={{ filter: "blur(18px)" }} />
        <path d="M280 680 C430 700 350 553 490 501 S720 445 676 318" stroke="#d7b0ff" strokeWidth="1" strokeDasharray="1 12" fill="none" />
      </g>
      <g data-layer="contribution-stars" fill="#ffe5f9">{stars.slice(0, density).map((star, i) => <path className="ocean-contribution-light" key={i} d={`M${star.x} ${star.y}h0`} stroke="#ffe5f9" strokeWidth={star.r * 1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={.45 + (i % 5) * .12} />)}</g>
      <ellipse data-layer="horizon-glow" cx="500" cy="650" rx="650" ry="230" fill="url(#horizon-light)" />
      <g data-layer="your-light" className={accepted ? "new-light" : pending ? "pending-light" : "waiting-light"}>
        <path className="your-light-trail" d="M533 570 Q440 500 555 450" fill="none" stroke="url(#ocean-trail)" strokeWidth="2" strokeDasharray="2 6" />
        <path d={accepted ? "M555 450h0" : "M533 570h0"} stroke="#ffe7ff" strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="your-light-orb" />
        {accepted && <image href={art["ocean.light"].src} x="507" y="418" width="96" height="64" />}
      </g>
    </svg>
  </div>;
}
