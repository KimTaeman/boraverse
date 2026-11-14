export type Point = { x: number; y: number };
export const MAX_SHARED_LIGHTS = 220;
export const MAX_PARTICLES = 64;
export const FLIGHT_MS = 1500;
export const JOIN_MS = 900;

export function oceanProgress(total: number): number {
  return Number.isFinite(total) && total > 0 ? Math.min(1, Math.log1p(total) / Math.log1p(5000)) : 0;
}

export function sharedLightCount(total: number): number {
  return total > 0 ? Math.ceil(oceanProgress(total) * MAX_SHARED_LIGHTS) : 0;
}

export function seeded(index: number): number {
  let value = (index + 1) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

export const sharedStars = Array.from({ length: MAX_SHARED_LIGHTS }, (_, i) => ({
  x: .03 + seeded(i * 3) * .94,
  y: .23 + seeded(i * 3 + 1) * .45,
  radius: .7 + seeded(i * 3 + 2) * 1.5,
}));

export function flightPath(origin: Point, destination: Point): Point[] {
  const rise = Math.max(.1, origin.y - destination.y);
  return [origin, { x: Math.max(.1, origin.x - .23), y: origin.y - rise * .2 },
    { x: Math.min(.9, destination.x + .14), y: destination.y + rise * .25 }, destination];
}

export function bezierPoint(t: number, points: Point[]): Point {
  const v = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
  const u = 1 - v;
  const weights = [u ** 3, 3 * u ** 2 * v, 3 * u * v ** 2, v ** 3];
  return points.reduce((point, control, i) => ({ x: point.x + control.x * weights[i], y: point.y + control.y * weights[i] }), { x: 0, y: 0 });
}

export type Glitter = Point & { vx: number; vy: number; born: number; life: number; radius: number; sparkle: boolean };
export function emitGlitter(index: number, point: Point, born: number, burst = false): Glitter {
  const angle = seeded(index * 5) * Math.PI * 2;
  const speed = (burst ? .035 : .012) + seeded(index * 5 + 1) * .025;
  return { ...point, born, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed + (burst ? 0 : .012),
    life: 600 + seeded(index * 5 + 2) * 850, radius: 1 + seeded(index * 5 + 3) * 2, sparkle: index % 5 === 0 };
}

export function sampleGlitter(particle: Glitter, now: number) {
  const age = now - particle.born;
  if (age < 0 || age >= particle.life) return null;
  const remaining = 1 - age / particle.life;
  return { x: particle.x + particle.vx * age / 1000, y: particle.y + particle.vy * age / 1000,
    opacity: remaining ** 2, radius: particle.radius * (.3 + remaining * .7) };
}
