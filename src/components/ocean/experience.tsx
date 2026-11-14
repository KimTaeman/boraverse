"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import OceanScene, { whaleOutline } from "./scene";
import { OceanUnavailable, OceanRateLimit, oceanFetch, submitLight } from "./live";

const subscribe = () => () => {};
type Status = "ready" | "pending" | "accepted" | "already_contributed" | "failed" | "offline" | "rate_limited" | "unavailable";
const lights = Array.from({ length: 42 }, (_, i) => ({ cx: 5 + ((i * 37) % 90), cy: 8 + ((i * 23) % 62), r: i % 7 === 0 ? 1 : 0.5 }));

export default function OceanExperience() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [status, setStatus] = useState<Status>("ready");
  const [writesEnabled, setWritesEnabled] = useState<boolean | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [exportError, setExportError] = useState(false);
  const submitting = useRef(false);
  const confirmedAt = useRef(0);

  const refresh = useCallback(async () => {
    const started = Date.now();
    try {
      const response = await oceanFetch("/api/ocean", { cache: "no-store" });
      if (!response.ok) { setWritesEnabled(false); return; }
      const result = await response.json();
      setWritesEnabled(result.writesEnabled === true);
      if (started < confirmedAt.current + 30000 && confirmedAt.current !== 0) return;
      if (Number.isSafeInteger(result.totalLights) && result.totalLights >= 0) setCount(result.totalLights);
    } catch { setWritesEnabled(false); }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 30000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  useEffect(() => {
    if (status !== "rate_limited") return;
    const timer = window.setTimeout(() => setStatus("failed"), Math.min(Math.max(0, retryAt - Date.now()), 2147483647));
    return () => window.clearTimeout(timer);
  }, [status, retryAt]);

  async function contribute() {
    if (submitting.current || writesEnabled !== true) return;
    if (!navigator.onLine) { setStatus("offline"); return; }
    submitting.current = true;
    setStatus("pending");
    try {
      const result = await submitLight();
      confirmedAt.current = Date.now();
      setCount(result.totalLights);
      setStatus(result.status);
    } catch (error) {
      if (error instanceof OceanRateLimit) { setRetryAt(error.retryAt); setStatus("rate_limited"); }
      else if (error instanceof OceanUnavailable) setStatus("unavailable");
      else setStatus(navigator.onLine ? "failed" : "offline");
    } finally {
      submitting.current = false;
    }
  }

  function makeSouvenir() {
    setExportError(false);
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setExportError(true); return; }
    const sky = ctx.createLinearGradient(0, 0, 0, 1920);
    sky.addColorStop(0, "#17142b"); sky.addColorStop(1, "#6e4ea5");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(-30, 240); ctx.scale(1.15, 1.15); ctx.fillStyle = "#b99ae755"; ctx.strokeStyle = "#e6c4ff"; ctx.lineWidth = 2; const whale = new Path2D(whaleOutline); ctx.fill(whale); ctx.stroke(whale); ctx.restore();
    ctx.fillStyle = "#f4d78a";
    for (const light of lights) { ctx.beginPath(); ctx.arc(light.cx * 10.8, light.cy * 15, light.r * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.textAlign = "center"; ctx.fillStyle = "#fff5e9"; ctx.font = "48px sans-serif"; ctx.fillText("A LITTLE LIGHT, TOGETHER", 540, 220);
    ctx.font = "80px Georgia"; ctx.fillText("Our Little", 540, 1050); ctx.fillText("Purple Ocean", 540, 1150);
    ctx.font = "42px sans-serif"; ctx.fillText("One little light. One beautiful memory.", 540, 1270);
    ctx.font = "30px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1760);
    canvas.toBlob((blob) => { if (!blob) { setExportError(true); return; } setImage(URL.createObjectURL(blob)); }, "image/png");
  }

  const complete = status === "accepted" || status === "already_contributed";
  const message: Record<Status, string> = {
    ready: count === 0 ? "It’s quiet here. Be the first to add a little light." : "A little light from you. A little brighter for all of us.",
    pending: "Sending your little light…",
    accepted: "Your light has joined the others.",
    already_contributed: "Your light is already part of the ocean.",
    failed: "Your light wasn't confirmed. Please try again.",
    unavailable: "The ocean is taking a little rest. Your light wasn't confirmed. You can still explore the village and try again later.",
    offline: "You're offline. Reconnect and try again.",
    rate_limited: "The sky needs a tiny pause. Please try again shortly.",
  };
  return <>
    <OceanScene count={count} accepted={status === "accepted"} pending={status === "pending"} />
    <div className="ocean-action">
      <p className="ocean-counter">{count === null ? <span>The shared light count is unavailable right now.</span> : <><strong>{count.toLocaleString()}</strong>{" "}<span>confirmed little lights</span></>}</p>
      <p className="ocean-status" role="status" aria-live="polite">{!complete && status === "ready" && writesEnabled !== true ? writesEnabled === null ? "Checking whether the ocean is ready for little lights…" : "The ocean is taking a little rest. You can still enjoy the sky and explore the village." : message[status]}</p>
      {!complete && writesEnabled !== false && <button className="button" type="button" disabled={!hydrated || writesEnabled !== true || status === "pending" || status === "rate_limited"} onClick={contribute}>{status === "pending" ? "Sending…" : status === "rate_limited" ? "Please wait…" : status === "failed" || status === "offline" || status === "unavailable" ? "Try again" : "Add my little light"}</button>}
      {complete && <div className="ocean-souvenir"><button className="button" type="button" onClick={makeSouvenir}>Save my moment</button>{image && <p><a href={image} download="boraverse-ocean.png">Download keepsake</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save it manually</p>}{exportError && <p role="alert">The image couldn’t be created on this device. Please try another browser.</p>}</div>}
      <p className="ocean-fine-print">One shared sky. One light per browser.<br />Lights represent contributions, not verified unique people.</p>
      <Link className="ocean-explore" href="/arcade">Keep exploring <span aria-hidden="true">↗</span></Link>
    </div>
  </>;
}
