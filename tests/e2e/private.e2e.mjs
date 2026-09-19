/**
 * Private oqimi E2E: so'rov → email kodi → admin ruxsati → parol → login → private postlar.
 * Dev rejimida (SMTP yo'q) xatlar `.mail-outbox/` ga yoziladi — kod va parol o'sha yerdan o'qiladi.
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node tests/e2e/private.e2e.mjs
 */
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
assert(ADMIN_EMAIL && ADMIN_PASSWORD, "ADMIN_EMAIL va ADMIN_PASSWORD kerak");

const guestEmail = `guest-${Date.now()}@example.com`;
const step = (name) => console.log(`✔ ${name}`);

async function lastMailTo(email, pattern) {
  const files = (await readdir(".mail-outbox")).filter((f) => f.includes(email)).sort();
  assert(files.length, `${email} uchun xat topilmadi`);
  const text = await readFile(`.mail-outbox/${files.at(-1)}`, "utf8");
  const match = text.match(pattern);
  assert(match, `xatda ${pattern} topilmadi`);
  return match[1];
}

const browser = await chromium.launch({ channel: "msedge" });
const guest = await (await browser.newContext()).newPage();
const admin = await (await browser.newContext()).newPage();
const db = new PrismaClient();

try {
  // 1. So'rov
  await guest.goto(`${BASE}/en/private`);
  await guest.getByRole("heading", { name: "This section is locked" }).waitFor();
  await guest.fill('input[name="email"]', guestEmail);
  await guest.fill('textarea[name="message"]', "Hi! I am a friend, please let me in.");
  await guest.getByRole("button", { name: "Request access" }).click();
  await guest.getByRole("heading", { name: "Check your inbox" }).waitFor();
  step("so'rov yuborildi, kod emailga ketdi");

  // 2. Noto'g'ri, keyin to'g'ri kod
  const code = await lastMailTo(guestEmail, /code: (\d{6})/);
  await guest.fill('input[name="code"]', code === "000000" ? "111111" : "000000");
  await guest.getByRole("button", { name: "Confirm" }).click();
  await guest.getByText("Invalid or expired code.").waitFor();
  await guest.fill('input[name="code"]', code);
  await guest.getByRole("button", { name: "Confirm" }).click();
  await guest.getByRole("heading", { name: "Request sent" }).waitFor();
  step("kod tasdiqlandi → PENDING");

  // 3. Admin ruxsat beradi
  await admin.goto(`${BASE}/admin/login`);
  await admin.fill('input[name="email"]', ADMIN_EMAIL);
  await admin.fill('input[name="password"]', ADMIN_PASSWORD);
  await admin.click('button[type="submit"]');
  await admin.waitForURL(`${BASE}/admin`);
  await admin.goto(`${BASE}/admin/requests`);
  const card = admin.locator("article", { hasText: guestEmail });
  await card.getByRole("button", { name: "✓ Ruxsat berish" }).click();
  // So'rov "Kutilmoqda" ro'yxatidan chiqadi, foydalanuvchi pastdagi ro'yxatda paydo bo'ladi
  await admin.locator("li", { hasText: guestEmail }).getByText("Faol").waitFor();
  step("admin ruxsat berdi, parol emailga ketdi");

  // 4. Private login
  const password = await lastMailTo(guestEmail, /Password: (\S+)/);
  await guest.goto(`${BASE}/en/private/login`);
  await guest.fill('input[name="email"]', guestEmail);
  await guest.fill('input[name="password"]', "wrong-password");
  await guest.getByRole("button", { name: "Log in" }).click();
  await guest.getByText("Wrong email or password.").waitFor();
  await guest.fill('input[name="password"]', password);
  await guest.getByRole("button", { name: "Log in" }).click();
  await guest.waitForURL(`${BASE}/en/private`);
  await guest.getByText("Private diary").waitFor();
  step("login → private postlar ko'rinadi");

  // 5. Private post ochiladi, lekin /blog orqali emas
  await guest.goto(`${BASE}/en/private/private-diary`);
  await guest.getByRole("heading", { name: "Private diary" }).waitFor();
  const leak = await guest.request.get(`${BASE}/en/blog/private-diary`);
  assert.equal(leak.status(), 404);
  step("private post ochildi; /blog/ orqali 404");

  // 6. Bloklangan foydalanuvchi kira olmaydi
  await db.privateUser.update({ where: { email: guestEmail }, data: { active: false } });
  await guest.goto(`${BASE}/en/private/private-diary`);
  await guest.waitForURL(`${BASE}/en/private`);
  await guest.getByRole("heading", { name: "This section is locked" }).waitFor();
  step("bloklangan foydalanuvchi qulfga qaytarildi");

  console.log("\nPrivate E2E: hammasi yaxshi ✔");
} catch (error) {
  await guest.screenshot({ path: "test-results/private-guest.png", fullPage: true }).catch(() => {});
  await admin.screenshot({ path: "test-results/private-admin.png", fullPage: true }).catch(() => {});
  console.error("✘", error.message);
  process.exitCode = 1;
} finally {
  await db.privateUser.deleteMany({ where: { email: guestEmail } });
  await db.accessRequest.deleteMany({ where: { email: guestEmail } });
  await db.$disconnect();
  await browser.close();
}
