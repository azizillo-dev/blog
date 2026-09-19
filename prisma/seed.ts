/**
 * Boshlang'ich ma'lumot. Qayta ishga tushirish xavfsiz (upsert) — mavjud kontentni o'chirmaydi.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Tr = { uz: string; ru: string; en: string };
const tr = (t: Tr, extra: (locale: string) => Record<string, string> = () => ({})) =>
  (Object.keys(t) as (keyof Tr)[]).map((locale) => ({ locale, title: t[locale], ...extra(locale) }));

const para = (text: string) => JSON.stringify([{ type: "paragraph", text }]);

async function upsertSection(slug: string, kind: string, inNav: string, order: number, title: Tr) {
  const existing = await db.section.findUnique({ where: { slug } });
  if (existing) return existing;
  return db.section.create({
    data: { slug, kind, inNav, order, translations: { create: tr(title) } },
  });
}

async function main() {
  const blog = await upsertSection("blog", "BLOG", "MAIN", 0, { uz: "Blog", ru: "Блог", en: "Blog" });
  const it = await upsertSection("it", "IT", "MORE", 10, { uz: "IT karyera", ru: "IT карьера", en: "IT career" });
  const priv = await upsertSection("private", "PRIVATE", "MORE", 20, { uz: "Private", ru: "Приватное", en: "Private" });

  const samples = [
    { slug: "hello-world", section: blog.id, seed: "code", t: { uz: "Salom, dunyo!", ru: "Привет, мир!", en: "Hello, world!" } },
    { slug: "system-design-notes", section: blog.id, seed: "arch", t: { uz: "System design eslatmalari", ru: "Заметки по system design", en: "System design notes" } },
    { slug: "my-first-job", section: it.id, seed: "desk", t: { uz: "Birinchi ishim", ru: "Моя первая работа", en: "My first job" } },
    { slug: "private-diary", section: priv.id, seed: "night", t: { uz: "Shaxsiy kundalik", ru: "Личный дневник", en: "Private diary" } },
  ];

  for (const [i, s] of samples.entries()) {
    if (await db.post.findUnique({ where: { slug: s.slug } })) continue;
    await db.post.create({
      data: {
        slug: s.slug,
        sectionId: s.section,
        coverImage: `https://picsum.photos/seed/${s.seed}/1200/800`,
        published: true,
        publishedAt: new Date(Date.now() - i * 86_400_000 * 5),
        translations: {
          create: tr(s.t, (l) => ({
            excerpt: l === "ru" ? "Короткое описание поста." : l === "en" ? "A short post description." : "Post haqida qisqa tavsif.",
            blocks: para(
              l === "ru"
                ? "Это **демо** пост. Отредактируйте его в админ-панели."
                : l === "en"
                  ? "This is a **demo** post. Edit it from the admin panel."
                  : "Bu **demo** post. Uni admin paneldan tahrirlang.",
            ),
          })),
        },
      },
    });
  }

  if (!(await db.page.findUnique({ where: { key: "about" } }))) {
    await db.page.create({
      data: {
        key: "about",
        translations: {
          create: tr(
            { uz: "Men haqimda", ru: "Обо мне", en: "About me" },
            (l) => ({
              blocks: para(
                l === "ru" ? "Расскажите о себе в админ-панели." : l === "en" ? "Tell your story from the admin panel." : "O'zingiz haqingizda admin paneldan yozing.",
              ),
            }),
          ),
        },
      },
    });
  }

  if ((await db.certificate.count()) === 0) {
    await db.certificate.create({
      data: {
        image: "https://picsum.photos/seed/cert/1200/850",
        issuer: "Coursera",
        issuedAt: new Date("2025-06-01"),
        url: "https://coursera.org",
        translations: {
          create: tr(
            { uz: "Algoritmlar", ru: "Алгоритмы", en: "Algorithms" },
            () => ({ description: "Demo" }),
          ),
        },
      },
    });
  }

  if ((await db.project.count()) === 0) {
    await db.project.create({
      data: {
        image: "https://picsum.photos/seed/project/1200/750",
        technologies: "Next.js, TypeScript, Prisma, Tailwind CSS",
        demoUrl: "https://example.com",
        sourceUrl: "https://github.com/",
        translations: {
          create: [
            { locale: "uz", title: "Shaxsiy blog", description: "Uch tilli, admin panelli, private bo'limli blog." },
            { locale: "ru", title: "Личный блог", description: "Трёхъязычный блог с админ-панелью и приватным разделом." },
            { locale: "en", title: "Personal blog", description: "Trilingual blog with an admin panel and a private section." },
          ],
        },
      },
    });
  }

  if ((await db.resumeEntry.count()) === 0) {
    await db.resumeEntry.create({
      data: {
        kind: "EXPERIENCE",
        organization: "Company",
        location: "Tashkent",
        startDate: new Date("2024-03-01"),
        translations: {
          create: [
            { locale: "uz", title: "Software Engineer", description: "Backend va frontend ishlari." },
            { locale: "en", title: "Software Engineer", description: "Backend and frontend work." },
          ],
        },
      },
    });
    await db.resumeEntry.create({
      data: {
        kind: "EDUCATION",
        organization: "University",
        location: "Tashkent",
        startDate: new Date("2020-09-01"),
        endDate: new Date("2024-06-01"),
        translations: {
          create: [
            { locale: "uz", title: "Bakalavr, Kompyuter injiniringi" },
            { locale: "en", title: "Bachelor, Computer Engineering" },
          ],
        },
      },
    });
  }

  if ((await db.socialLink.count()) === 0) {
    await db.socialLink.createMany({
      data: [
        { platform: "telegram", label: "Telegram", url: "https://t.me/", order: 0 },
        { platform: "github", label: "GitHub", url: "https://github.com/", order: 1 },
        { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/", order: 2 },
      ],
    });
  }

  const settings = { siteTitle: "My I/O", authorName: "Author", leetcodeUsername: "", skills: "TypeScript, React, Next.js, Node.js" };
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seed tayyor ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
