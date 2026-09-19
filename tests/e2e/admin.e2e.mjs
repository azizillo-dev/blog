/**
 * Brauzer E2E: 5-click admin eshigi, login, post yaratish, rasm yuklash.
 * Ishga tushirish (server ishlab turgan bo'lishi kerak):
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node tests/e2e/admin.e2e.mjs
 * Tizimdagi Edge ishlatiladi (playwright-core, brauzer yuklab olinmaydi).
 */
import { chromium } from "playwright-core";
import sharp from "sharp";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
assert(ADMIN_EMAIL && ADMIN_PASSWORD, "ADMIN_EMAIL va ADMIN_PASSWORD kerak");

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
const step = (name) => console.log(`✔ ${name}`);

try {
  // 1. Yashirin eshik: theme tugmasini 5 marta bosish
  await page.goto(`${BASE}/en`);
  const toggle = page.getByRole("button", { name: "Toggle theme" });
  for (let i = 0; i < 5; i++) await toggle.click();
  await page.waitForURL("**/admin/login");
  step("5-click → /admin/login");

  // 2. Noto'g'ri parol
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', "wrong-password");
  await page.click('button[type="submit"]');
  await page.getByText("Email yoki parol noto'g'ri.").waitFor();
  step("noto'g'ri parol rad etildi");

  // 3. To'g'ri login
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin`);
  step("login");

  // 4. Rasm yuklash API
  const png = await sharp({ create: { width: 64, height: 40, channels: 3, background: "#5b4cf0" } }).png().toBuffer();
  const upload = await page.request.post(`${BASE}/api/upload`, {
    multipart: { file: { name: "t.png", mimeType: "image/png", buffer: png } },
  });
  const body = await upload.text();
  assert.ok(upload.ok(), `upload HTTP ${upload.status()}: ${body.slice(0, 300)}`);
  const { url } = JSON.parse(body);
  // Lokal disk: /uploads/2026/09/x.webp · R2: https://<public>/2026/09/x.webp
  assert.match(url, /^(\/uploads|https:\/\/[^/]+)\/\d{4}\/\d{2}\/[a-f0-9]+\.webp$/);
  const img = await page.request.get(url.startsWith("/") ? `${BASE}${url}` : url);
  assert.equal(img.headers()["content-type"], "image/webp", `rasm ochilmadi: HTTP ${img.status()} ${url}`);
  step(`rasm yuklandi → ${url}`);

  // 5. Post yaratish (blok-editor bilan)
  const slug = `e2e-${Date.now()}`;
  await page.goto(`${BASE}/admin/posts/new`);
  await page.fill('input[name="slug"]', slug);
  await page.fill('input[name="coverImage"]', url);
  await page.fill('input[name="title.uz"]', "E2E sinov posti");
  await page.getByRole("button", { name: "Matn" }).first().click();
  await page.locator('[role="tabpanel"]:not([hidden]) textarea').last().fill("Salom **dunyo**");
  await page.getByRole("button", { name: "Saqlash" }).click();
  await page.waitForURL(/\/admin\/posts\/\w+\?saved=1/);
  step("post yaratildi");

  // 6. Ommaviy sahifada ko'rinadi
  await page.goto(`${BASE}/uz/blog/${slug}`);
  await page.getByRole("heading", { name: "E2E sinov posti" }).waitFor();
  assert.equal(await page.locator(".prose-content strong").textContent(), "dunyo");
  step("post saytda ko'rinadi");

  // 7. Tozalash: postni o'chirish
  await page.goBack();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "O'chirish", exact: true }).click();
  await page.waitForURL(`${BASE}/admin/posts`);
  step("post o'chirildi");

  // 8. Loyiha qo'shish → saytda ko'rinadi → o'chirish
  const projectTitle = `E2E loyiha ${Date.now()}`;
  await page.goto(`${BASE}/admin/projects`);
  const newProject = page.locator("div", { has: page.getByRole("heading", { name: "Yangi loyiha" }) }).last();
  await newProject.locator('input[name="image"]').fill(url);
  await newProject.locator('input[name="technologies"]').fill("Next.js, Go, next.js");
  await newProject.locator('input[name="demoUrl"]').fill("https://example.com");
  await newProject.locator('input[name="title.uz"]').fill(projectTitle);
  await newProject.getByRole("button", { name: "Qo'shish" }).click();
  await page.locator("summary", { hasText: projectTitle }).waitFor();
  step("loyiha qo'shildi");

  await page.goto(`${BASE}/uz/projects`);
  const card = page.locator("article", { hasText: projectTitle });
  await card.waitFor();
  assert.deepEqual(await card.locator("li").allTextContents(), ["Next.js", "Go"]);
  step("loyiha saytda: texnologiyalar takrorsiz");

  await page.goto(`${BASE}/admin/projects`);
  const item = page.locator("details", { hasText: projectTitle });
  await item.locator("summary").click();
  page.once("dialog", (d) => d.accept());
  await item.getByRole("button", { name: "O'chirish", exact: true }).click();
  await item.waitFor({ state: "detached" });
  step("loyiha o'chirildi");

  console.log("\nAdmin E2E: hammasi yaxshi ✔");
} catch (error) {
  await page.screenshot({ path: "test-results/admin-failure.png", fullPage: true }).catch(() => {});
  console.error("✘", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
