import { chromium, devices } from "@playwright/test";
const [,, base, ...paginas] = process.argv;
const b = await chromium.launch();
for (const [nome, opts] of [["cel", { ...devices["Pixel 7"], deviceScaleFactor: 1 }], ["desk", { viewport: { width: 1280, height: 800 } }]]) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  for (const pg of paginas) {
    await p.goto(base + pg, { waitUntil: "networkidle" }).catch(() => {});
    await p.waitForTimeout(600);
    await p.screenshot({ path: `/tmp/shots/${nome}-${pg.replace(/[^a-z0-9]+/gi, "_") || "home"}.png`, fullPage: nome === "desk" ? false : false });
  }
  await ctx.close();
}
await b.close();
