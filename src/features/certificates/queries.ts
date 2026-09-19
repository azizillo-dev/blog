import "server-only";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";

export type CertificateView = {
  id: string;
  image: string;
  issuer: string;
  issuedAt: Date;
  url: string;
  title: string;
  description: string;
};

export async function listCertificates(locale: Locale): Promise<CertificateView[]> {
  const rows = await db.certificate.findMany({
    orderBy: [{ order: "asc" }, { issuedAt: "desc" }],
    include: { translations: true },
  });
  return rows.map((c) => {
    const t = pickTranslation(c.translations, locale);
    return {
      id: c.id,
      image: c.image,
      issuer: c.issuer,
      issuedAt: c.issuedAt,
      url: c.url,
      title: t?.title ?? c.issuer,
      description: t?.description ?? "",
    };
  });
}
