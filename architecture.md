

# Arxitektura — Shaxsiy blog sayt

> Bu fayl loyihaning yagona manbasi (source of truth). Har qanday agent/dasturchi ishni shu fayl va
> `process.md` ni o'qib boshlaydi. Arxitektura o'zgarsa — avval shu faylni yangilang.

## 1. Maqsad

Yengil, 120 Hz da silliq ishlaydigan, 100% responsive shaxsiy blog:

- **Bosh sahifa** (`/uz`, logo) — so'nggi 4 post 2×2 (telefonda ham 2 ustun) + "Barcha postlarni ko'rish" →
  `/posts` (2 ustun, 10 tadan pagination `?page=N`).
- **Blog** menyusi (`/uz/blog`) — muallif haqida: matn/rasm bloklari + Tajriba + Ta'lim (LinkedIn uslubi,
  `ResumeEntry`) + Ko'nikmalar (`Setting.skills`). Postlar URL'i `/uz/blog/<slug>` o'zgarmagan.
- Admin paneldan yangi bo'limlar (section) qo'shish.
- **More** menyusi:
  - **Sertifikatlar** — rasm, qayerdan olingani, sana, havola.
  - **Loyihalar** (`/projects`) — rasm, tavsif, texnologiyalar (chip), demo va kod havolalari.
- **Men haqimda** — "Blog" sahifasida; blok-editor: matn va rasmlarni istalgan tartib/joylashuvda qo'yish.
  Eski `/about` → `/blog` ga 308 redirect.
  - **Private** — qulflangan bo'lim (pastdagi oqimga qarang).
  - **IT** — IT karyera postlari + LeetCode statistikasi.
- **RU / EN / UZ** tillari, **dark / light** rejim.
- **Footer** — ijtimoiy tarmoqlar admin paneldan boshqariladi.
- **Admin panelga kirish** — theme toggle tugmasini ketma-ket 5 marta bosish → `/admin/login`
  (bu faqat "yashirin eshik"; himoya — parol + imzolangan sessiya cookie).

## 2. Stack

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** | SSR/ISR, server actions, `next/image` |
| Stil | **Tailwind CSS v4** + CSS o'zgaruvchilar (theme tokenlar) | JS runtime yo'q, kichik CSS |
| Animatsiya | **Faqat CSS** (`transform`/`opacity`) + `IntersectionObserver` | GPU-da, 120 Hz, 0 KB kutubxona |
| DB | **Prisma + PostgreSQL (Neon)** — `DATABASE_URL` pooled, `DIRECT_URL` db push uchun | bepul, serverless |
| Rasm saqlash | **Cloudflare R2** (`aws4fetch`); R2 sozlanmagan bo'lsa lokal `storage/uploads` (faqat dev) | 10 GB bepul |
| Hosting | **Vercel** Hobby, region `fra1` (`vercel.json`) — qadamlar: `DEPLOY.md` | bepul |
| Auth | **jose** (HS256 JWT, httpOnly cookie) + **bcryptjs** | edge-mos, yengil |
| Email | **nodemailer** (SMTP). SMTP yo'q bo'lsa — konsolga log (dev) | |
| Validatsiya | **zod** | server action kirishlari |
| Rasm | `sharp` (yuklashda WebP ga siqish) + `next/image` | tez yuklanish |
| i18n | O'zimizning yengil lug'atlar (`src/i18n/*.ts`) + `[locale]` segment + middleware | kutubxonasiz |
| Test | **vitest** (unit) + `next build` + HTTP smoke (`scripts/smoke.mjs`) + E2E (**playwright-core** + tizimdagi Edge) | brauzer yuklanmaydi |

## 3. Papka tuzilmasi

```
prisma/
  schema.prisma          # DB sxemasi
  seed.ts                # boshlang'ich ma'lumot (bo'limlar, sozlamalar)
storage/uploads/         # admin yuklagan rasmlar (WebP, git'da yo'q) → /uploads/... route orqali beriladi
                         # (public/ emas: `next start` build'dan keyin qo'shilgan fayllarni bermaydi)
scripts/smoke.mjs        # ishlayotgan serverga smoke test
scripts/hash-password.ts # admin parol hash
src/
  middleware.ts          # locale redirect + /admin himoyasi
  app/
    layout.tsx           # root: <html>, theme no-flash script, font
    globals.css          # tokenlar, animatsiyalar
    [locale]/            # ommaviy sahifalar
      layout.tsx         # Header, Footer, ThemeToggle
      page.tsx           # → blog bosh sahifa
      blog/[slug]/       # post sahifasi
      s/[section]/       # istalgan bo'lim (it, private, custom)
      certificates/
      about/
      private/           # qulf: so'rov / kod / login / postlar
    admin/               # admin panel (tilsiz, faqat UZ interfeys)
      login/
      (panel)/           # himoyalangan: posts, sections, certificates, about, socials, requests, settings
    api/upload/          # rasm yuklash (faqat admin)
    uploads/[...path]/   # yuklangan rasmlarni berish (immutable kesh)
  components/
    layout/              # Header, MoreMenu, LangSwitch, Footer, FloatingDock (theme + 5-click)
    content/             # BlockRenderer, PostCard, FeaturedPosts, LeetcodeCard ...
    admin/               # BlockEditor, ImageInput, LocaleTabs, *Form
    private/             # PrivateGate (so'rov→kod→kutish), PrivateLoginForm
    ui/form.tsx          # ActionForm, Field, Input, SubmitButton ... (umumiy)
  features/              # domen bo'yicha: posts, sections, certificates, about, socials, private, leetcode
    <feature>/queries.ts # o'qish (server)
    <feature>/actions.ts # yozish ("use server")
    <feature>/schema.ts  # zod
  lib/                   # db, auth, mail, i18n helpers, markdown-lite, utils
  i18n/                  # uz.ts, ru.ts, en.ts lug'atlar
tests/                   # vitest (*.test.ts)
tests/e2e/               # admin.e2e.mjs, private.e2e.mjs, screens.mjs (responsive suratlar)
```

### Muhim qoidalar (kod yozishda)

- **Formalar:** `<form action>` emas, `ActionForm` (`components/ui/form.tsx`). React 19 action'dan keyin
  formani tozalaydi — xato bo'lsa kiritilgan matn yo'qolardi.
- **Murakkab vidjet** (tugmali) `Field` ichida bo'lsa — `<Field group>` (aks holda `<label>` ichida tugma bo'ladi).
- **Server action** doim `await requireAdmin()` bilan boshlanadi, yozgandan keyin `revalidateSite()`.
- **Tarjimalar** formada `title.uz`, `title.ru`, ... → `readLocalized()`; saqlashda `deleteMany + create`.

Qoida: **feature-first**. UI komponent DB ga to'g'ridan-to'g'ri murojaat qilmaydi — faqat `features/*/queries.ts`.

## 4. Ma'lumotlar modeli (Prisma)

- `Section` — `slug`, `kind` (`BLOG` | `IT` | `PRIVATE` | `CUSTOM`), `inNav` (`MAIN` | `MORE`), `order`,
  `translations` (`SectionTranslation`: `locale`, `title`, `description`).
- `Post` — `slug`, `sectionId`, `coverImage`, `published`, `publishedAt`,
  `translations` (`PostTranslation`: `locale`, `title`, `excerpt`, `blocks` (JSON string)).
- `Page` — `key` (`about`), `translations` (`PageTranslation`: `locale`, `title`, `blocks`).
- `Certificate` — `image`, `issuer`, `issuedAt`, `url`, `order`, `translations` (`title`, `description`).
- `Project` — `image`, `technologies` (vergulli satr → `parseTechnologies`), `demoUrl`, `sourceUrl`, `order`,
  `visible`, `translations` (`title`, `description`).
- `ResumeEntry` — `kind` (`EXPERIENCE` | `EDUCATION`), `organization`, `logo`, `location`, `url`, `startDate`,
  `endDate` (null = hozirgacha), `order`, `translations` (`title` = lavozim/daraja, `description`).
- `SocialLink` — `platform` (ikon kaliti), `label`, `url`, `order`, `visible`.
- `Setting` — `key`/`value` (masalan `leetcodeUsername`, `siteTitle`).
- `AccessRequest` — `email`, `message`, `codeHash`, `codeExpiresAt`, `attempts`,
  `status` (`UNVERIFIED` → `PENDING` → `APPROVED` | `REJECTED`).
- `PrivateUser` — `email` (unique), `passwordHash`, `active`.

Tarjima yo'q bo'lsa fallback tartibi: joriy til → `uz` → `en` → `ru` → birinchi mavjud.

### Kontent bloklari (`blocks` JSON)

```ts
type Block =
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'paragraph'; text: string }            // **qalin**, *kursiv*, `kod`, [havola](url)
  | { type: 'image'; src: string; alt: string; caption?: string; layout: 'full' | 'wide' | 'left' | 'right' | 'center' }
  | { type: 'gallery'; images: { src: string; alt: string }[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'divider' }
  | { type: 'embed'; url: string }                  // YouTube
```

`left`/`right` — rasm matn yonida (float), mobil ekranda to'liq kenglik. Admin editorda bloklarni
qo'shish / yuqoriga-pastga surish / o'chirish mumkin → "istalgan joyga qo'yish".

## 5. Private oqimi

```
Mehmon: /private → email + xabar → server 6 xonali kod yuboradi (bcrypt hash, 10 daq, 5 urinish)
Mehmon: kodni kiritadi → status PENDING (admin panel "Private so'rovlar"da ko'rinadi)
Admin: "Ruxsat berish" → tasodifiy parol yaratiladi → PrivateUser (hash) → parol emailga yuboriladi
Admin: "Rad etish" → status REJECTED (ixtiyoriy xabar)
Mehmon: /private/login → email + parol → `private_session` cookie (JWT, 30 kun)
Mehmon: /private → PRIVATE bo'limidagi postlar
Admin: foydalanuvchini o'chirishi/bloklashi mumkin
```

Rate-limit: IP+email bo'yicha xotiradagi oddiy limiter (`lib/rate-limit.ts`).

## 6. Auth

- Admin: `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (.env). Login → `admin_session` cookie (JWT, 7 kun).
- Middleware `/admin/*` (login'dan tashqari) — cookie tekshiradi; server actionlar ham `requireAdmin()` chaqiradi.
- `AUTH_SECRET` — JWT imzo kaliti (min 32 belgi).

## 7. Performance qoidalari (120 Hz)

1. Animatsiya faqat `transform` va `opacity`; `will-change` faqat hover/aktiv paytida.
2. `prefers-reduced-motion` hurmat qilinadi.
3. Client JS minimal: faqat ThemeToggle, LangSwitch, MoreMenu, Reveal, admin formalar.
4. Ommaviy sahifalar — server komponentlar + ISR (`revalidatePath` admin yozganda).
5. Rasmlar: yuklashda WebP (max 1920px), `next/image` `sizes` bilan, birinchi ekrandagisi `priority`.
6. Font: `next/font` (Inter/Manrope), `display: swap`, subset `latin`, `cyrillic`.
7. Theme: `<head>` dagi inline script → yuklanishda "miltillash" yo'q.

## 8. Muhit o'zgaruvchilari (`.env.example`)

```
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
R2_ACCOUNT_ID= R2_ACCESS_KEY_ID= R2_SECRET_ACCESS_KEY= R2_BUCKET= R2_PUBLIC_URL=
AUTH_SECRET="..."                # 32+ belgi
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD_HASH="..."        # npm run hash -- "parol"
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= MAIL_FROM=
SITE_URL="http://localhost:3000"
MAIL_OUTBOX="1"                  # test rejimi: SMTP bo'lsa ham xatlar faqat .mail-outbox/ ga (E2E uchun)
```

SMTP bo'sh: dev'da xatlar `.mail-outbox/` ga yoziladi; prod'da xato (xat "jim" yo'qolmasin).

## 9. Buyruqlar

```
npm run dev        # ishlab chiqish
npm run build      # prod build
npm test           # vitest
npm run db:push    # sxemani DB ga
npm run db:seed    # boshlang'ich ma'lumot
npm run hash -- "parol"   # admin parol hash
npm run smoke      # ishlayotgan serverga smoke test
npm run e2e        # brauzer E2E (ADMIN_EMAIL, ADMIN_PASSWORD env kerak; server ishlab tursin)
npm run screens    # telefon/desktop × dark/light suratlar + gorizontal scroll tekshiruvi
```
