import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
p.on("console", (m) => { if (m.type() === "error") console.log("console:", m.text().slice(0, 200)); });
const real = process.argv[2] === "real";
if (!real) await p.route("**/tiles.openfreemap.org/**", (r) => r.request().url().includes("/styles/") ? r.fulfill({ contentType: "application/json", body: JSON.stringify({ version: 8, sources: {}, layers: [{ id: "f", type: "background", paint: { "background-color": "#e6e8ea" } }] }) }) : r.abort());
await p.goto("http://localhost:3000/mapa");
await p.waitForFunction(() => window.__mapaPronto === true, null, { timeout: 30000 }).catch(() => console.log("nao ficou pronto"));
for (let i = 0; i < 5; i++) {
  await p.waitForTimeout(1200);
  console.log(i, JSON.stringify(await p.locator(".pino-mapa").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))));
  const g = p.locator('.pino-mapa.grupo[data-areas*="Pedra do Baú"]');
  if (!(await g.count())) break;
  await g.first().click({ timeout: 4000 }).catch((e) => console.log("click fail", String(e).split("\n").slice(0, 6).join(" | ")));
}
console.log(JSON.stringify(await p.locator(".pino-mapa:not(.grupo)").first().evaluate((e) => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, x: r.x, y: r.y, op: c.opacity, vis: c.visibility, disp: c.display, pe: c.pointerEvents, style: e.getAttribute("style") }; })));
await p.waitForTimeout(real ? 4000 : 500);
await p.screenshot({ path: "/tmp/shots/mapa.png" });
await b.close();
