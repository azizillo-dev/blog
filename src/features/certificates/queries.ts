import "server-only";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";

export type CertificateView = {
  id: string;
  slug: string;
  image: string;
  issuer: string;
  issuedAt: Date;
  url: string;
  title: string;
  description: string;
};

type Row = {
  id: string;
  slug: string | null;
  image: string;
  issuer: string;
  issuedAt: Date;
  url: string;
  translations: { locale: string; title: string; description: string }[];
};

function toView(c: Row, locale: Locale): CertificateView {
  const t = pickTranslation(c.translations, locale);
  return {
    id: c.id,
    slug: c.slug ?? c.id,
    image: c.image,
    issuer: c.issuer,
    issuedAt: c.issuedAt,
    url: c.url,
    title: t?.title ?? c.issuer,
    description: t?.description ?? "",
  };
}

export async function listCertificates(locale: Locale): Promise<CertificateView[]> {
  const rows = await db.certificate.findMany({
    orderBy: [{ order: "asc" }, { issuedAt: "desc" }],
    include: { translations: true },
  });
  return rows.map((c) => toView(c, locale));
}

export async function getCertificate(slug: string, locale: Locale): Promise<CertificateView | null> {
  const row = await db.certificate.findFirst({ where: { OR: [{ slug }, { id: slug }] }, include: { translations: true } });
  return row ? toView(row, locale) : null;
}
