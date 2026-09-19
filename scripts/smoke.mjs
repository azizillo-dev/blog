/**
 * Ishlayotgan serverga HTTP smoke test.  BASE_URL=http://localhost:3000 npm run smoke
 * Har bir yo'l uchun kutilgan status va (ixtiyoriy) sahifada bo'lishi kerak bo'lgan matn.
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

const checks = [
  { path: "/", status: 307 },
  { path: "/uz", status: 200, contains: "So'nggi postlar" },
  { path: "/uz/blog", status: 200, contains: "Tajriba" },
  { path: "/en/blog", status: 200, contains: "Education" },
  { path: "/uz/posts", status: 200, contains: "Barcha postlar" },
  { path: "/uz/posts?page=abc", status: 200 },
  { path: "/admin/resume", status: 307 },
  { path: "/uz/projects", status: 200, contains: "Loyihalar" },
  { path: "/en/projects", status: 200, contains: "Personal blog" },
  { path: "/uz/about", status: 308 },
  { path: "/admin/projects", status: 307 },
  { path: "/ru", status: 200, contains: "Последние посты" },
  { path: "/en", status: 200, contains: "Recent posts" },
  { path: "/en/blog/hello-world", status: 200, contains: "Hello, world!" },
  { path: "/en/blog/private-diary", status: 404 },
  { path: "/en/blog/does-not-exist", status: 404 },
  { path: "/uz/certificates", status: 200, contains: "Sertifikatlar" },
  { path: "/en/it", status: 200, contains: "IT career" },
  { path: "/en/private", status: 200, contains: "This section is locked" },
  { path: "/en/private/private-diary", status: 307 },
  { path: "/admin", status: 307 },
  { path: "/admin/login", status: 200 },
  { path: "/api/upload", status: 401, method: "POST" },
];

let failed = 0;
for (const c of checks) {
  const res = await fetch(BASE + c.path, { redirect: "manual", method: c.method || "GET" });
  const body = c.contains ? await res.text() : "";
  const ok = res.status === c.status && (!c.contains || body.includes(c.contains));
  if (!ok) failed++;
  console.log(`${ok ? "✔" : "✘"} ${c.method || "GET"} ${c.path} → ${res.status}${ok ? "" : ` (kutilgan ${c.status}${c.contains ? `, "${c.contains}"` : ""})`}`);
}

console.log(failed ? `\n${failed} ta tekshiruv muvaffaqiyatsiz` : "\nHammasi yaxshi ✔");
process.exit(failed ? 1 : 0);
