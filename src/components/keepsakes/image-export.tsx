"use client";
import { useEffect, useRef, useState } from "react";
import { drawPostcard } from "@/lib/keepsakes/postcard";
export default function ImageExport({ title, text }: { title: string; text: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  function create() {
    setImage(null); setError(false); setBusy(true);
    try {
      const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
      drawPostcard(ctx, title, text);
      canvas.toBlob(blob => {
        if (!mounted.current) return;
        try { if (!blob) throw new Error("Image unavailable"); setImage(URL.createObjectURL(blob)); }
        catch { setError(true); }
        finally { setBusy(false); }
      }, "image/png");
    } catch { setError(true); setBusy(false); }
  }
  return <div className="image-export"><button className="button" type="button" disabled={busy} onClick={create}>Create image</button>{busy && <p role="status">Creating your image…</p>}{error && <p role="alert">Your image could not be created here. Your words are still on this page. Try again, or keep the text.</p>}{image && <p><a href={image} download="little-boraverse-keepsake.png">Download image</a> · <a href={image} target="_blank" rel="noopener noreferrer">Open image</a> to save manually</p>}</div>;
}
