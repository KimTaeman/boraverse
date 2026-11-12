"use client";
import { useState } from "react";
import Save from "@/components/keepsakes/save";

const letters = [
  "Take a breath. You do not need to have everything figured out today.",
  "May you find a small moment of joy in the middle of a busy day.",
  "Even a little rest is a kind way to look after yourself.",
  "Your own pace is a perfectly good pace for this journey.",
  "Somewhere in the crowd, another person is hoping for a brighter tomorrow too.",
  "Keep a little room for the things that make you laugh.",
  "You deserve kindness, including the kindness you give yourself.",
];
const fortunes = ["The Star — A gentle surprise is waiting nearby.", "The Door — A small brave step will be enough.", "The Melody — Let a familiar song brighten your day.", "The Moon — A little rest will make room for joy.", "The Ribbon — A friend may bring an unexpected smile.", "The Lantern — Your curiosity will lead somewhere lovely.", "The Garden — A new memory is ready to begin."];

export default function Shop() {
  const [letter, setLetter] = useState<string | null>(null);
  const [fortune, setFortune] = useState<string | null>(null);
  function revealFortune() {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    setFortune(fortunes[random[0] % fortunes.length]);
  }
  return <><p>Pick an envelope for a little note, or find a playful fortune.</p><div className="room-grid" aria-label="Choose a letter">{letters.map((text, index) => <button className="room-card room-magic" key={text} type="button" onClick={() => setLetter(text)}>✉ &nbsp; Envelope {index + 1}</button>)}</div><div className="souvenir" aria-live="polite">{letter ? <><h2>A little note</h2><p>{letter}</p><Save key={letter} title="A little note" text={letter} /></> : <p>Your note will appear here.</p>}</div><section className="ocean-notice"><h2>Tarot mirror</h2><p>For fun, not a prediction.</p><button className="button" type="button" onClick={revealFortune}>Reveal a fortune</button><p aria-live="polite">{fortune}</p>{fortune && <Save key={fortune} title="A little fortune" text={fortune} />}</section></>;
}
