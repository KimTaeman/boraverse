"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { confirmedKey, oceanFetch, OceanRateLimit, OceanUnavailable, submitLight, type OceanReply } from "./live";

export type OceanPhase = "booting" | "ready" | "preparing" | "travelling" | "joining" | "success" | "already_contributed" | "offline" | "failed" | "unavailable" | "rate_limited" | "view_only";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function chargeDelay(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const done = () => { window.clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
    const timer = window.setTimeout(done, Math.max(0, milliseconds));
    if (signal.aborted) done(); else signal.addEventListener("abort", done, { once: true });
  });
}

export default function useContribution() {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const [phase, setPhase] = useState<OceanPhase>("booting");
  const [count, setCount] = useState<number | null>(null);
  const [writesEnabled, setWritesEnabled] = useState<boolean | null>(null);
  const [slow, setSlow] = useState(false);
  const [remembered, setRemembered] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const phaseRef = useRef<OceanPhase>("booting");
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const confirmed = useRef<OceanReply | null>(null);
  const confirmedAt = useRef(0);
  const lastRead = useRef(0);
  const read = useRef<AbortController | null>(null);
  const write = useRef<AbortController | null>(null);
  const reduce = useRef(reducedMotion);
  useEffect(() => { reduce.current = reducedMotion; }, [reducedMotion]);

  const transition = useCallback((next: OceanPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const refresh = useCallback(async () => {
    read.current?.abort();
    const controller = new AbortController();
    read.current = controller;
    const started = Date.now();
    lastRead.current = started;
    try {
      const response = await oceanFetch("/api/ocean", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json();
      if (!Number.isSafeInteger(result.totalLights) || result.totalLights < 0) throw new Error("Invalid aggregate");
      if (!mounted.current || controller.signal.aborted) return;
      setWritesEnabled(result.writesEnabled === true);
      if (!inFlight.current && (confirmedAt.current === 0 || started >= confirmedAt.current + 30000)) setCount(result.totalLights);
      if (phaseRef.current === "booting" || phaseRef.current === "view_only" || phaseRef.current === "ready") transition(result.writesEnabled === true ? "ready" : "view_only");
    } catch {
      if (!mounted.current || controller.signal.aborted) return;
      setWritesEnabled(false);
      if (["booting", "ready", "view_only"].includes(phaseRef.current)) transition("view_only");
    }
  }, [transition]);

  useEffect(() => {
    mounted.current = true;
    const initial = window.setTimeout(() => {
      try { setRemembered(localStorage.getItem(confirmedKey) === "1"); } catch { /* Local history is optional. */ }
      void refresh();
    }, 0);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const visible = () => { if (!document.hidden && Date.now() - lastRead.current >= 30000) void refresh(); };
    document.addEventListener("visibilitychange", visible);
    return () => {
      mounted.current = false;
      read.current?.abort(); write.current?.abort();
      window.clearTimeout(initial); window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);

  useEffect(() => {
    if (phase !== "rate_limited") return;
    const timer = window.setTimeout(() => transition("failed"), Math.min(Math.max(0, retryAt - Date.now()), 2147483647));
    return () => window.clearTimeout(timer);
  }, [phase, retryAt, transition]);

  const land = useCallback(() => {
    if (!mounted.current || !confirmed.current || phaseRef.current !== "travelling") return;
    setCount(confirmed.current.totalLights);
    transition("joining");
  }, [transition]);

  const finish = useCallback(() => {
    if (!mounted.current || !confirmed.current || !["travelling", "joining"].includes(phaseRef.current)) return;
    setCount(confirmed.current.totalLights);
    transition("success");
    inFlight.current = false;
  }, [transition]);

  useEffect(() => {
    if (reducedMotion && (phase === "travelling" || phase === "joining")) finish();
  }, [reducedMotion, phase, finish]);

  async function contribute() {
    if (inFlight.current || writesEnabled !== true || !["ready", "failed", "offline", "unavailable"].includes(phaseRef.current)) return;
    if (!navigator.onLine) { transition("offline"); return; }
    inFlight.current = true;
    confirmed.current = null;
    const controller = new AbortController();
    write.current = controller;
    const started = performance.now();
    transition("preparing"); setSlow(false);
    const slowTimer = window.setTimeout(() => { if (mounted.current) setSlow(true); }, 3500);
    try {
      const result = await submitLight(controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      confirmedAt.current = Date.now();
      confirmed.current = result;
      if (result.status === "already_contributed") {
        setCount(result.totalLights); transition("already_contributed");
        inFlight.current = false;
      } else {
        if (!reduce.current) await chargeDelay(450 - (performance.now() - started), controller.signal);
        if (!mounted.current || controller.signal.aborted) return;
        if (reduce.current) {
          setCount(result.totalLights); transition("success"); inFlight.current = false;
        } else transition("travelling");
      }
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) return;
      if (error instanceof OceanRateLimit) { setRetryAt(error.retryAt); transition("rate_limited"); }
      else if (error instanceof OceanUnavailable) transition("unavailable");
      else transition(navigator.onLine ? "failed" : "offline");
      inFlight.current = false;
    } finally { window.clearTimeout(slowTimer); }
  }

  return { phase, count, writesEnabled, slow, remembered, reducedMotion, contribute, land, finish };
}
