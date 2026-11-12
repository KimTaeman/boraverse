"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { oceanFetch, submitLight } from "./live";

const subscribe = () => () => {};
type Status = "ready" | "pending" | "accepted" | "already_contributed" | "failed" | "offline";
const lights = Array.from({ length: 42 }, (_, i) => ({ cx: 5 + ((i * 37) % 90), cy: 8 + ((i * 23) % 62), r: i % 7 === 0 ? 1 : 0.5 }));

export default function OceanExperience() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [status, setStatus] = useState<Status>("ready");
  const [count, setCount] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [exportError, setExportError] = useState(false);
  const submitting = useRef(false);
  const confirmedAt = useRef(0);

  const refresh = useCallback(async () => {
    const started = Date.now();
    try {
      const response = await oceanFetch("/api/ocean", { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      if (started < confirmedAt.current + 30000 && confirmedAt.current !== 0) return;
      if (Number.isSafeInteger(result.totalLights) && result.totalLights >= 0) setCount(result.totalLights);
    } catch { /* Keep the last confirmed count when the ocean is unavailable. */ }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 30000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);

  async function contribute() {
    if (submitting.current) return;
    if (!navigator.onLine) { setStatus("offline"); return; }
    submitting.current = true;
    setStatus("pending");
    try {
      const result = await submitLight();
      confirmedAt.current = Date.now();
      setCount(result.totalLights);
      setStatus(result.status);
    } catch {
      setStatus(navigator.onLine ? "failed" : "offline");
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
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = "#f4d78a";
    for (const light of lights) { ctx.beginPath(); ctx.arc(light.cx * 10.8, light.cy * 15, light.r * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.textAlign = "center"; ctx.fillStyle = "#fff5e9"; ctx.font = "48px sans-serif"; ctx.fillText("A LITTLE LIGHT, TOGETHER", 540, 560);
    ctx.font = "80px Georgia"; ctx.fillText("Our Little Purple Ocean", 540, 800);
    ctx.font = "42px sans-serif"; ctx.fillText("One little light. One beautiful memory.", 540, 920);
    ctx.font = "30px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1760);
    canvas.toBlob((blob) => { if (!blob) { setExportError(true); return; } setImage(URL.createObjectURL(blob)); }, "image/png");
  }

  const complete = status === "accepted" || status === "already_contributed";
  const message: Record<Status, string> = {
    ready: "Add a little light to our shared ocean.",
    pending: "Sending your little light…",
    accepted: "Your light has joined the others.",
    already_contributed: "Your light is already part of the ocean.",
    failed: "Your light wasn't confirmed. Please try again.",
    offline: "You're offline. Reconnect and try again.",
  };
  return <>
    <div className="ocean-scene ocean-preview" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ocean-stars">
      {lights.map((light, i) => <circle key={i} {...light} />)}
      {status === "accepted" && <circle className="new-light" cx="50" cy="32" r="1.3" />}
      <path d="M0 77 Q25 70 50 77 T100 77 V100 H0Z" fill="#5a4583" opacity=".65" />
      <path d="M0 85 Q25 78 50 85 T100 85 V100 H0Z" fill="#29214c" opacity=".8" />
    </svg></div>
    <div className="ocean-action">
      <p>{count === null ? "The shared light count is unavailable right now." : `${count.toLocaleString()} confirmed little lights`}</p>
      <p className="ocean-status" role="status" aria-live="polite">{message[status]}</p>
      {!complete && <button className="button" type="button" disabled={!hydrated || status === "pending"} onClick={contribute}>{status === "pending" ? "Sending…" : status === "failed" || status === "offline" ? "Try again" : "Add my little light"}</button>}
      <p>Lights represent contributions, not verified unique people. One light per browser.</p>
      {complete && <div className="souvenir"><h2>A little keepsake</h2><p>Keep a memory of this little ocean.</p><button className="button" type="button" onClick={makeSouvenir}>Create keepsake image</button>{image && <p><a href={image} download="boraverse-ocean.png">Download keepsake</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save it manually</p>}{exportError && <p role="alert">The image couldn’t be created on this device. Please try another browser.</p>}</div>}
    </div>
  </>;
}
