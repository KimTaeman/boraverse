"use client";
import { useEffect, useRef } from "react";
import { bezierPoint, emitGlitter, flightPath, FLIGHT_MS, JOIN_MS, MAX_PARTICLES, sampleGlitter, type Glitter, type Point } from "@/lib/ocean/visual";
import type { OceanPhase } from "./use-contribution";

export default function ContributionEffects({ phase, reducedMotion, onLanding, onComplete }: {
  phase: OceanPhase; reducedMotion: boolean; onLanding: () => void; onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = phase === "preparing" ? "charge" : phase === "travelling" || phase === "joining" ? "flight" : phase === "success" ? "settled" : ["failed", "offline", "unavailable", "rate_limited"].includes(phase) ? "release" : "idle";

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      if (mode === "flight") { onLanding(); onComplete(); }
      return;
    }
    const scene = canvas.closest<HTMLElement>(".ocean-scene")!;
    let width = 1, height = 1;
    let origin: Point = { x: .5, y: .72 };
    let destination: Point = { x: .7, y: .35 };
    let path = flightPath(origin, destination);
    let frame = 0, elapsed = 0, last = 0, emitted = 0;
    let visible = true, stopped = false, landed = false;
    const particles: Glitter[] = [];

    function halo(point: Point, strength: number, radius = 26) {
      const x = point.x * width, y = point.y * height;
      const glow = ctx!.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(255,234,255,${.9 * strength})`);
      glow.addColorStop(.22, `rgba(222,173,255,${.65 * strength})`);
      glow.addColorStop(1, "rgba(192,139,255,0)");
      ctx!.fillStyle = glow; ctx!.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx!.fillStyle = `rgba(255,244,226,${strength})`;
      ctx!.beginPath(); ctx!.arc(x, y, 2.7, 0, Math.PI * 2); ctx!.fill();
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height);
      if (mode === "idle") return;
      if (mode === "settled") { halo(destination, .65, 20); return; }
      if (mode === "charge" || mode === "release") {
        const strength = mode === "release" ? Math.max(0, 1 - now / 350) : .65 + Math.sin(now / 260) * .15;
        const pulse = reducedMotion ? 0 : (now % 1200) / 1200;
        halo(origin, strength, 19 + pulse * 12);
        if (!reducedMotion) {
          ctx!.strokeStyle = `rgba(214,177,252,${strength * (1 - pulse) * .4})`; ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(origin.x * width, origin.y * height, 12 + pulse * 37, 0, Math.PI * 2); ctx!.stroke();
          for (let i = 0; i < 9; i++) {
            const t = ((now / 1150 + i / 9) % 1), angle = i * 2.4;
            ctx!.fillStyle = `rgba(228,196,255,${t * strength})`;
            ctx!.beginPath(); ctx!.arc(origin.x * width + Math.cos(angle) * (1 - t) * 40, origin.y * height + Math.sin(angle) * (1 - t) * 36, 1.2, 0, Math.PI * 2); ctx!.fill();
          }
        }
        return;
      }
      const travel = Math.min(1, now / FLIGHT_MS);
      const eased = (t: number) => 1 - (1 - t) ** 2;
      while (emitted < 42 && emitted / 42 <= travel) {
        const born = emitted / 42 * FLIGHT_MS;
        if (particles.length < MAX_PARTICLES) particles.push(emitGlitter(emitted, bezierPoint(eased(emitted / 42), path), born));
        emitted++;
      }
      if (travel < 1) {
        for (let i = 0; i < 12; i++) {
          const a = bezierPoint(eased(Math.max(0, travel - (12 - i) * .009)), path);
          const b = bezierPoint(eased(Math.max(0, travel - (11 - i) * .009)), path);
          ctx!.strokeStyle = `rgba(220,176,255,${i / 25})`; ctx!.lineWidth = 1 + i / 8;
          ctx!.beginPath(); ctx!.moveTo(a.x * width, a.y * height); ctx!.lineTo(b.x * width, b.y * height); ctx!.stroke();
        }
        halo(bezierPoint(eased(travel), path), 1, 25 - travel * 7);
      } else {
        if (!landed) {
          landed = true;
          for (let i = 0; i < 20 && particles.length < MAX_PARTICLES; i++) particles.push(emitGlitter(100 + i, destination, FLIGHT_MS, true));
          onLanding();
        }
        const join = Math.min(1, (now - FLIGHT_MS) / JOIN_MS);
        halo(destination, 1 - join * .6, 18 + join * 30);
        for (let i = 0; i < 2; i++) {
          ctx!.strokeStyle = `rgba(216,180,255,${(1 - join) * .3})`; ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(destination.x * width, destination.y * height, 8 + join * (45 + i * 28), 0, Math.PI * 2); ctx!.stroke();
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i], point = sampleGlitter(particle, now);
        if (!point) { particles.splice(i, 1); continue; }
        const x = point.x * width, y = point.y * height;
        ctx!.fillStyle = `rgba(234,201,255,${point.opacity})`; ctx!.beginPath(); ctx!.arc(x, y, point.radius, 0, Math.PI * 2); ctx!.fill();
        if (particle.sparkle) {
          ctx!.strokeStyle = `rgba(255,235,224,${point.opacity * .65})`; ctx!.lineWidth = .8;
          ctx!.beginPath(); ctx!.moveTo(x - point.radius * 2, y); ctx!.lineTo(x + point.radius * 2, y); ctx!.moveTo(x, y - point.radius * 2); ctx!.lineTo(x, y + point.radius * 2); ctx!.stroke();
        }
      }
    }

    function resize() {
      const box = canvas!.getBoundingClientRect();
      width = Math.max(1, box.width); height = Math.max(1, box.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.ceil(width * ratio); canvas!.height = Math.ceil(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      const button = scene.parentElement?.querySelector(".ocean-action > .button")?.getBoundingClientRect();
      const whale = scene.querySelector(".ocean-whale")?.getBoundingClientRect();
      const figures = scene.querySelector(".ocean-crowd")?.getBoundingClientRect();
      const launchY = figures ? figures.top + figures.height * .32 : button ? button.top - 30 : box.top + height * .66;
      origin = { x: .5, y: Math.max(.4, Math.min(.82, (launchY - box.top) / height)) };
      if (whale) destination = { x: Math.max(.2, Math.min(.85, (whale.left - box.left + whale.width * 740 / 900) / width)), y: Math.max(.25, Math.min(.5, (whale.top - box.top + whale.height * 184 / 450) / height)) };
      path = flightPath(origin, destination);
      draw(elapsed);
    }

    function tick(now: number) {
      if (stopped || document.hidden || !visible) return;
      if (last) elapsed += Math.max(0, now - last);
      last = now;
      draw(elapsed);
      if (mode === "flight" && elapsed >= FLIGHT_MS + JOIN_MS) { onComplete(); return; }
      if (mode === "release" && elapsed >= 350) return;
      frame = requestAnimationFrame(tick);
    }
    const animated = !reducedMotion && ["charge", "flight", "release"].includes(mode);
    function resume() {
      cancelAnimationFrame(frame); last = 0;
      scene.dataset.paused = String(document.hidden || !visible);
      if (animated && !stopped && !document.hidden && visible) frame = requestAnimationFrame(tick);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    resize(); resume();
    if (reducedMotion && mode === "flight") { onLanding(); onComplete(); }
    return () => {
      stopped = true; cancelAnimationFrame(frame);
      observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", resume);
    };
  }, [mode, reducedMotion, onLanding, onComplete]);

  return <canvas ref={canvasRef} className="ocean-effects" data-layer="contribution-effects" aria-hidden="true" />;
}
