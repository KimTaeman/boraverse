export type Point = { x: number; y: number };
export const MAX_SHARED_LIGHTS = 220;
export const MAX_PARTICLES = 64;
export const FLIGHT_MS = 1500;
export const JOIN_MS = 900;

export function oceanProgress(total: number): number {
  return Number.isFinite(total) && total > 0 ? Math.min(1, Math.log1p(total) / Math.log1p(5000)) : 0;
}

export type OceanAppearance = {
  stars: number; whaleLine: number; whaleFill: number; clouds: number;
  horizon: number; haze: number; ambient: number; rim: number;
};

const milestones: { total: number; look: OceanAppearance }[] = [
  { total: 0, look: { stars: 0, whaleLine: .035, whaleFill: 0, clouds: .08, horizon: .035, haze: .02, ambient: 0, rim: 0 } },
  { total: 3, look: { stars: 5, whaleLine: .085, whaleFill: .015, clouds: .12, horizon: .07, haze: .04, ambient: 0, rim: .025 } },
  { total: 50, look: { stars: 32, whaleLine: .27, whaleFill: .12, clouds: .28, horizon: .22, haze: .16, ambient: 5, rim: .08 } },
  { total: 500, look: { stars: 110, whaleLine: .72, whaleFill: .52, clouds: .66, horizon: .65, haze: .6, ambient: 20, rim: .4 } },
  { total: 5000, look: { stars: 220, whaleLine: 1, whaleFill: 1, clouds: .95, horizon: 1, haze: 1, ambient: 48, rim: .85 } },
];

export function oceanAppearance(total: number): OceanAppearance {
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  const index = milestones.findIndex(step => safeTotal <= step.total);
  if (index <= 0) return milestones[index < 0 ? milestones.length - 1 : 0].look;
  const from = milestones[index - 1], to = milestones[index];
  const ratio = (Math.log1p(safeTotal) - Math.log1p(from.total)) / (Math.log1p(to.total) - Math.log1p(from.total));
  const eased = ratio * ratio * (3 - 2 * ratio);
  const mix = (a: number, b: number) => a + (b - a) * eased;
  return {
    stars: mix(from.look.stars, to.look.stars), whaleLine: mix(from.look.whaleLine, to.look.whaleLine),
    whaleFill: mix(from.look.whaleFill, to.look.whaleFill), clouds: mix(from.look.clouds, to.look.clouds),
    horizon: mix(from.look.horizon, to.look.horizon), haze: mix(from.look.haze, to.look.haze),
    ambient: mix(from.look.ambient, to.look.ambient), rim: mix(from.look.rim, to.look.rim),
  };
}

export function sharedLightCount(total: number): number {
  return Math.ceil(oceanAppearance(total).stars);
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
