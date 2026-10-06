import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { listCertificates } from "@/features/certificates/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { CertificateCard } from "@/components/content/CertificateCard";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).locale)).certificates.title };
}

export default async function CertificatesPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const t = dict.certificates;
  const certificates = await listCertificates(locale);

  return (
    <Container size="wide">
      <PageHeading title={t.title} subtitle={t.subtitle} />
      {certificates.length === 0 && <p className="py-16 text-center text-muted">{t.empty}</p>}
      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c, i) => (
          <CertificateCard key={c.id} certificate={c} locale={locale} t={t} common={dict.common} index={i} />
        ))}
      </div>
    </Container>
  );
}
