import type { CSSProperties } from "react";
import Image from "next/image";
import { art } from "@/content/art";
import { oceanProgress, sharedLightCount, sharedStars } from "@/lib/ocean/visual";
import ContributionEffects from "./contribution-effects";
import type { OceanPhase } from "./use-contribution";

export default function OceanScene({ count, phase, reducedMotion, onLanding, onComplete }: {
  count: number | null; phase: OceanPhase; reducedMotion: boolean; onLanding: () => void; onComplete: () => void;
}) {
  const progress = oceanProgress(count ?? 0);
  const density = sharedLightCount(count ?? 0);
  return <div className="ocean-scene ocean-preview" data-phase={phase} data-reacting={phase === "joining" || phase === "success"} data-reduced-motion={reducedMotion} style={{ "--ocean-progress": progress, "--ocean-glow": .06 + progress * .39, "--horizon-glow": .1 + progress * .6, "--cloud-light": .3 + progress * .5, "--whale-mask": `url("${art["ocean.whale"].src}")` } as CSSProperties} aria-hidden="true">
    <div className="ocean-nebula" data-layer="nebula-haze" />
    <svg viewBox="0 0 1000 1000" className="ocean-stars ocean-far-stars" preserveAspectRatio="none" data-layer="far-stars">
      {sharedStars.slice(0, 32).map((star, i) => <path key={i} d={`M${star.x * 1000} ${star.y * 900}h0`} stroke="#e8dcfa" strokeWidth=".9" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".4" />)}
    </svg>
    <Image src={art["ocean.moon"].src} width={180} height={180} alt="" unoptimized loading="eager" className="ocean-layer ocean-moon" data-layer="moon" />
    <Image src={art["ocean.cloudLeft"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-left" data-layer="cloud-back-left" />
    <Image src={art["ocean.cloudRight"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-right" data-layer="cloud-back-right" />
    <svg viewBox="0 0 1000 1000" className="ocean-stars ocean-shared-stars" preserveAspectRatio="none" data-layer="shared-light-field">
      {sharedStars.slice(0, density).map((star, i) => <path className="ocean-contribution-light" key={i} d={`M${star.x * 1000} ${star.y * 1000}h0`} stroke={i % 7 ? "#d8b4ff" : "#ffe8d1"} strokeWidth={star.radius * 1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={.35 + progress * .5} style={{ animationDelay: `${i % 13 * -.7}s` }} />)}
    </svg>
    <div className="ocean-whale" data-layer="whale-constellation" style={{ opacity: .04 + progress * .78 }}>
      <Image src={art["ocean.whale"].src} width={900} height={450} alt="" unoptimized loading="eager" />
      <div className="ocean-whale-shimmer" />
    </div>
    <div className="ocean-horizon-glow" data-layer="horizon-glow" />
    <Image src={art["ocean.stage"].src} width={1200} height={400} alt="" unoptimized loading="eager" className="ocean-layer ocean-stage" data-layer="distant-stage" />
    <Image src={art["ocean.crowd"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-layer ocean-crowd" data-layer="seven-back-figures" />
    <Image src={art["ocean.cloudForeground"].src} width={1200} height={400} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-foreground" data-layer="foreground-clouds" />
    <ContributionEffects phase={phase} reducedMotion={reducedMotion} onLanding={onLanding} onComplete={onComplete} />
  </div>;
}
