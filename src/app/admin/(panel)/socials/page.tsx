import { getAllSocialLinks } from "@/features/socials/queries";
import { deleteSocialAction, saveSocialAction } from "@/features/socials/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { SocialForm } from "@/components/admin/SocialForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Card } from "@/components/ui/form";

export default async function AdminSocialsPage() {
  const links = await getAllSocialLinks();

  return (
    <>
      <PageTitle title="Ijtimoiy tarmoqlar" />
      <p className="mb-6 text-sm text-muted">Footer&apos;dagi &quot;Meni kuzating&quot; bloki. Tartib raqami kichigi birinchi chiqadi.</p>

      <Card className="space-y-6">
        {links.length === 0 && <p className="text-center text-muted">Hozircha yo&apos;q</p>}
        {links.map((link) => (
          <div key={link.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
            <SocialForm action={saveSocialAction.bind(null, link.id)} values={link} submitLabel="Saqlash">
              <ConfirmForm action={deleteSocialAction.bind(null, link.id)} label="O'chirish" confirm={`${link.label} o'chirilsinmi?`} />
            </SocialForm>
          </div>
        ))}
      </Card>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Yangi havola</h2>
        <SocialForm
          action={saveSocialAction.bind(null, null)}
          submitLabel="Qo'shish"
          values={{ platform: "telegram", label: "", url: "", order: links.length, visible: true }}
        />
      </Card>
    </>
  );
}
