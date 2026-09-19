import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getPrivateViewer } from "@/features/private/viewer";
import { routes } from "@/lib/routes";
import { Container } from "@/components/layout/Container";
import { PrivateLoginForm } from "@/components/private/PrivateLoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function PrivateLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  if (await getPrivateViewer()) redirect(routes.section(locale, "private", "PRIVATE"));

  return (
    <Container className="py-12 sm:py-20">
      <PrivateLoginForm locale={locale} t={getDictionary(locale).private} />
    </Container>
  );
}
