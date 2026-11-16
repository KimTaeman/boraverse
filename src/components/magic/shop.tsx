"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Save from "@/components/keepsakes/save";
import ImageExport from "@/components/keepsakes/image-export";
import { collection, drawMagic, pendingMagic, retryMagic, sendMagic, submittedMagic, type MagicIntent } from "./live";
import { MAX_LETTER_LENGTH, MAX_MESSAGE_LENGTH, safePublicText, type Audience, type MagicReply, type PublicMessage } from "@/lib/magic/validation";

type View = "entrance" | "room" | "letters" | "mirror" | "collection" | "jar" | "write" | "moment" | "share" | "receipt" | "submissions";
type Moment = { id: string; title: string; text: string; kind: "letter" | "fortune" | "writing" | "bangtan" | "army"; reactions?: number };
const letters = [
  ["A little breathing room", "Take a breath. You do not need to have everything figured out today."],
  ["A little joy", "May you find a small moment of joy in the middle of a busy day."],
  ["A little rest", "Even a little rest is a kind way to look after yourself."],
  ["Your own pace", "Your own pace is a perfectly good pace for this journey."],
  ["A little company", "Somewhere in the crowd, another person is hoping for a brighter tomorrow too."],
  ["Room for laughter", "Keep a little room for the things that make you laugh."],
  ["A little kindness", "You deserve kindness, including the kindness you give yourself."],
];
const fortunes = [
  ["The Star", "A gentle surprise is waiting nearby."], ["The Door", "A small brave step will be enough."],
  ["The Melody", "Let a familiar song brighten your day."], ["The Moon", "A little rest will make room for joy."],
  ["The Ribbon", "A friend may bring an unexpected smile."], ["The Lantern", "Your curiosity will lead somewhere lovely."], ["The Garden", "A new memory is ready to begin."],
];
const rooms = [
  ["letters", "envelope", "Little Letters", "Receive a little comfort"], ["mirror", "mirror", "Fortune Mirror", "A gentle discovery"],
  ["collection", "paper-stack", "Dear Bangtan", "Letters we feel together"], ["jar", "jar", "Dear ARMY", "Leave or receive kindness"],
] as const;
const directViews = ["room", "letters", "mirror", "collection", "jar"];
export default function Shop() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("entrance");
  const [entering, setEntering] = useState(false);
  const [item, setItem] = useState<Moment | null>(null);
  const [audience, setAudience] = useState<Audience>("bangtan");
  const [drafts, setDrafts] = useState({ bangtan: { title: "", text: "" }, army: { title: "", text: "" } });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [items, setItems] = useState<PublicMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [readState, setReadState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [writes, setWrites] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [receipts, setReceipts] = useState<{ id: string; kind: Audience }[]>([]);
  const [reviewStatus, setReviewStatus] = useState("");
  const [emptyDraw, setEmptyDraw] = useState(false);
  const [reportReason, setReportReason] = useState<"harmful" | "private_information" | "other">("other");
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const origin = useRef("letters");
  const controller = useRef<AbortController | null>(null);
  const readController = useRef<AbortController | null>(null);
  const working = useRef(false);
  const mounted = useRef(false);
  const entranceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishEntrance = useRef<(() => void) | null>(null);
  const historyStep = useRef(0);
  const historyViews = useRef(new Map<number, { view: View; item: Moment | null; audience: Audience }>());
  const previousMessage = useRef<string | undefined>(undefined);

  function go(next: View, selected: Moment | null = null, nextAudience: Audience = audience) {
    if (working.current) return;
    if (view === "room" && directViews.includes(next)) origin.current = next;
    setError(""); setNotice(""); setConsent(false); setView(next); setItem(selected); setAudience(nextAudience);
    const step = ++historyStep.current;
    historyViews.current.set(step, { view: next, item: selected, audience: nextAudience });
    const url = new URL(window.location.href);
    const feature = directViews.includes(next) ? next : origin.current;
    if (next === "entrance") url.searchParams.delete("experience"); else url.searchParams.set("experience", feature);
    window.history.pushState({ ...window.history.state, magicStep: step }, "", url);
  }
  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => {
      const feature = new URL(window.location.href).searchParams.get("experience");
      let first: View = feature && directViews.includes(feature) ? feature as View : "entrance";
      try {
        if (!feature && sessionStorage.getItem("boraverse-magic-entered-v1") === "1") first = "room";
        const earlier = pendingMagic(); setPending(Boolean(earlier));
        if (earlier?.action === "submit") setDrafts(current => ({ ...current, [earlier.kind]: { title: earlier.title, text: earlier.text } }));
        setReceipts(submittedMagic());
      } catch { /* Private moments work even if optional history cannot be opened. */ }
      setView(first); setReady(true); origin.current = first === "entrance" ? "letters" : first;
      historyViews.current.set(0, { view: first, item: null, audience: "bangtan" });
      window.history.replaceState({ ...window.history.state, magicStep: 0 }, "", window.location.href);
    }, 0);
    const onBack = () => {
      controller.current?.abort(); controller.current = null; working.current = false; setBusy(false);
      try { setPending(Boolean(pendingMagic())); } catch {}
      if (entranceTimer.current) clearTimeout(entranceTimer.current);
      setEntering(false); setConsent(false); setError(""); setNotice("");
      const known = historyViews.current.get(window.history.state?.magicStep);
      const feature = new URL(window.location.href).searchParams.get("experience");
      setView(known?.view || (feature && directViews.includes(feature) ? feature as View : "room"));
      setItem(known?.item || null); if (known) setAudience(known.audience);
    };
    window.addEventListener("popstate", onBack);
    return () => { mounted.current = false; clearTimeout(timer); if (entranceTimer.current) clearTimeout(entranceTimer.current); controller.current?.abort(); readController.current?.abort(); window.removeEventListener("popstate", onBack); };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (view === "room") root.current?.querySelector<HTMLButtonElement>(`[data-room="${origin.current}"]`)?.focus({ preventScroll: true });
      else if (view !== "entrance") heading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [view, item?.id]);
  async function load(more = false) {
    if (readState === "loading") return;
    setReadState("loading");
    try {
      readController.current = new AbortController();
      const data = await collection(more ? nextCursor || undefined : undefined, readController.current.signal);
      if (!mounted.current) return;
      setItems(current => more ? [...current, ...data.items.filter(value => !current.some(old => old.id === value.id))] : data.items);
      setNextCursor(data.nextCursor); setWrites(data.writesEnabled); setReadState("ready");
    } catch { if (mounted.current) setReadState("failed"); }
  }
  useEffect(() => {
    if (!["collection", "jar", "share"].includes(view) || readState !== "idle") return;
    const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer);
    // Availability is shared by the three views; explicit retry reloads after a failure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, readState]);
  function enter() {
    if (entering) return;
    const finish = () => { finishEntrance.current = null; entranceTimer.current = null; setEntering(false); try { sessionStorage.setItem("boraverse-magic-entered-v1", "1"); } catch {} go("room"); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    finishEntrance.current = finish; setEntering(true); entranceTimer.current = setTimeout(finish, 1000);
  }
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { if (media.matches && entranceTimer.current) { clearTimeout(entranceTimer.current); finishEntrance.current?.(); } };
    media.addEventListener("change", change); return () => media.removeEventListener("change", change);
  }, []);
  async function run(task: (signal: AbortSignal) => Promise<MagicReply>, result?: (reply: MagicReply) => void) {
    if (working.current) return;
    working.current = true; setBusy(true); setError(""); setNotice("");
    const current = new AbortController(); controller.current = current;
    try {
      const reply = await task(current.signal);
      if (!mounted.current || current.signal.aborted || controller.current !== current) return;
      working.current = false;
      if (reply.status === "reacted") {
        setActive(current => ({ ...current, [reply.messageId]: reply.active }));
        setItems(current => current.map(value => value.id === reply.messageId ? { ...value, reactions: reply.reactions } : value));
        setItem(current => current?.id === reply.messageId ? { ...current, reactions: reply.reactions } : current);
        setNotice(reply.active ? "Your agreement has been counted." : "Your reaction has been removed.");
      } else if (reply.status === "submitted") { setReviewStatus(reply.reviewStatus); go("receipt", null, reply.kind); }
      else if (reply.status === "withdrawn") { setNotice("Your words have been withdrawn from sharing."); setReceipts(current => current.filter(value => value.id !== reply.messageId)); }
      else if (reply.status === "reported") setNotice("Your report has been received for review.");
      result?.(reply);
    } catch (failure) { if (mounted.current && !current.signal.aborted && controller.current === current) setError(failure instanceof Error ? failure.message : "The shop could not confirm that request. Please try again."); }
    finally {
      if (controller.current !== current) return;
      working.current = false;
      if (mounted.current) { setBusy(false); try { setPending(Boolean(pendingMagic())); setReceipts(submittedMagic()); } catch {} }
    }
  }
  const send = (intent: MagicIntent) => run(signal => sendMagic(intent, signal));
  function beginWriting(kind: Audience) { go("write", null, kind); }
  function fold() {
    const draft = drafts[audience];
    if (!draft.text.trim()) { setError("A few words are enough. Write something first, or return to the shop."); return; }
    go("moment", { id: crypto.randomUUID(), kind: "writing", title: draft.title.trim() || (audience === "bangtan" ? "My letter to Bangtan" : "A little kindness for ARMY"), text: draft.text });
  }
  function submit() {
    if (!item || !consent) { setError("Choose public sharing to submit, or keep your words privately."); return; }
    if (!safePublicText(item.title, 80) || !safePublicText(item.text, audience === "army" ? MAX_MESSAGE_LENGTH : MAX_LETTER_LENGTH)) { setError("Share plain words without links, contact details or HTML. You can still keep the original privately."); return; }
    void send({ action: "submit", kind: audience, title: item.title, text: item.text, consent: true });
  }
  function draw() {
    setEmptyDraw(false);
    void run(signal => drawMagic(previousMessage.current, signal), reply => {
      if (reply.status !== "drawn") return;
      if (!reply.message) { go("jar"); setEmptyDraw(true); return; }
      previousMessage.current = reply.message.id;
      go("moment", { ...reply.message, kind: "army" });
    });
  }
  const title = view === "entrance" ? "Magic Shop" : view === "room" ? "Stay a little while." : view === "letters" ? "A note to meet you here." : view === "mirror" ? "A little possibility." : view === "collection" ? "Words we share." : view === "jar" ? "From one ARMY to another." : view === "write" ? "A place for your words." : view === "share" ? "Ready to share these words?" : view === "receipt" ? "Your words, received." : view === "submissions" ? "My shared words" : "A moment for you.";
  const back = <button type="button" className="ms-back" disabled={busy} onClick={() => go("room")}>← Back to the shop</button>;
  const availability = <>{readState === "loading" && <p role="status">Opening the shared collection…</p>}{readState === "failed" && <p>The shared collection is resting. <button className="ms-text-button" onClick={() => void load()}>Try the collection again</button></p>}{readState === "ready" && !writes && <p className="ms-small">Shared posting is being prepared. Private letters and keepsakes are available.</p>}</>;
  const react = (message: PublicMessage | Moment) => <button type="button" className="ms-reaction" disabled={busy || !writes} aria-pressed={Boolean(active[message.id])} onClick={() => void send({ action: "react", messageId: message.id, active: !active[message.id] })}>I feel this too ♡ · {message.reactions || 0}</button>;

  if (!ready) return <div className="magic-shell" aria-busy="true"><p role="status">Opening the shop…</p></div>;
  return <div ref={root} className={`magic-shell ${entering ? "magic-entering" : ""}`} data-view={view} aria-busy={busy || entering}>
    <div className="magic-backdrop" aria-hidden="true" />
    <header className="magic-top"><Link href="/">← Back to the village</Link><span>The Little Boraverse</span><Link href="/keepsakes">My Keepsakes</Link></header>
    <div className="ms-content">
      {view !== "entrance" && view !== "room" && back}
      <p className="ms-eyebrow">{view === "collection" ? "Dear Bangtan" : view === "jar" ? "Dear ARMY" : view === "room" ? "Come as you are" : "A little place for you"}</p>
      <h1 ref={heading} tabIndex={-1}>{title}</h1>
      {pending && <aside className="magic-pending"><p>An earlier shared request needs checking. It will not be sent again automatically.</p><button className="button" disabled={busy} onClick={() => void run(retryMagic)}>Retry earlier request</button></aside>}
      {error && <p className="magic-feedback" role="alert">{error}</p>}{notice && <p className="magic-feedback" role="status">{notice}</p>}{busy && <p role="status">Waiting for the shop to confirm…</p>}
      {view === "entrance" && <div className="magic-entrance"><p className="ms-sub">Set the day down for a moment.</p><div className={`ms-door-scene ${entering ? "ms-opening" : ""}`} aria-hidden="true"><div className="ms-door-frame"><div className="ms-door" /></div></div><button className="button magic-enter" disabled={entering} onClick={enter}>Come on in ♡</button></div>}
      {view === "room" && <><p className="ms-sub">What would feel good today?</p><div className="ms-objects">{rooms.map(([destination, prop, name, description]) => <button key={destination} data-room={destination} className="ms-object" onClick={() => go(destination)}><span className={`ms-${prop}`} aria-hidden="true" /><strong>{name}</strong><span>{description}</span></button>)}</div></>}
      {view === "letters" && <><p className="ms-sub">Choose whichever envelope calls to you.</p><div className="magic-envelopes">{letters.map(([name, text], index) => <button key={name} className="ms-letter-choice" onClick={() => go("moment", { id: String(index), title: name, text, kind: "letter" })}><span className="ms-envelope" aria-hidden="true" /><span>{name}</span></button>)}</div><p className="ms-small">Original ARMY-made words, with a little warmth.</p></>}
      {view === "mirror" && <><p className="ms-sub">A playful thought to carry into your day.</p><div className="ms-fortune" aria-hidden="true"><span className="ms-mirror" /></div><button className="button" onClick={() => { const random = new Uint32Array(1); crypto.getRandomValues(random); const index = random[0] % fortunes.length; go("moment", { id: String(index), title: fortunes[index][0], text: fortunes[index][1], kind: "fortune" }); }}>Turn my card</button><p className="ms-small">For reflection and fun.</p></>}
      {view === "collection" && <><p className="ms-sub">Read a letter. Leave a little heart when it speaks for you.</p><button className="ms-secondary" onClick={() => beginWriting("bangtan")}>Write a letter</button>{availability}{readState === "ready" && items.length === 0 && <p>The first published letter is still waiting to arrive.</p>}<div className="magic-collection">{items.map(message => <article key={message.id}><button className="ms-read" onClick={() => go("moment", { ...message, kind: "bangtan" })}>{message.title}</button><p>{message.text.length > 180 ? message.text.slice(0, 180) + "…" : message.text}</p>{react(message)}</article>)}</div>{nextCursor && <button className="button" disabled={readState === "loading"} onClick={() => void load(true)}>More letters</button>}<p className="ms-small">Reactions count accepted browser agreements, not verified unique people. Letters stay in this fan space and are not delivered to BTS.</p></>}
      {view === "jar" && <><p className="ms-sub">Receive a message, or leave a little kindness for someone.</p><div className="magic-jar-display" aria-hidden="true"><span className="ms-jar" /></div>{availability}<button className="button" disabled={busy || readState !== "ready"} onClick={draw}>Pick a message</button><button className="ms-secondary" disabled={busy} onClick={() => beginWriting("army")}>Write a message</button>{emptyDraw && <p role="status">No other shared message is available for this draw yet. Try again later, or leave a little kindness.</p>}</>}
      {view === "write" && <form className="magic-compose" onSubmit={event => { event.preventDefault(); fold(); }}><p>Your draft stays private while you explore this shop. Reloading or leaving clears an unsaved draft.</p><label htmlFor="magic-title">A little title (optional)</label><input id="magic-title" maxLength={80} value={drafts[audience].title} onChange={event => setDrafts(current => ({ ...current, [audience]: { ...current[audience], title: event.target.value } }))} /><label htmlFor="magic-draft">{audience === "bangtan" ? "Your letter" : "Your message"}</label><textarea id="magic-draft" rows={9} maxLength={audience === "army" ? MAX_MESSAGE_LENGTH : MAX_LETTER_LENGTH} value={drafts[audience].text} onChange={event => setDrafts(current => ({ ...current, [audience]: { ...current[audience], text: event.target.value } }))} /><p className="ms-small">{audience === "bangtan" ? "Dear Bangtan is an ARMY letter collection, not direct delivery to BTS." : "A few kind words for an ARMY you may never meet."}</p><button className="button" type="submit">Fold and preview</button></form>}
      {(view === "moment" || view === "share") && item && <div className="magic-reading"><article className="ms-stationery ms-reveal"><h2>{item.title}</h2><p>{item.text}</p><p className="ms-signature">{item.kind === "writing" ? "Written by you. Sharing is your choice." : item.kind === "bangtan" || item.kind === "army" ? "Shared by another ARMY." : "Original ARMY-made words, with a little warmth."}</p></article>{view === "moment" ? <><div className="magic-keep"><Save key={item.id} title={item.title} text={item.text} /><ImageExport key={item.id + ":image"} title={item.title} text={item.text} /></div>{item.kind === "bangtan" && react(item)}{item.kind === "writing" && <><button className="ms-secondary" disabled={busy} onClick={() => go("share", item)}>Share these words</button><button className="ms-secondary" onClick={() => go("write")}>Unfold and edit</button></>}{item.kind === "letter" && <button className="ms-secondary" onClick={() => go("letters")}>Choose another envelope</button>}{item.kind === "fortune" && <button className="ms-secondary" onClick={() => go("mirror")}>Another little possibility</button>}{item.kind === "army" && <button className="ms-secondary" disabled={busy} onClick={draw}>Pick another message</button>}{["bangtan", "army"].includes(item.kind) && <details className="magic-report"><summary>Report this message</summary><label htmlFor="report-reason">Reason</label><select id="report-reason" value={reportReason} onChange={event => setReportReason(event.target.value as typeof reportReason)}><option value="other">Something is not right</option><option value="harmful">Harmful content</option><option value="private_information">Private information</option></select><button className="button" disabled={busy || !writes} onClick={() => void send({ action: "report", messageId: item.id, reason: reportReason })}>Send report</button></details>}</> : <>{availability}<label className="magic-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I want these words to be public in {audience === "bangtan" ? "Dear Bangtan" : "Dear ARMY"} after owner review.</span></label><p className="ms-small">Submitting sends this text for review and keeps retry details in this browser. Please leave out links, contact details and private information.</p><button className="button" disabled={busy || !writes || !consent} onClick={submit}>Submit for review</button><button className="ms-secondary" disabled={busy} onClick={() => go("write")}>Keep editing privately</button></>}</div>}
      {view === "receipt" && <div className="magic-receipt"><p>{reviewStatus === "pending" ? "Your words are waiting for owner review. They are not public yet." : reviewStatus === "published" ? "Your reviewed words are now shared in the shop." : reviewStatus === "withdrawn" ? "Your submission has been withdrawn." : "Your words were received but have not been published."}</p><button className="button" onClick={() => go(audience === "bangtan" ? "collection" : "jar")}>Keep exploring</button></div>}
      {view === "submissions" && <div className="magic-submissions"><p>These receipts are saved in this browser. You can withdraw your words from sharing here.</p>{receipts.length === 0 && <p>No shared submission receipts are saved in this browser.</p>}{receipts.map(receipt => <article key={receipt.id}><p>{receipt.kind === "bangtan" ? "A letter to Bangtan" : "Kindness for ARMY"}</p><button className="button" disabled={busy} onClick={() => void send({ action: "remove", messageId: receipt.id })}>Withdraw from sharing</button></article>)}</div>}
    </div>
    <footer className="magic-footer"><p>Unofficial ARMY-made space · Replaceable draft illustrations</p><div><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><button onClick={() => { try { setReceipts(submittedMagic()); go("submissions"); } catch { setError("Your submission receipts could not be opened in this browser."); } }} disabled={busy}>My shared words</button></div></footer>
  </div>;
}
