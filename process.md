# Jarayon (process)

> Har bosqich tugagach: test → `[x]` belgilash → qisqa izoh. Keyingi agent birinchi `[ ]` dan davom etadi.
> Batafsil dizayn: `architecture.md`.

| # | Bosqich (stack) | Holat | Test | Izoh |
|---|---|---|---|---|
| 1 | Setup: Next.js 15 + TS + Tailwind v4 + vitest | [x] | paketlar o'rnatildi | Node 20 → vitest@3 |
| 2 | DB: Prisma sxema + seed | [x] | seed: 3 bo'lim, 4 post, 12 tarjima | SQLite `prisma/dev.db` |
| 3 | Lib: auth (jose/bcrypt), mail, rate-limit, markdown-lite, i18n | [x] | vitest 13/13 | `tests/lib.test.ts` |
| 4 | Layout: theme (no-flash), til almashtirish, Header/More menyu, Footer, 5-click admin | [x] | tsc ✔, /uz /ru /en → 200 | FloatingDock.tsx: 5 bosish → /admin |
| 5 | Blog: bosh sahifa (hero + kartalar), post sahifasi, custom bo'limlar | [x] | post 200, private post /blog da ko'rinmaydi | bento (desktop) / scroll-snap (mobil) |
| 6 | Sertifikatlar + About (blok renderer) | [x] | /uz/certificates, /ru/about → 200 | Lightbox: native `<dialog>` |
| 7 | IT bo'limi + LeetCode statistikasi | [x] | vitest 15/15, real API (lee215) karta chiqdi | 1 soat kesh; username — Settings |
| 8 | Admin: login + panel (posts, sections, certificates, about, socials, settings, upload) | [x] | `tests/e2e/admin.e2e.mjs` ✔ (5-click, login, upload, post CRUD) | `ActionForm` — React 19 forma tozalashini oldini oladi |
| 9 | Private oqimi (so'rov → kod → admin ruxsat → parol → login → postlar) | [x] | `tests/e2e/private.e2e.mjs` ✔ (6 qadam, blok ham) | dev: xatlar `.mail-outbox/` da |
| 10 | Yakuniy: responsive/perf tekshiruv, build, smoke test, README | [x] | build ✔, eslint ✔, prod: smoke 15/15, E2E ✔, screens: overflow yo'q | ommaviy sahifalar ISR, ~110 kB JS |
| 11 | Loyihalar bo'limi + "Men haqimda" Blog tepasiga, til More ichida | [x] | vitest 17/17, smoke 20/20, admin+private E2E ✔, screens ✔ | E2E: server `MAIL_OUTBOX=1` bilan (haqiqiy xat ketmasin) |
| 12 | Bosh sahifa 4 post (katta kartalar: mobil karusel, desktop 2×2 — foydalanuvchi ixcham 2×2 mobilni rad etdi) + /posts pagination; "Blog" = men haqimda + tajriba/ta'lim/ko'nikmalar (admin) | [x] | vitest 22/22, smoke 24/24, admin+private E2E (prod) ✔, `layout.e2e.mjs` 10/10 (dev), screens ✔ | layout E2E dev'da: DB'ga to'g'ridan yozilgan postlarni prod ISR darhol ko'rmaydi |
| 13 | Deploy: SQLite → Neon Postgres, rasmlar → R2, Vercel, .uz domen (`DEPLOY.md`) | [ ] | kod ✔ (tsc, eslint, vitest 22/22); Neon/R2 kalitlari kutilmoqda | zaxira: `data/export.json`, `data/dev.db.backup` |

## Log

- 2026-09-19: C diskda joy tugadi (ENOSPC) → npm kesh tozalandi (~6 GB). Yana chiqsa: `%LOCALAPPDATA%\npm-cache\_cacache` ni o'chiring.
- 1–2 bosqich tugadi.
- 3–10 bosqich tugadi. Barcha testlar production build'da o'tdi.
- 11-bosqich: "Men haqimda" menyudan olindi → Blog tepasiga; menyuda "Loyihalar"; til tanlash "Ko'proq" ichida.

## Keyingi g'oyalar (ixtiyoriy, hali qilinmagan)

- [x] Haqiqiy SMTP sozlandi (Gmail, `.env`; `verify()` ✔ — 2026-09-19)
- [ ] Real kontent kiritish
- [x] Postlar sahifalash (`/posts?page=N`, 10 tadan)
- [ ] Qidiruv, RSS/sitemap.xml
- [ ] Kod bloklari uchun sintaksis rang berish (shiki, server-side)
- [ ] Deploy (VPS / PostgreSQL + S3)




