import { chromium, expect } from "@playwright/test";
const b = await chromium.launch();
for (let i = 0; i < 4; i++) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.addInitScript(() => { window.__ev = []; for (const t of ["pointerdown","pointerup","pointercancel","lostpointercapture","scroll"]) document.addEventListener(t, (e) => window.__ev.push(t + ":" + (e.target.tagName || "doc") + "@" + Math.round(performance.now())), true); });
  await p.goto("http://localhost:3000/areas/pedra-do-bau");
  const v = p.getByTestId("visualizador-3d");
  await v.scrollIntoViewIfNeeded();
  await expect(v).toHaveAttribute("data-estado", "pronto", { timeout: 30000 });
  const inicial = await v.getAttribute("data-camera");
  const c = await v.locator("canvas").boundingBox();
  const cx = c.x + c.width / 2, cy = c.y + c.height / 2;
  await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 120, cy + 30, { steps: 8 }); await p.mouse.up();
  await p.waitForTimeout(400);
  const c2 = await v.locator("canvas").boundingBox();
  console.log(i, inicial, "->", await v.getAttribute("data-camera"), "box", Math.round(c.y), Math.round(c2.y), (await p.evaluate(() => window.__ev)).join(" "), await p.evaluate(() => document.querySelectorAll('[data-testid="visualizador-3d"] canvas').length));
  await p.close();
}
await b.close();
