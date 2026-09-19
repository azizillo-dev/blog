import type { Locale } from "@/lib/constants";

export const routes = {
  home: (l: Locale) => `/${l}`,
  /** "Blog" menyusi — muallif haqida sahifa */
  about: (l: Locale) => `/${l}/blog`,
  posts: (l: Locale, page = 1) => (page > 1 ? `/${l}/posts?page=${page}` : `/${l}/posts`),
  post: (l: Locale, slug: string, kind?: string) => (kind === "PRIVATE" ? `/${l}/private/${slug}` : `/${l}/blog/${slug}`),
  section: (l: Locale, slug: string, kind: string) => {
    if (kind === "BLOG") return `/${l}`;
    if (kind === "IT") return `/${l}/it`;
    if (kind === "PRIVATE") return `/${l}/private`;
    return `/${l}/s/${slug}`;
  },
  certificates: (l: Locale) => `/${l}/certificates`,
  projects: (l: Locale) => `/${l}/projects`,
  privateLogin: (l: Locale) => `/${l}/private/login`,
};

/** Joriy yo'lning tilini almashtiradi: /ru/blog/x → /en/blog/x */
export function swapLocale(pathname: string, locale: Locale): string {
  const parts = pathname.split("/");
  parts[1] = locale;
  return parts.join("/") || `/${locale}`;
}
