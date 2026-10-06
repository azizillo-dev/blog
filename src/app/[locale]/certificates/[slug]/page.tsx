import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getCertificate } from "@/features/certificates/queries";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { DetailHeader } from "@/components/content/DetailHeader";
import { Lightbox } from "@/components/ui/Lightbox";
import { ExternalIcon } from "@/components/icons";

export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await getCertificate(slug, toLocale(locale));
  return c ? { title: c.title, description: c.description.slice(0, 160) } : {};
}

export default async function CertificatePage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const dict = getDictionary(locale);
  const t = dict.certificates;
  const c = await getCertificate(slug, locale);
  if (!c) notFound();

  return (
    <article className="pb-10">
      <Container size="prose" className="animate-fade-up pt-8 sm:pt-12">
        <DetailHeader backHref={routes.certificates(locale)} homeHref={routes.home(locale)} dict={dict} />
        <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{c.title}</h1>

        {/* Rasm bosilsa kattalashadi */}
        <Lightbox src={c.image} alt={c.title}>
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-card sm:rounded-3xl">
            <Image src={c.image} alt={c.title} fill priority sizes="(min-width: 704px) 672px, 100vw" className="object-contain" />
          </div>
        </Lightbox>

        <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-muted">{t.issuedBy}</dt>
          <dd className="font-semibold">{c.issuer}</dd>
          <dt className="text-muted">{t.issuedOn}</dt>
          <dd className="font-semibold">{formatDate(c.issuedAt, locale)}</dd>
        </dl>

        {c.description && <p className="mt-8 whitespace-pre-line leading-relaxed">{c.description}</p>}

        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-transform active:scale-95"
          >
            {t.open} <ExternalIcon />
          </a>
        )}
      </Container>
    </article>
  );
}
