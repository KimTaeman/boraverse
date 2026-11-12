"use client";
import { useState } from "react";
import Save from "@/components/keepsakes/save";

const outcomes = [
  ["Little Star", "A little sparkle for the path ahead."],
  ["Purple Cloud", "A soft place to pause and breathe."],
  ["Pocket Moon", "A quiet glow for your evening."],
  ["Lucky Blossom", "A tiny reminder that good things grow."],
  ["Golden Ticket", "An invitation to follow your curiosity."],
  ["Rainbow Ribbon", "A colorful twist for an ordinary day."],
  ["Dreaming Lantern", "A warm light to carry with you."],
] as const;

export default function Gacha() {
  const [result, setResult] = useState<(typeof outcomes)[number] | null>(null);
  function draw() {
    const number = new Uint32Array(1);
    crypto.getRandomValues(number);
    setResult(outcomes[number[0] % outcomes.length]);
  }
  return <><p>Open a little surprise from the arcade. Every draw is free.</p><button className="button" type="button" onClick={draw}>Draw a surprise</button><div className="souvenir" aria-live="polite">{result ? <><h2>{result[0]}</h2><p>{result[1]}</p><Save key={result[0]} title={result[0]} text={result[1]} /></> : <p>Your surprise will appear here.</p>}</div></>;
}
