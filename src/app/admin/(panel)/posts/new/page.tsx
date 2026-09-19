import { savePostAction } from "@/features/posts/actions";
import { listSectionOptions } from "@/features/posts/admin-queries";
import { PageTitle } from "@/components/admin/PageTitle";
import { PostForm } from "@/components/admin/PostForm";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const sections = await listSectionOptions();
  const { section } = await searchParams;

  return (
    <>
      <PageTitle title="Yangi post" />
      <PostForm
        action={savePostAction.bind(null, null)}
        sections={sections}
        values={{
          slug: "",
          sectionId: section ?? sections[0]?.id ?? "",
          coverImage: "",
          published: true,
          publishedAt: new Date().toISOString().slice(0, 10),
          translations: {},
        }}
      />
    </>
  );
}
