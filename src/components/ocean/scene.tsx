import type { CSSProperties } from "react";
import Image from "next/image";
import { art } from "@/content/art";
import { oceanAppearance, oceanProgress, sharedLightCount, sharedStars, seeded } from "@/lib/ocean/visual";
import ContributionEffects from "./contribution-effects";
import type { OceanPhase } from "./use-contribution";

const whaleDust = Array.from({ length: 56 }, (_, i) => ({ x: 90 + seeded(i + 900) * 720, y: 110 + seeded(i + 1200) * 235, radius: .6 + seeded(i + 1500) * 1.7 }));

export default function OceanScene({ count, phase, reducedMotion, onLanding, onComplete }: {
  count: number | null; phase: OceanPhase; reducedMotion: boolean; onLanding: () => void; onComplete: () => void;
}) {
  const look = oceanAppearance(count ?? 0);
  const density = sharedLightCount(count ?? 0);
  return <div className="ocean-scene ocean-preview" data-phase={phase} data-reacting={phase === "joining" || phase === "success"} data-reduced-motion={reducedMotion} style={{
    "--ocean-progress": oceanProgress(count ?? 0), "--ocean-glow": look.haze, "--horizon-glow": look.horizon,
    "--cloud-light": look.clouds, "--whale-line": look.whaleLine, "--whale-fill": look.whaleFill,
    "--rim-light": look.rim, "--whale-glow": `${2 + look.whaleLine * 20}px`,
    "--whale-mask": `url("${art["ocean.whale"].src}")`, "--whale-body-mask": `url("${art["ocean.whaleBody"].src}")`,
  } as CSSProperties} aria-hidden="true">
    <div className="ocean-nebula" data-layer="nebula-haze" />
    <svg viewBox="0 0 1000 1000" className="ocean-stars ocean-far-stars" preserveAspectRatio="none" data-layer="far-stars">
      {sharedStars.slice(0, 12).map((star, i) => <path key={i} d={`M${star.x * 1000} ${star.y * 900}h0`} stroke="#e8dcfa" strokeWidth=".9" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".35" />)}
    </svg>
    <Image src={art["ocean.moon"].src} width={180} height={180} alt="" unoptimized loading="eager" className="ocean-layer ocean-moon" data-layer="moon" />
    <svg viewBox="0 0 1000 1000" className="ocean-stars ocean-shared-stars" preserveAspectRatio="none" data-layer="shared-light-field">
      {sharedStars.slice(0, density).map((star, i) => <path className="ocean-contribution-light" key={i} d={`M${star.x * 1000} ${star.y * 1000}h0`} stroke={i % 7 ? "#d8b4ff" : "#ffe8d1"} strokeWidth={star.radius * (1 + look.whaleLine)} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={.4 + look.whaleLine * .5} style={{ animationDelay: `${i % 13 * -.7}s` }} />)}
      {sharedStars.slice(0, Math.round(look.ambient)).map((star, i) => <path className="ocean-ambient-dust" key={i} d={`M${(1 - star.x) * 1000} ${250 + star.y * 600}h0`} stroke="#d7b2f9" strokeWidth={.5 + star.radius * .45} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".6" style={{ animationDelay: `${i % 11 * -.9}s` }} />)}
    </svg>
    <div className="ocean-artwork">
      <Image src={art["ocean.cloudLeft"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-left" data-layer="cloud-back-left" />
      <Image src={art["ocean.cloudRight"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-right" data-layer="cloud-back-right" />
      <div className="ocean-whale" data-layer="whale-constellation">
        <div className="ocean-whale-fill" data-layer="whale-stardust">
          <svg viewBox="0 0 900 450">{whaleDust.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.radius} fill={i % 5 ? "#e4c2ff" : "#fff0dd"} />)}</svg>
        </div>
        <Image src={art["ocean.whale"].src} width={900} height={450} alt="" unoptimized loading="eager" className="ocean-whale-lines" />
        <div className="ocean-whale-shimmer" />
        <span className="ocean-landing-glint" />
      </div>
      <div className="ocean-horizon-glow" data-layer="horizon-glow" />
      <Image src={art["ocean.stage"].src} width={1200} height={400} alt="" unoptimized loading="eager" className="ocean-layer ocean-stage" data-layer="distant-stage" />
      <div className="ocean-crowd" data-layer="seven-back-figures"><Image src={art["ocean.crowd"].src} width={900} height={450} alt="" unoptimized loading="eager" /></div>
      <Image src={art["ocean.cloudForeground"].src} width={1200} height={400} alt="" unoptimized loading="eager" className="ocean-layer ocean-cloud-foreground" data-layer="foreground-clouds" />
    </div>
    <ContributionEffects phase={phase} reducedMotion={reducedMotion} onLanding={onLanding} onComplete={onComplete} />
  </div>;
}
