import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { deleteCertificateAction, saveCertificateAction } from "@/features/certificates/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { CertificateForm } from "@/components/admin/CertificateForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Card } from "@/components/ui/form";

const dateInput = (d: Date) => d.toISOString().slice(0, 10);

export default async function AdminCertificatesPage() {
  const certificates = await db.certificate.findMany({
    orderBy: [{ order: "asc" }, { issuedAt: "desc" }],
    include: { translations: true },
  });

  return (
    <>
      <PageTitle title="Sertifikatlar" />
      <div className="space-y-4">
        {certificates.map((c) => (
          <details key={c.id} className="group rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.translations.find((t) => t.locale === "uz")?.title ?? c.issuer}</span>
                <span className="text-xs text-muted">{c.issuer} · {dateInput(c.issuedAt)}</span>
              </span>
              <span className="text-muted transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="space-y-4 border-t border-border p-5">
              <CertificateForm
                action={saveCertificateAction.bind(null, c.id)}
                submitLabel="Saqlash"
                values={{
                  image: c.image,
                  issuer: c.issuer,
                  issuedAt: dateInput(c.issuedAt),
                  url: c.url,
                  order: c.order,
                  translations: Object.fromEntries(c.translations.map((t) => [t.locale as Locale, t])),
                }}
              />
              <div className="border-t border-border pt-4">
                <ConfirmForm action={deleteCertificateAction.bind(null, c.id)} label="O'chirish" confirm="Sertifikat o'chirilsinmi?" />
              </div>
            </div>
          </details>
        ))}
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Yangi sertifikat</h2>
        <CertificateForm
          action={saveCertificateAction.bind(null, null)}
          submitLabel="Qo'shish"
          values={{ image: "", issuer: "", issuedAt: dateInput(new Date()), url: "", order: 0, translations: {} }}
        />
      </Card>
    </>
  );
}
