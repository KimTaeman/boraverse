"use client";
import { useState } from "react";
import { saveKeepsake } from "@/lib/keepsakes/storage";
export default function Save({ title, text }: { title: string; text: string }) {
  const [message, setMessage] = useState("");
  return <><button type="button" className="button" onClick={() => { try { saveKeepsake(title, text); setMessage("Saved on this device."); } catch { setMessage("Could not save here. Check browser storage and try again."); } }}>Save to keepsakes</button><p role="status">{message}</p></>;
}
