# Deploy: Vercel + Neon + Cloudflare R2 + .uz domen

Hammasi bepul, faqat domen pullik (yiliga). Tartib muhim — yuqoridan pastga.

## 1. Neon — ma'lumotlar bazasi (PostgreSQL)

Neon hisobi Vercel orqali ochilgan bo'lsa, yangi baza **faqat Vercel panelidan** yaratiladi:

1. https://vercel.com/dashboard → yuqoridagi **Storage** tab → **Create Database** → **Neon** → Continue.
2. **Region: Frankfurt (eu-central-1)**, plan: **Free**, nomi: `blog-db` → **Create**.
3. Baza sahifasi → **.env.local** tab → **Show secret** → `DATABASE_URL` va `DATABASE_URL_UNPOOLED` ni
   lokal `.env` ga nusxalang.
4. Vercel loyihasi yaratilgach (4-qadam): baza → **Connect Project** → `blog` — o'zgaruvchilar avtomatik qo'shiladi.

## 2. Cloudflare R2 — rasmlar

1. https://dash.cloudflare.com → ro'yxatdan o'ting.
2. Chap menyu **R2 Object Storage** → **Purchase/Enable R2** (bepul tarif, karta so'rashi mumkin, 10 GB gacha pul yechilmaydi).
3. **Create bucket**: nomi `blog-media`, joylashuv — Automatic.
4. Bucket → **Settings → Public access → R2.dev subdomain → Allow**. Chiqqan `https://pub-....r2.dev` → bu `R2_PUBLIC_URL`.
   (Domen olgandan keyin: **Custom Domains → Connect** `media.sizning-domen.uz` — ixtiyoriy.)
5. R2 bosh sahifasi → **Manage R2 API Tokens → Create API token**:
   - Permissions: **Object Read & Write**, faqat `blog-media` bucket.
   - Chiqqan **Access Key ID** → `R2_ACCESS_KEY_ID`, **Secret Access Key** → `R2_SECRET_ACCESS_KEY`.
   - **Account ID** (R2 sahifasining o'ng tomonida) → `R2_ACCOUNT_ID`.
6. `R2_BUCKET="blog-media"`.

## 3. Ma'lumotlarni ko'chirish (lokal kompyuterda, bir marta)

`.env` ga yuqoridagi qiymatlarni yozing, keyin:

```bash
npx prisma db push            # jadvallarni Neon'da yaratadi
npm run images:to-r2          # storage/uploads → R2
npm run db:import             # data/export.json → Neon (rasm havolalari R2 ga almashadi)
npm run dev                   # tekshirish: http://localhost:3000
```

## 4. GitHub → Vercel

1. https://github.com da yangi **private** repo oching (masalan `blog`) va kodni yuklang:
   ```bash
   git add -A && git commit -m "Initial blog"
   git branch -M main
   git remote add origin https://github.com/<login>/blog.git
   git push -u origin main
   ```
2. https://vercel.com → **Sign up with GitHub** → **Add New → Project** → `blog` repo → **Import**.
3. **Environment Variables** ga `.env` dagi hamma qiymatlarni qo'shing, **2 ta farq bilan**:
   - `ADMIN_PASSWORD_HASH` — `\` belgilarisiz (`$2b$10$...` ko'rinishida).
   - `SITE_URL` — `https://sizning-domen.uz` (domen ulanmaguncha `https://<loyiha>.vercel.app`).
   - `MAIL_OUTBOX` ni **qo'shmang**.
4. **Deploy**. 1–2 daqiqadan so'ng sayt `https://<loyiha>.vercel.app` da ochiladi.

Keyin har `git push` — avtomatik yangi deploy.

## 5. .uz domenni ulash

1. Domen oling (akkreditatsiyalangan registratorlar ro'yxati: https://cctld.uz).
2. Vercel → Project → **Settings → Domains** → `sizning-domen.uz` va `www.sizning-domen.uz` ni qo'shing.
3. Vercel ko'rsatgan DNS yozuvlarini registrator panelida kiriting (odatda):
   | Turi | Nomi | Qiymati |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |
   **Vercel ekranida boshqa qiymat ko'rsatilsa — o'shani yozing.**
4. 10 daqiqadan 24 soatgacha kuting — Vercel HTTPS sertifikatini o'zi beradi.
5. Vercel'da `SITE_URL` ni `https://sizning-domen.uz` ga o'zgartiring → **Redeploy**.

## Keyinchalik

- **Sxema o'zgarsa:** lokal `.env` Neon'ga qarab turgan holda `npx prisma db push`, keyin `git push`.
- **Zaxira:** `npm run db:export` → `data/export.json` (vaqti-vaqti bilan qiling).
- **Bepul limitlar:** Vercel Hobby (shaxsiy, notijorat), Neon 0.5 GB, R2 10 GB. Yiliga bir marta shartlarni tekshirib turing.
