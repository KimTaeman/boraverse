"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createMockOcean, type OceanAdapter } from "./mock";
import { attemptPreview } from "./attempt";

const subscribe = () => () => {};

type Status = "ready" | "pending" | "accepted" | "already_contributed" | "failed" | "offline" | "read_only";
const lights = Array.from({ length: 42 }, (_, i) => ({
  cx: 5 + ((i * 37) % 90),
  cy: 8 + ((i * 23) % 62),
  r: i % 7 === 0 ? 1 : 0.5,
}));

export function OceanExperience({ adapter }: { adapter: OceanAdapter }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [status, setStatus] = useState<Status>("ready");
  const [image, setImage] = useState<string | null>(null);
  const [exportError, setExportError] = useState(false);
  const key = useRef<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);

  async function contribute() {
    if (submitting.current) return;
    if (!navigator.onLine) { setStatus("offline"); return; }
    submitting.current = true;
    setStatus("pending");
    try {
      const result = await attemptPreview(adapter, key, () => crypto.randomUUID());
      setStatus(result === "failed" && !navigator.onLine ? "offline" : result);
    } finally {
      submitting.current = false;
    }
  }

  function makeSouvenir() {
    setExportError(false);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setExportError(true); return; }
    const sky = ctx.createLinearGradient(0, 0, 0, 1920);
    sky.addColorStop(0, "#17142b"); sky.addColorStop(1, "#6e4ea5");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = "#f4d78a";
    for (const light of lights) {
      ctx.beginPath(); ctx.arc(light.cx * 10.8, light.cy * 15, light.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.textAlign = "center"; ctx.fillStyle = "#fff5e9";
    ctx.font = "48px sans-serif"; ctx.fillText("A LITTLE LIGHT, TOGETHER", 540, 560);
    ctx.font = "80px Georgia"; ctx.fillText("Our Little Purple Ocean", 540, 800);
    ctx.font = "42px sans-serif"; ctx.fillText("A preview of a beautiful memory", 540, 920);
    ctx.font = "30px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1760);
    canvas.toBlob((blob) => {
      if (!blob) { setExportError(true); return; }
      setImage(URL.createObjectURL(blob));
    }, "image/png");
  }

  const completed = status === "accepted" || status === "already_contributed";
  const message: Record<Status, string> = {
    ready: "Try the preview below. No light will be saved or shared.",
    pending: "Preparing your preview…",
    accepted: "Your preview light is glowing here. It has not been saved or shared.",
    already_contributed: "Your preview light is already glowing here. Nothing was saved or shared.",
    failed: "The preview couldn't finish. Please try again.",
    offline: "You're offline. Reconnect and try the preview again.",
    read_only: "The preview is resting. You can still enjoy the ocean.",
  };

  return <>
    <div className="ocean-demo-label">PREVIEW ONLY · No lights are saved or shared</div>
    <div className="ocean-scene ocean-preview" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ocean-stars">
        {lights.map((light, i) => <circle key={i} {...light} />)}
        {status === "accepted" && <circle className="new-light" cx="50" cy="32" r="1.3" />}
        <path d="M0 77 Q25 70 50 77 T100 77 V100 H0Z" fill="#5a4583" opacity=".65" />
        <path d="M0 85 Q25 78 50 85 T100 85 V100 H0Z" fill="#29214c" opacity=".8" />
      </svg>
    </div>
    <div className="ocean-action">
      <p className="ocean-status" role="status" aria-live="polite">{message[status]}</p>
      {!completed && status !== "read_only" && <button className="button" type="button" disabled={!hydrated || status === "pending"} onClick={contribute}>{status === "pending" ? "Preparing…" : status === "failed" || status === "offline" ? "Try the preview again" : "Try adding a little light"}</button>}
      {completed && <div className="souvenir"><h2>A little preview keepsake</h2><p>Make a 1080 × 1920 image to keep. It’s a preview, not a record of a saved contribution.</p><button className="button" type="button" onClick={makeSouvenir}>Create preview image</button>{image && <p><a href={image} download="boraverse-ocean-preview.png">Download preview image</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save it manually</p>}{exportError && <p role="alert">The image couldn’t be created on this device. Please try another browser.</p>}</div>}
    </div>
  </>;
}

export default function OceanPreview() {
  const [adapter] = useState(createMockOcean);
  return <OceanExperience adapter={adapter} />;
}
