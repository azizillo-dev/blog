import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePostAction, savePostAction } from "@/features/posts/actions";
import { getPostForEdit, listSectionOptions } from "@/features/posts/admin-queries";
import { parseBlocks } from "@/lib/content/blocks";
import type { Locale } from "@/lib/constants";
import { routes } from "@/lib/routes";
import { PageTitle } from "@/components/admin/PageTitle";
import { PostForm, type PostFormValues } from "@/components/admin/PostForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const [post, sections] = await Promise.all([getPostForEdit(id), listSectionOptions()]);
  if (!post) notFound();

  const translations: PostFormValues["translations"] = Object.fromEntries(
    post.translations.map((t) => [t.locale as Locale, { title: t.title, excerpt: t.excerpt, blocks: parseBlocks(t.blocks) }]),
  );

  return (
    <>
      <PageTitle
        title="Postni tahrirlash"
        action={
          <div className="flex items-center gap-2">
            <Link href={routes.post("uz", post.slug, post.section.kind)} target="_blank" className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
              Ko&apos;rish ↗
            </Link>
            <ConfirmForm action={deletePostAction.bind(null, post.id)} label="O'chirish" confirm="Post butunlay o'chirilsinmi?" />
          </div>
        }
      />
      <PostForm
        action={savePostAction.bind(null, post.id)}
        sections={sections}
        initialState={(await searchParams).saved ? { ok: true } : {}}
        values={{
          slug: post.slug,
          sectionId: post.sectionId,
          coverImage: post.coverImage,
          published: post.published,
          publishedAt: post.publishedAt.toISOString().slice(0, 10),
          translations,
        }}
      />
    </>
  );
}
