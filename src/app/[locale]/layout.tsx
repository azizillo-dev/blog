import { notFound } from "next/navigation";
import { LOCALES } from "@/lib/constants";
import { getDictionary, isLocale } from "@/i18n";
import { getSections } from "@/features/sections/queries";
import { getVisibleSocialLinks } from "@/features/socials/queries";
import { getSettings } from "@/features/settings/queries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingDock } from "@/components/layout/FloatingDock";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const settings = await getSettings();
  return {
    title: { default: settings.siteTitle, template: `%s · ${settings.siteTitle}` },
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
    openGraph: { siteName: settings.siteTitle, locale },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const [sections, links, settings] = await Promise.all([getSections(locale), getVisibleSocialLinks(), getSettings()]);

  return (
    <>
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-px w-px" />
      <Header locale={locale} dict={dict} siteTitle={settings.siteTitle} sections={sections} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer dict={dict} links={links} author={settings.authorName || settings.siteTitle} />
      <FloatingDock themeLabel={dict.common.theme} topLabel={dict.common.toTop} />
    </>
  );
}
