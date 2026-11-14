"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import OceanScene from "./scene";
import useContribution, { type OceanPhase } from "./use-contribution";
import { art } from "@/content/art";
import { oceanProgress } from "@/lib/ocean/visual";

const lights = Array.from({ length: 42 }, (_, i) => ({ cx: 5 + ((i * 37) % 90), cy: 8 + ((i * 23) % 62), r: i % 7 === 0 ? 1 : 0.5 }));

export default function OceanExperience() {
  const { phase, count, writesEnabled, slow, remembered, reducedMotion, contribute, land, finish } = useContribution();
  const [image, setImage] = useState<string | null>(null);
  const [exportError, setExportError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);

  async function makeSouvenir() {
    if (exporting) return;
    setExportError(false);
    setExporting(true);
    try {
      const layers = await Promise.all([
        "ocean.sky", "ocean.moon", "ocean.cloudLeft", "ocean.cloudRight",
        "ocean.whale", "ocean.stage", "ocean.cloudForeground", "ocean.crowd",
      ].map(key => new Promise<HTMLImageElement>((resolve, reject) => {
        const layer = new Image();
        layer.onload = () => resolve(layer);
        layer.onerror = () => reject(new Error("Artwork unavailable"));
        layer.src = art[key as keyof typeof art].src;
      })));
      if (!active.current) return;
      const [sky, moon, left, right, whale, stage, foreground, crowd] = layers;
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#17142b"; ctx.fillRect(0, 0, 1080, 1920);
      ctx.drawImage(sky, 0, 0, 1080, 1920);
      ctx.drawImage(moon, 810, 310, 160, 160);
      ctx.globalAlpha = .65;
      ctx.drawImage(left, -300, 680, 760, 380);
      ctx.drawImage(right, 650, 780, 760, 380);
      ctx.globalAlpha = 1;
      ctx.globalAlpha = .45 + oceanProgress(count ?? 0) * .4;
      ctx.drawImage(whale, 100, 490, 880, 440);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffe5f9";
      for (const light of lights.slice(0, Math.ceil(oceanProgress(count ?? 0) * lights.length))) {
        ctx.beginPath(); ctx.arc(light.cx * 10.8, 470 + light.cy * 12, light.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.drawImage(stage, 0, 1000, 1080, 360);
      ctx.globalAlpha = .6; ctx.drawImage(foreground, -108, 1120, 1296, 432); ctx.globalAlpha = 1;
      ctx.drawImage(crowd, 0, 1100, 1080, 540);
      const shade = ctx.createLinearGradient(0, 1460, 0, 1640);
      shade.addColorStop(0, "#17142b00"); shade.addColorStop(1, "#17142b");
      ctx.fillStyle = shade; ctx.fillRect(0, 1460, 1080, 460);
      ctx.textAlign = "center"; ctx.fillStyle = "#fff5e9";
      ctx.font = "32px sans-serif"; ctx.fillText("A LITTLE LIGHT, TOGETHER", 540, 160);
      ctx.font = "72px Georgia"; ctx.fillText("Our Little Purple Ocean", 540, 270);
      ctx.font = "34px sans-serif"; ctx.fillText("One little light. One beautiful memory.", 540, 360);
      ctx.font = "36px Georgia"; ctx.fillText("My light is part of our shared sky.", 540, 1680);
      ctx.font = "28px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1780);
      ctx.font = "24px sans-serif"; ctx.fillText("Illustration placeholders", 540, 1830);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error("Export unavailable")), "image/png"));
      if (active.current) setImage(URL.createObjectURL(blob));
    } catch { if (active.current) setExportError(true); }
    finally { if (active.current) setExporting(false); }
  }

  const complete = phase === "success" || phase === "already_contributed";
  const busy = phase === "preparing" || phase === "travelling" || phase === "joining";
  const message: Record<OceanPhase, string> = {
    booting: "Checking whether the ocean is ready for little lights…",
    ready: remembered ? "This browser remembers adding a light. Check it with the ocean or keep exploring." : count === 0 ? "It’s quiet here. Will you add the first little light?" : "Will you add yours to our sky?",
    preparing: slow ? "Your light is still getting ready. A slow connection can take a little longer…" : "Getting your light ready…",
    travelling: "Your little light is on its way…",
    joining: "Your little light is on its way…",
    success: "Your light has joined the ocean. ♡",
    already_contributed: "Your light is already part of the ocean.",
    failed: "Your light wasn't confirmed. Please try again.",
    unavailable: "The ocean is taking a little rest. Your light wasn't confirmed. You can still explore the village and try again later.",
    offline: "You're offline. Reconnect and try again.",
    rate_limited: "The sky needs a tiny pause. Please try again shortly.",
    view_only: "The ocean is taking a little rest. You can still enjoy the sky and explore the village.",
  };
  return <>
    <OceanScene count={count} phase={phase} reducedMotion={reducedMotion} onLanding={land} onComplete={finish} />
    <div className="ocean-action" data-phase={phase}>
      <p className="ocean-counter">{count === null ? <span className={phase === "booting" ? "ocean-count-loading" : undefined}>{phase === "booting" ? "Gathering the little lights…" : "The shared light count is unavailable right now."}</span> : <><strong key={count}>{count.toLocaleString()}</strong>{" "}<span>confirmed little lights</span></>}</p>
      <p className="ocean-status" role="status" aria-live="polite" aria-atomic="true">{message[phase]}</p>
      {!complete && writesEnabled !== false && <button className="button" type="button" disabled={writesEnabled !== true || busy || phase === "rate_limited"} onClick={contribute}>{phase === "preparing" ? "Sending…" : phase === "travelling" || phase === "joining" ? "Your light is on its way…" : phase === "rate_limited" ? "Please wait…" : phase === "failed" || phase === "offline" || phase === "unavailable" ? "Try again" : remembered ? "Check my light" : "Add my little light"}</button>}
      {complete && <div className="ocean-souvenir"><button className="button" type="button" onClick={makeSouvenir} disabled={exporting}>{exporting ? "Creating your keepsake…" : "Save my moment"}</button>{image && <p><a href={image} download="boraverse-ocean.png">Download keepsake</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save it manually</p>}{exportError && <p role="alert">The image couldn’t be created. Check your connection and try again, or use another browser.</p>}</div>}
      <p className="ocean-fine-print">One shared sky. One light per browser.<br />Lights represent contributions, not verified unique people.</p>
      {(phase === "travelling" || phase === "joining") && <button type="button" className="ocean-skip" onClick={finish}>Skip animation</button>}
      <Link className="ocean-explore" href="/arcade">Keep exploring <span aria-hidden="true">↗</span></Link>
    </div>
  </>;
}
