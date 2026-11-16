"use client";
import { useEffect, useState } from "react";
import { readKeepsakes, type Keepsake } from "@/lib/keepsakes/storage";
import ImageExport from "./image-export";
export default function KeepsakeList() {
  const [items, setItems] = useState<Keepsake[] | null>(null);
  const [readError, setReadError] = useState(false);
  function loadKeepsakes() { try { setItems(readKeepsakes()); setReadError(false); } catch { setReadError(true); } }
  useEffect(() => { const timer = window.setTimeout(loadKeepsakes, 0); return () => clearTimeout(timer); }, []);
  return <><p>Kept only in this browser. Clearing browser data removes these items.</p>{items === null && !readError && <p role="status">Opening your keepsakes…</p>}{readError && <><p role="alert">Your keepsakes could not be opened here. Your existing data was not overwritten. Check browser storage, then try again.</p><button className="button" type="button" onClick={loadKeepsakes}>Try opening keepsakes again</button></>}{items?.length === 0 && <p>No keepsakes yet. Explore the arcade or Magic Shop to save one.</p>}{items?.map(item => <article className="souvenir" key={item.id}><h2>{item.title}</h2><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.text}</p><ImageExport title={item.title} text={item.text} /></article>)}</>;
}
