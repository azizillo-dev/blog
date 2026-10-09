import Link from "next/link";
import { getSecretPage, getVisitStats } from "@/features/secret/queries";
import { clearVisitsAction, saveScenesAction, saveSecretSettingsAction } from "@/features/secret/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { SecretForms } from "@/components/admin/SecretForms";
import { Card } from "@/components/ui/form";

export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("uz-Latn-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminSecretPage() {
  const page = await getSecretPage();
  const stats = await getVisitStats(page.id);

  return (
    <>
      <PageTitle
        title="Maxfiy sahifa"
        action={
          <Link href={`/uz/${page.slug}`} target="_blank" className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
            Ko&apos;rish ↗
          </Link>
        }
      />

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-bold">Tashriflar</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ["Jami", stats.total],
            ["Har xil odam", stats.unique],
            ["Bugun", stats.today],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-bg p-4">
              <p className="text-3xl font-extrabold">{value}</p>
              <p className="mt-1 text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {stats.recent.length > 0 && (
          <>
            <ul className="mt-5 divide-y divide-border text-sm">
              {stats.recent.map((v, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-3 py-2">
                  <span className="font-medium">{when.format(v.at)}</span>
                  <span className="text-muted">{v.place}</span>
                  <span className="ml-auto text-xs text-muted">{v.device}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              <ConfirmForm action={clearVisitsAction} label="Statistikani tozalash" confirm="Tashriflar tarixi o'chirilsinmi?" />
            </div>
          </>
        )}
        <p className="mt-4 text-xs text-muted">
          IP manzillar ochiq saqlanmaydi — faqat qaytarib bo&apos;lmaydigan xesh (bir odamni ikkinchisidan ajratish uchun). Shahar va qurilma
          ma&apos;lumoti taxminiy. Bir odam 30 daqiqa ichida qayta kirsa, yangi tashrif sifatida sanalmaydi.
        </p>
      </Card>

      <SecretForms page={page} saveSettings={saveSecretSettingsAction} saveScenes={saveScenesAction} />
    </>
  );
}
