import Link from "next/link";

type Props = { title: string; href: string; seeAll: string; children: React.ReactNode };

/** Bosh sahifadagi qo'shimcha blok (loyihalar, sertifikatlar): sarlavha, kartalar, "Hammasini ko'rish". */
export function HomeShowcase({ title, href, seeAll, children }: Props) {
  return (
    <section className="mt-24">
      <div className="reveal mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        <Link href={href} className="group shrink-0 text-sm font-semibold text-accent">
          {seeAll} <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
      {children}
    </section>
  );
}
