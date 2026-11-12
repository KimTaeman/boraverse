"use client";
import { useState } from "react";
import Save from "@/components/keepsakes/save";

const songs = [
  { title: "Spring Day", mood: "comfort", description: "A reflective song for a quiet moment.", url: "https://www.youtube.com/watch?v=xEeFrLSkMm8" },
  { title: "Dynamite", mood: "energy", description: "A bright pick for a burst of energy.", url: "https://www.youtube.com/watch?v=gdZLi9oWNZg" },
] as const;
export default function Music() {
  const [mood, setMood] = useState("surprise");
  const [song, setSong] = useState<(typeof songs)[number] | null>(null);
  function pick() {
    const options = mood === "surprise" ? songs : songs.filter(item => item.mood === mood);
    const number = new Uint32Array(1); crypto.getRandomValues(number);
    setSong(options[number[0] % options.length]);
  }
  return <><p>Choose a mood and discover a song. Music opens only when you choose the link.</p><label htmlFor="mood">Your mood</label>{" "}<select id="mood" value={mood} onChange={event => setMood(event.target.value)} style={{ color: "#30213d", background: "#fff5e9", padding: ".7rem" }}><option value="surprise">Surprise me</option><option value="comfort">Comfort</option><option value="energy">Energy</option></select>{" "}<button className="button" type="button" onClick={pick}>Find a song</button><div className="souvenir" aria-live="polite">{song ? <><h2>{song.title} · BTS</h2><p>{song.description}</p><p><a href={song.url} target="_blank" rel="noopener noreferrer">Watch the official video on YouTube (opens a new tab)</a></p><Save key={song.title} title={song.title + " · BTS"} text={song.description} /></> : <p>Your song will appear here.</p>}</div></>;
}
