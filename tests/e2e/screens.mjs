/**
 * Vizual tekshiruv: asosiy sahifalarni telefon va desktop o'lchamida, dark/light rejimda suratga oladi.
 * Shuningdek gorizontal scroll (responsive buzilishi) bor-yo'qligini tekshiradi.
 *   node tests/e2e/screens.mjs   → test-results/screens/*.png
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PAGES = ["/uz", "/uz/blog", "/uz/posts","/uz/blog/hello-world", "/ru/certificates", "/en/it", "/uz/projects", "/en/private"];
const VIEWPORTS = { mobile: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

await mkdir("test-results/screens", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
let overflow = 0;

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (scrollX > 0) {
        overflow++;
        console.log(`✘ gorizontal scroll ${scrollX}px: ${device} ${path}`);
      }
      const name = `${device}-${theme}${path.replaceAll("/", "_")}.png`;
      await page.screenshot({ path: `test-results/screens/${name}`, fullPage: true });
    }
    await context.close();
  }
}

await browser.close();
console.log(overflow ? `\n${overflow} ta sahifada gorizontal scroll bor` : "Gorizontal scroll yo'q ✔ — suratlar: test-results/screens/");
process.exitCode = overflow ? 1 : 0;
