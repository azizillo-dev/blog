# Shaxsiy blog

Next.js 15 · Tailwind v4 · Prisma (SQLite) · UZ / RU / EN · dark / light.
Arxitektura: [architecture.md](architecture.md) · Jarayon: [process.md](process.md)

## Ishga tushirish

```bash
npm install
cp .env.example .env                 # AUTH_SECRET va ADMIN_* ni to'ldiring
npm run hash -- "kuchli-parol"       # chiqqan qatorni .env dagi ADMIN_PASSWORD_HASH ga qo'ying
npm run db:push && npm run db:seed
npm run dev                          # http://localhost:3000
```

## Admin panel

Saytdagi theme (oy/quyosh) tugmasini **1.5 soniya ichida ketma-ket 5 marta** bosing → `/admin/login`.
To'g'ridan-to'g'ri `/admin` manzili ham ishlaydi (parolsiz kirib bo'lmaydi).

Admin panelda: postlar (blok-editor), bo'limlar (yangi bo'lim qo'shish), sertifikatlar, About me,
ijtimoiy tarmoqlar (footer), Private so'rovlar va foydalanuvchilar, sozlamalar (sayt nomi, LeetCode username).

## Private bo'lim

Mehmon email + xabar yuboradi → emailga 6 xonali kod → kodni kiritadi → so'rov admin panelga tushadi →
"Ruxsat berish" → tasodifiy parol emailga yuboriladi → mehmon email + parol bilan kiradi.

Haqiqiy xatlar uchun `.env` da `SMTP_*` ni to'ldiring (masalan Gmail: `smtp.gmail.com`, port `465`,
[App Password](https://myaccount.google.com/apppasswords)). SMTP bo'lmasa dev rejimda xatlar `.mail-outbox/` ga yoziladi.

## Testlar

```bash
npm test                 # unit (vitest)
npm run build && npm start
npm run smoke            # HTTP smoke
ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run e2e   # brauzer E2E (Windows Edge)
npm run screens          # responsive suratlar → test-results/screens/
```

## Deploy

Node server kerak (VPS, Railway, Render ...). `storage/` (rasmlar) va `prisma/dev.db` doimiy diskda bo'lsin.
Serverless (Vercel) uchun: DB → PostgreSQL (`schema.prisma` da `provider`), rasmlar → S3/R2.
