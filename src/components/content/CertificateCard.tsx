import Image from "next/image";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { CertificateView } from "@/features/certificates/queries";
import { ExternalIcon } from "@/components/icons";
import { Lightbox } from "@/components/ui/Lightbox";
import { formatDate } from "@/lib/utils";
import { ExpandableText } from "./ExpandableText";

type Props = {
  certificate: CertificateView;
  locale: Locale;
  t: Dictionary["certificates"];
  common: Dictionary["common"];
  index: number;
};

/** Loyiha kartasi bilan bir xil tartib: rasm → nom → yig'iladigan tavsif → pastda havola. */
export function CertificateCard({ certificate: c, locale, t, common, index }: Props) {
  return (
    <article
      style={{ "--i": index } as React.CSSProperties}
      className="reveal flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
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
        <h2 className="line-clamp-2 text-lg font-bold leading-snug">{c.title}</h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted">{t.issuedBy}</dt>
          <dd className="truncate font-medium">{c.issuer}</dd>
          <dt className="text-muted">{t.issuedOn}</dt>
          <dd className="font-medium">{formatDate(c.issuedAt, locale)}</dd>
        </dl>
        {c.description && <ExpandableText text={c.description} lines={4} labels={common} className="mt-3 text-sm" />}
        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent hover:underline"
          >
            {t.open} <ExternalIcon />
          </a>
        )}
      </div>
    </article>
  );
}
