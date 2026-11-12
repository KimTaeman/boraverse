"use client";
import { useEffect, useState } from "react";
import { readKeepsakes, type Keepsake } from "@/lib/keepsakes/storage";
export default function KeepsakeList() {
  const [items, setItems] = useState<Keepsake[] | null>(null);
  const [error, setError] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => { try { setItems(readKeepsakes()); } catch { setError(true); } }, 0); return () => clearTimeout(timer); }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  function exportImage(item: Keepsake) {
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext("2d"); if (!ctx) { setError(true); return; }
    ctx.fillStyle = "#241833"; ctx.fillRect(0, 0, 1080, 1920); ctx.fillStyle = "#fff5e9"; ctx.textAlign = "center";
    ctx.font = "64px Georgia"; ctx.fillText(item.title, 540, 550, 900); ctx.font = "38px sans-serif";
    const words = item.text.split(/\s+/); let line = "", y = 760;
    for (const word of words) { const next = line ? line + " " + word : word; if (ctx.measureText(next).width > 850 && line) { ctx.fillText(line, 540, y); y += 60; line = word; } else line = next; }
    if (line) ctx.fillText(line, 540, y); ctx.font = "30px sans-serif"; ctx.fillText("Unofficial ARMY-made keepsake · Bangkok 2026", 540, 1760);
    canvas.toBlob(blob => { if (blob) setImage(URL.createObjectURL(blob)); else setError(true); }, "image/png");
  }
  return <><p>Kept only in this browser. Clearing browser data removes these items.</p>{error && <p role="alert">Your keepsakes or image could not be opened here. Your existing data was not overwritten.</p>}{items?.length === 0 && <p>No keepsakes yet. Explore the arcade or Magic Shop to save one.</p>}{items?.map(item => <article className="souvenir" key={item.id}><h2>{item.title}</h2><p>{item.text}</p><button className="button" type="button" onClick={() => exportImage(item)}>Create image</button></article>)}{image && <p><a href={image} download="little-boraverse-keepsake.png">Download image</a> · <a href={image} target="_blank" rel="noreferrer">Open image</a> to save manually</p>}</>;
}
