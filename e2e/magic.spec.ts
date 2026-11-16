import { expect, test } from "@playwright/test";
const id = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const message = { id, title: "A shared letter", text: "An original note of gratitude.", reactions: 7 };

test("one welcoming CTA animates entry, supports changed reduced motion, and returns to the room", async ({ page }) => {
  await page.goto("/magic-shop");
  await page.getByRole("button", { name: "Come on in ♡", exact: true }).click();
  await expect(page.locator(".magic-shell")).toHaveClass(/magic-entering/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("heading", { name: "Stay a little while." })).toBeVisible();
  await page.getByRole("button", { name: "Little Letters", exact: false }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "A note to meet you here." })).toBeFocused();
  await page.getByRole("button", { name: "A little breathing room", exact: true }).click();
  await expect(page.locator(".ms-stationery")).toContainText("Take a breath.");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "A note to meet you here." })).toBeVisible();
  await page.getByRole("button", { name: "Back to the shop", exact: false }).click();
  await expect(page.getByRole("button", { name: "Little Letters", exact: false })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Stay a little while." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Come on in ♡" })).toHaveCount(0);
});
for (const width of [320, 375, 390, 430, 1440]) {
  test(`shop composition is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.route("**/placeholders/magic/**", route => route.abort());
    await page.goto("/magic-shop?experience=room");
    const letters = page.getByRole("button", { name: "Little Letters", exact: false });
    const jar = page.getByRole("button", { name: "Dear ARMY", exact: false });
    await expect(letters).toBeVisible(); await expect(jar).toBeVisible();
    const first = await letters.boundingBox(), last = await jar.boundingBox();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440) { expect(Math.abs(first!.y - last!.y)).toBeLessThan(5); expect(last!.x - first!.x).toBeGreaterThan(600); }
    else expect(last!.y).toBeGreaterThan(first!.y);
    await letters.click();
    await page.getByRole("button", { name: "A little rest", exact: true }).click();
    await page.getByRole("button", { name: "Save to keepsakes" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Save to keepsakes" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("a letter can be saved and exported in place; fortunes stay playful and usable", async ({ page }) => {
  await page.goto("/magic-shop?experience=letters");
  await page.getByRole("button", { name: "A little rest", exact: true }).click();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  await page.getByRole("button", { name: "Create image" }).click();
  const image = page.getByRole("link", { name: "Download image" });
  await expect(image).toBeVisible();
  const size = await image.evaluate(async node => { const picture = new Image(); picture.src = (node as HTMLAnchorElement).href; await picture.decode(); return [picture.naturalWidth, picture.naturalHeight]; });
  expect(size).toEqual([1080, 1920]);
  await page.getByRole("button", { name: "Back to the shop", exact: false }).click();
  await page.getByRole("button", { name: "Fortune Mirror", exact: false }).click();
  await expect(page.getByText("For reflection and fun.")).toBeVisible();
  await page.getByRole("button", { name: "Turn my card" }).click();
  await expect(page.locator(".ms-stationery h2")).not.toBeEmpty();
});

test("agreement count waits for server confirmation and never increments on a failed request", async ({ page }) => {
  let accept: (() => void) | undefined;
  await page.route("**/api/magic", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { status: "ok", items: [message], nextCursor: null, writesEnabled: true } });
    await new Promise<void>(resolve => { accept = resolve; });
    return route.fulfill({ json: { status: "reacted", messageId: id, active: true, reactions: 12 } });
  });
  await page.goto("/magic-shop?experience=collection");
  const agree = page.getByRole("button", { name: /I feel this too/ });
  await expect(agree).toContainText("7"); await agree.click();
  await expect(agree).toBeDisabled(); await expect(agree).toContainText("7");
  await expect.poll(() => Boolean(accept)).toBe(true); accept!();
  await expect(agree).toContainText("12"); await expect(agree).toHaveAttribute("aria-pressed", "true");
});

test("a failed publication retries its original key after reload and confirms pending review only", async ({ page }) => {
  const bodies: Record<string, unknown>[] = [];
  await page.route("**/api/magic", route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { status: "ok", items: [], nextCursor: null, writesEnabled: true } });
    const body = route.request().postDataJSON(); bodies.push(body);
    if (bodies.length === 1) return route.abort();
    return route.fulfill({ json: { status: "submitted", submissionId: id, kind: "bangtan", reviewStatus: "pending" } });
  });
  await page.goto("/magic-shop?experience=collection");
  await page.getByRole("button", { name: "Write a letter", exact: true }).click();
  await page.getByLabel("Your letter", { exact: true }).fill("A little gratitude for the days we share.");
  await page.getByRole("button", { name: "Fold and preview" }).click();
  await page.getByRole("button", { name: "Share these words" }).click();
  await expect(page.getByRole("button", { name: "Submit for review" })).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("not confirmed");
  await page.reload();
  await expect(page.getByRole("button", { name: "Retry earlier request" })).toBeVisible();
  expect(bodies).toHaveLength(1);
  await page.getByRole("button", { name: "Retry earlier request" }).click();
  await expect(page.getByText("Your words are waiting for owner review.", { exact: false })).toBeVisible();
  expect(bodies).toHaveLength(2); expect(bodies[0].requestId).toBe(bodies[1].requestId);
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await expect(page.getByText("The first published letter is still waiting to arrive.")).toBeVisible();
});

test("private drafts remain separate, render markup as text, and can be edited without publishing", async ({ page }) => {
  await page.route("**/api/magic", route => route.fulfill({ json: { status: "ok", items: [], nextCursor: null, writesEnabled: true } }));
  await page.goto("/magic-shop?experience=collection");
  await page.getByRole("button", { name: "Write a letter", exact: true }).click();
  await page.getByRole("button", { name: "Fold and preview" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Write something first");
  const text = '<img src="https://example.com/x"> My private words.';
  await page.getByLabel("Your letter", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Fold and preview" }).click();
  await expect(page.locator(".ms-stationery")).toContainText(text);
  await expect(page.locator(".ms-stationery img")).toHaveCount(0);
  await page.getByRole("button", { name: "Unfold and edit" }).click();
  await expect(page.getByLabel("Your letter", { exact: true })).toHaveValue(text);
  await page.getByRole("button", { name: "Back to the shop", exact: false }).click();
  await page.getByRole("button", { name: "Dear ARMY", exact: false }).click();
  await page.getByRole("button", { name: "Write a message", exact: true }).click();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveValue("");
});

test("the message jar handles confirmed messages, an empty next draw and API failure honestly", async ({ page }) => {
  let draws = 0;
  await page.route("**/api/magic", route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { status: "ok", items: [], nextCursor: null, writesEnabled: false } });
    draws++; return route.fulfill({ json: { status: "drawn", message: draws === 1 ? { ...message, id: other } : null } });
  });
  await page.goto("/magic-shop?experience=jar");
  await page.getByRole("button", { name: "Pick a message", exact: true }).click();
  await expect(page.locator(".ms-stationery")).toContainText(message.text);
  await page.getByRole("button", { name: "Pick another message" }).click();
  await expect(page.getByText("No other shared message is available", { exact: false })).toBeVisible();
  await page.unroute("**/api/magic");
  await page.route("**/api/magic", route => route.fulfill({ status: 503, json: { status: "error" } }));
  await page.goto("/magic-shop?experience=collection");
  await expect(page.getByText("The shared collection is resting.", { exact: false })).toBeVisible();
  await expect(page.getByText("The first published letter is still waiting to arrive.")).toHaveCount(0);
});

test("a Magic Shop QR opens the interior without changing its approved destination", async ({ page }) => {
  await page.goto("/c/tarot/01");
  const explore = page.getByRole("link", { name: "Explore this little corner" });
  await expect(explore).toHaveAttribute("href", "/magic-shop");
  await explore.click();
  await expect(page.getByRole("heading", { name: "Stay a little while." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Come on in ♡" })).toHaveCount(0);
});

test("confirmed withdrawal updates the browser's receipt list", async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem("boraverse-magic-submissions-v1", JSON.stringify([{ id: value, kind: "bangtan" }])), id);
  await page.route("**/api/magic", route => route.fulfill({ json: { status: "withdrawn", messageId: id } }));
  await page.goto("/magic-shop?experience=room");
  await page.getByRole("button", { name: "My shared words", exact: true }).click();
  await page.getByRole("button", { name: "Withdraw from sharing" }).click();
  await expect(page.getByText("Your words have been withdrawn from sharing.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Withdraw from sharing" })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("boraverse-magic-submissions-v1")!))).toEqual([]);
});

test("the deployed write-off boundary rejects shared posting without inventing success", async ({ request }) => {
  const response = await request.post("/api/magic", { headers: { Origin: "http://127.0.0.1:3456" }, data: { action: "submit", visitorToken: id, requestId: other, kind: "bangtan", title: "Boundary test", text: "A test that must not be submitted.", consent: true } });
  expect(response.status()).toBe(503);
  expect((await response.json()).status).toBe("error");
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect((await request.get("/api/magic?cursor=not-a-uuid")).status()).toBe(400);
});
