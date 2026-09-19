import Link from "next/link";
import { db } from "@/lib/db";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/constants";
import {
  approveRequestAction,
  deletePrivateUserAction,
  deleteRequestAction,
  rejectRequestAction,
  resetPrivatePasswordAction,
  togglePrivateUserAction,
} from "@/features/private/admin-actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { ResultButton } from "@/components/admin/ResultButton";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Ruxsat berilgan",
  REJECTED: "Rad etilgan",
  UNVERIFIED: "Email tasdiqlanmagan",
};

const dateTime = (d: Date) => d.toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminRequestsPage({ searchParams }: Props) {
  const raw = (await searchParams).status;
  const status: RequestStatus = REQUEST_STATUSES.includes(raw as RequestStatus) ? (raw as RequestStatus) : "PENDING";

  const [requests, counts, users] = await Promise.all([
    db.accessRequest.findMany({ where: { status }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.accessRequest.groupBy({ by: ["status"], _count: true }),
    db.privateUser.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <PageTitle title="Private so'rovlar" />

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {(["PENDING", "APPROVED", "REJECTED", "UNVERIFIED"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/requests?status=${s}`}
            className={cn(
              "shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
              s === status ? "bg-accent text-accent-fg" : "border border-border bg-surface hover:bg-surface-2",
            )}
          >
            {STATUS_LABEL[s]} · {countOf(s)}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {requests.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-center text-muted">So&apos;rovlar yo&apos;q</p>}
        {requests.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a href={`mailto:${r.email}`} className="font-bold hover:text-accent">{r.email}</a>
              <span className="text-xs text-muted">{dateTime(r.createdAt)} · {r.locale.toUpperCase()}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-bg p-3.5 text-sm leading-relaxed">{r.message}</p>
            <div className="mt-4 flex flex-wrap items-start gap-2">
              {r.status === "PENDING" && (
                <>
                  <ResultButton action={approveRequestAction.bind(null, r.id)} label="✓ Ruxsat berish" />
                  <ResultButton action={rejectRequestAction.bind(null, r.id)} label="Rad etish" variant="ghost" />
                </>
              )}
              <ConfirmForm action={deleteRequestAction.bind(null, r.id)} label="O'chirish" confirm="So'rov o'chirilsinmi?" />
            </div>
          </article>
        ))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-extrabold">Private foydalanuvchilar ({users.length})</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {users.length === 0 && <p className="p-6 text-center text-muted">Hozircha yo&apos;q</p>}
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="min-w-0 flex-1 truncate font-semibold">{u.email}</span>
              <span className={u.active ? "text-xs font-semibold text-emerald-500" : "text-xs font-semibold text-red-500"}>
                {u.active ? "Faol" : "Bloklangan"}
              </span>
              <ResultButton action={resetPrivatePasswordAction.bind(null, u.id)} label="Yangi parol" variant="ghost" />
              <ConfirmForm
                action={togglePrivateUserAction.bind(null, u.id)}
                label={u.active ? "Bloklash" : "Faollashtirish"}
                confirm={u.active ? "Foydalanuvchi bloklansinmi?" : "Faollashtirilsinmi?"}
                variant="ghost"
              />
              <ConfirmForm action={deletePrivateUserAction.bind(null, u.id)} label="O'chirish" confirm="Foydalanuvchi o'chirilsinmi?" />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
