import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/PageTitle";

export default async function AdminDashboard() {
  const [posts, drafts, projects, certificates, pending, users] = await Promise.all([
    db.post.count({ where: { published: true } }),
    db.post.count({ where: { published: false } }),
    db.project.count(),
    db.certificate.count(),
    db.accessRequest.count({ where: { status: "PENDING" } }),
    db.privateUser.count({ where: { active: true } }),
  ]);

  const stats = [
    { label: "Chop etilgan postlar", value: posts, href: "/admin/posts" },
    { label: "Qoralamalar", value: drafts, href: "/admin/posts" },
    { label: "Loyihalar", value: projects, href: "/admin/projects" },
    { label: "Sertifikatlar", value: certificates, href: "/admin/certificates" },
    { label: "Kutilayotgan so'rovlar", value: pending, href: "/admin/requests" },
    { label: "Private foydalanuvchilar", value: users, href: "/admin/requests" },
  ];

  return (
    <>
      <PageTitle title="Bosh sahifa" action={<Link href="/admin/posts/new" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">+ Yangi post</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-border bg-surface p-5 transition-transform hover:-translate-y-0.5">
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
