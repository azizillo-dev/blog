import Link from "next/link";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { parseBlocks } from "@/lib/content/blocks";
import { savePageAction } from "@/features/pages/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { PageForm } from "@/components/admin/PageForm";

const KEY = "about";

export default async function AdminAboutPage() {
  const page = await db.page.findUnique({ where: { key: KEY }, include: { translations: true } });

  return (
    <>
      <PageTitle
        title="Blog: Men haqimda"
        action={
          <Link href="/uz/blog" target="_blank" className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
            Ko&apos;rish ↗
          </Link>
        }
      />
      <PageForm
        action={savePageAction.bind(null, KEY)}
        values={{
          image: page?.image ?? "",
          translations: Object.fromEntries(
            (page?.translations ?? []).map((t) => [t.locale as Locale, { title: t.title, blocks: parseBlocks(t.blocks) }]),
          ),
        }}
      />
    </>
  );
}
