import { getSettings } from "@/features/settings/queries";
import { PageTitle } from "@/components/admin/PageTitle";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  return (
    <>
      <PageTitle title="Sozlamalar" />
      <SettingsForm values={await getSettings()} />
    </>
  );
}
