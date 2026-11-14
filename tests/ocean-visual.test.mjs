import { test } from "node:test";
import assert from "node:assert/strict";
import { oceanProgress, sharedLightCount, sharedStars, flightPath, bezierPoint, emitGlitter, sampleGlitter, MAX_PARTICLES } from "../src/lib/ocean/visual.ts";

test("confirmed totals create monotonic, bounded progression without invented lights at zero", () => {
  for (const value of [-1, NaN, Infinity, 0]) assert.equal(oceanProgress(value), 0);
  const levels = [0, 3, 50, 200, 500, 1000, 5000, Number.MAX_SAFE_INTEGER];
  const progress = levels.map(oceanProgress);
  for (let i = 1; i < progress.length; i++) assert.ok(progress[i] >= progress[i - 1] && progress[i] <= 1);
  assert.equal(progress.at(-1), 1);
  assert.equal(sharedLightCount(0), 0);
  assert.equal(sharedLightCount(5000), 220);
  assert.equal(sharedLightCount(Number.MAX_SAFE_INTEGER), 220);
  assert.ok(oceanProgress(3) < oceanProgress(50) && oceanProgress(500) < oceanProgress(5000));
});

test("the bounded star field retains every existing position as the total grows", () => {
  assert.equal(sharedStars.length, 220);
  const before = sharedStars.slice(0, sharedLightCount(3));
  const after = sharedStars.slice(0, sharedLightCount(500));
  assert.deepEqual(after.slice(0, before.length), before);
  for (const star of sharedStars) assert.ok(star.x > 0 && star.x < 1 && star.y > .2 && star.y < .7);
});

test("curved ascent has exact endpoints and stays visible at phone and desktop proportions", () => {
  for (const destination of [{ x: .8, y: .35 }, { x: .65, y: .4 }]) {
    const origin = { x: .5, y: .72 }, path = flightPath(origin, destination);
    assert.deepEqual(bezierPoint(-1, path), origin);
    assert.deepEqual(bezierPoint(2, path), destination);
    assert.notEqual(bezierPoint(.3, path).x, origin.x + (destination.x - origin.x) * .3);
    for (let i = 0; i <= 100; i++) {
      const point = bezierPoint(i / 100, path);
      assert.ok(point.x >= .1 && point.x <= .9 && point.y >= .25 && point.y <= .8);
    }
  }
});

test("independent glitter disperses, fades and expires within a fixed particle budget", () => {
  const particles = Array.from({ length: 62 }, (_, i) => emitGlitter(i, { x: .5, y: .4 }, 0, i >= 42));
  assert.ok(particles.length <= MAX_PARTICLES);
  assert.notDeepEqual(particles[0], particles[1]);
  for (const particle of particles) {
    const initial = sampleGlitter(particle, 0), later = sampleGlitter(particle, 300);
    assert.ok(later.opacity < initial.opacity);
    assert.ok(later.radius < initial.radius);
    assert.notDeepEqual({ x: later.x, y: later.y }, { x: initial.x, y: initial.y });
    assert.equal(sampleGlitter(particle, 1500), null);
    assert.equal(sampleGlitter(particle, -1), null);
  }
});
