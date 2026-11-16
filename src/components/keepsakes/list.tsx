"use client";
import { useEffect, useRef, useState } from "react";
import { readKeepsakes, type Keepsake } from "@/lib/keepsakes/storage";
export default function KeepsakeList() {
  const [items, setItems] = useState<Keepsake[] | null>(null);
  const [readError, setReadError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const mounted = useRef(false);
  const [image, setImage] = useState<string | null>(null);
  function loadKeepsakes() {
    try { setItems(readKeepsakes()); setReadError(false); } catch { setReadError(true); }
  }
  useEffect(() => {
    mounted.current = true;
    const timer = window.setTimeout(loadKeepsakes, 0);
    return () => { mounted.current = false; clearTimeout(timer); };
  }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  function exportImage(item: Keepsake) {
    setImage(null);
    setImageError(false);
    setExporting(true);
    try {
      const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#241833"; ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = "#fff5e9"; ctx.textAlign = "center";
      ctx.font = "64px Georgia"; ctx.fillText(item.title, 540, 550, 900); ctx.font = "38px sans-serif";
      const words = item.text.split(/\s+/); let line = "", y = 760;
      for (const word of words) { const next = line ? line + " " + word : word; if (ctx.measureText(next).width > 850 && line) { ctx.fillText(line, 540, y); y += 60; line = word; } else line = next; }
      if (line) ctx.fillText(line, 540, y); ctx.font = "30px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1760);
      canvas.toBlob(blob => {
        if (!mounted.current) return;
        try {
          if (!blob) throw new Error("Image unavailable");
          setImage(URL.createObjectURL(blob));
        } catch { setImageError(true); }
        finally { setExporting(false); }
      }, "image/png");
    } catch { setImageError(true); setExporting(false); }
  }
  return <><p>Kept only in this browser. Clearing browser data removes these items.</p>{items === null && !readError && <p role="status">Opening your keepsakes…</p>}{readError && <><p role="alert">Your keepsakes could not be opened here. Your existing data was not overwritten. Check browser storage, then try again.</p><button className="button" type="button" onClick={loadKeepsakes}>Try opening keepsakes again</button></>}{imageError && <p role="alert">Your image could not be created here. Your keepsake is still saved. Try Create image again, or keep the text above.</p>}{items?.length === 0 && <p>No keepsakes yet. Explore the arcade or Magic Shop to save one.</p>}{items?.map(item => <article className="souvenir" key={item.id}><h2>{item.title}</h2><p>{item.text}</p><button className="button" type="button" disabled={exporting} onClick={() => exportImage(item)}>Create image</button></article>)}{exporting && <p role="status">Creating your image…</p>}{image && <p><a href={image} download="little-boraverse-keepsake.png">Download image</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save manually</p>}</>;
}
