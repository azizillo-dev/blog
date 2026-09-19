import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary, toLocale } from "@/i18n";
import { listCertificates } from "@/features/certificates/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { Lightbox } from "@/components/ui/Lightbox";
import { ExternalIcon } from "@/components/icons";
import { formatDate } from "@/lib/utils";

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c, i) => (
          <article
            key={c.id}
            style={{ "--i": i } as React.CSSProperties}
            className="reveal flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
          >
            <Lightbox src={c.image} alt={c.title}>
              <div className="group relative aspect-[4/3] overflow-hidden bg-surface-2">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </div>
            </Lightbox>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold leading-snug">{c.title}</h2>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted">{t.issuedBy}</dt>
                <dd className="font-medium">{c.issuer}</dd>
                <dt className="text-muted">{t.issuedOn}</dt>
                <dd className="font-medium">{formatDate(c.issuedAt, locale)}</dd>
              </dl>
              {c.description && <p className="mt-3 text-sm leading-relaxed text-muted">{c.description}</p>}
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent hover:underline"
                >
                  {t.open} <ExternalIcon />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
