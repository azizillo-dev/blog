/**
 * Bosh sahifa / postlar / "Blog" (men haqimda) E2E:
 * 2×2 grid (telefon va desktop), "Barchasini ko'rish", pagination, header, ta'lim yozuvi (admin → sayt).
 * Vaqtinchalik 12 ta post yaratadi va oxirida o'chiradi.
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node tests/e2e/layout.e2e.mjs
 */
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
assert(ADMIN_EMAIL && ADMIN_PASSWORD, "ADMIN_EMAIL va ADMIN_PASSWORD kerak");

const PREFIX = `e2e-page-${Date.now()}`;
const step = (name) => console.log(`✔ ${name}`);
const db = new PrismaClient();
const browser = await chromium.launch({ channel: "msedge" });

/**
 * Kartalar joylashuvini tekshiradi. `columns` — kutilgan ustunlar soni; "row" — hammasi bitta qatorda
 * (telefondagi gorizontal karusel). Sahifaning o'zi hech qachon yonga surilmasligi kerak.
 */
async function assertLayout(page, expectedCount, columns) {
  // Ochilish animatsiyalari (translate) tugashini kutamiz; scroll-driven animatsiyalar hech qachon "tugamaydi" — ular chiqarib tashlanadi.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a.timeline instanceof DocumentTimeline).map((a) => a.finished.catch(() => {}))),
  );
  const boxes = await page.locator("main a[href*='/blog/']").evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y) })),
  );
  assert.equal(boxes.length, expectedCount, `kartalar soni ${boxes.length}, kutilgan ${expectedCount}`);
  if (columns === "carousel2") {
    // Mobil bosh sahifa: faqat 2 tasi gorizontal karusel, qolganlari bitta ustunda vertikal
    assert.equal(boxes[0].y, boxes[1].y, "birinchi 2 ta karta bitta qatorda emas");
    const rest = boxes.slice(2);
    assert.equal(new Set(rest.map((b) => b.x)).size, Math.min(1, rest.length), "qolganlari bitta ustunda emas");
    assert.ok(rest.every((b) => b.y > boxes[0].y), "qolganlari karuseldan pastda emas");
  } else assert.equal(new Set(boxes.map((b) => b.x)).size, Math.min(columns, expectedCount), "ustunlar soni noto'g'ri");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, "sahifada gorizontal scroll bor");
}

try {
  const blog = await db.section.findFirstOrThrow({ where: { kind: "BLOG" } });
  const existing = await db.post.count({ where: { sectionId: blog.id, published: true } });
  const extra = Math.max(0, 12 - existing);
  for (let i = 0; i < extra; i++) {
    await db.post.create({
      data: {
        slug: `${PREFIX}-${i}`,
        sectionId: blog.id,
        published: true,
        publishedAt: new Date(Date.now() - (i + 30) * 86_400_000),
        translations: { create: [{ locale: "uz", title: `Sinov posti ${i}` }] },
      },
    });
  }
  const total = existing + extra;

  const devices = [
    { name: "telefon", viewport: { width: 360, height: 800 }, home: "carousel2", list: 1 },
    { name: "desktop", viewport: { width: 1440, height: 900 }, home: 2, list: 2 },
  ];
  for (const { name: device, viewport, home, list } of devices) {
    const page = await browser.newPage({ viewport });

    // Bosh sahifa: 4 ta katta karta (telefonda karusel, desktop'da 2×2)
    await page.goto(`${BASE}/uz/posts`);
    await page.locator("header").getByRole("link", { name: /.+/ }).first().click();
    await page.waitForURL(`${BASE}/uz`);
    await assertLayout(page, 4, home);
    step(`${device}: logo → bosh sahifa, 4 ta post (${home === "carousel2" ? "2 karusel + vertikal" : "2×2"})`);

    // Barchasini ko'rish → 1-sahifa 10 ta
    await page.getByRole("link", { name: /Barcha postlarni ko.rish/ }).click();
    await page.waitForURL(`${BASE}/uz/posts`);
    await assertLayout(page, 10, list);
    await page.getByText(`1 / ${Math.ceil(total / 10)}-sahifa`).waitFor();
    step(`${device}: /posts — 10 ta post, ${list} ustun`);

    // Pagination → 2-sahifa
    await page.getByRole("link", { name: "2", exact: true }).click();
    await page.waitForURL(`${BASE}/uz/posts?page=2`);
    await assertLayout(page, Math.min(10, total - 10), list);
    step(`${device}: pagination 2-sahifa`);

    // Blog → men haqimda
    await page.locator("header").getByRole("link", { name: "About", exact: true }).click();
    await page.waitForURL(`${BASE}/uz/blog`);
    await page.getByRole("heading", { name: "Tajriba" }).waitFor();
    await page.getByRole("heading", { name: "Ta'lim" }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    step(`${device}: About → tajriba va ta'lim`);
    await page.close();
  }

  // Admin: ta'lim qo'shish → saytda ko'rinadi
  const admin = await browser.newPage();
  await admin.goto(`${BASE}/admin/login`);
  await admin.fill('input[name="email"]', ADMIN_EMAIL);
  await admin.fill('input[name="password"]', ADMIN_PASSWORD);
  await admin.click('button[type="submit"]');
  await admin.waitForURL(`${BASE}/admin`);
  await admin.goto(`${BASE}/admin/resume`);
  const form = admin.locator("div", { has: admin.getByRole("heading", { name: "Yangi yozuv" }) }).last();
  await form.locator('select[name="kind"]').selectOption("EDUCATION");
  await form.locator('input[name="organization"]').fill(`${PREFIX} University`);
  await form.locator('input[name="startDate"]').fill("2019-09");
  await form.getByText("Hozir o'qiyapman").click(); // "hozirgacha" belgisini olib tashlaymiz
  await form.locator('input[name="endDate"]').fill("2023-06");
  await form.locator('input[name="title.uz"]').fill("Magistr, AI");
  await form.getByRole("button", { name: "Qo'shish" }).click();
  await admin.locator("summary", { hasText: `${PREFIX} University` }).waitFor();
  step("admin: ta'lim yozuvi qo'shildi");

  await admin.goto(`${BASE}/uz/blog`);
  const entry = admin.locator("li", { hasText: `${PREFIX} University` });
  await entry.getByText("Magistr, AI").waitFor();
  await entry.getByText("3 yil 10 oy").waitFor();
  step("sayt: ta'lim yozuvi va muddat (3 yil 10 oy) ko'rinadi");

  console.log("\nLayout E2E: hammasi yaxshi ✔");
} catch (error) {
  console.error("✘", error.message);
  process.exitCode = 1;
} finally {
  await db.post.deleteMany({ where: { slug: { startsWith: PREFIX } } });
  await db.resumeEntry.deleteMany({ where: { organization: { startsWith: PREFIX } } });
  await db.$disconnect();
  await browser.close();
}
