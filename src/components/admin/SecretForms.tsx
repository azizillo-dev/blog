"use client";

import { useActionState } from "react";
import type { SecretPageView } from "@/features/secret/queries";
import type { ActionState } from "@/features/admin/form";
import { SceneEditor, type SceneItem } from "./SceneEditor";
import { ActionForm, Card, Checkbox, Field, FormMessage, Input, SubmitButton, Textarea } from "@/components/ui/form";

type Props = {
  page: SecretPageView;
  saveSettings: (state: ActionState, fd: FormData) => Promise<ActionState>;
  saveScenes: (state: ActionState, fd: FormData) => Promise<ActionState>;
};

export function SecretForms({ page, saveSettings, saveScenes }: Props) {
  const [settingsState, settingsAction] = useActionState(saveSettings, {});
  const [scenesState, scenesAction] = useActionState(saveScenes, {});

  const scenes: SceneItem[] = page.scenes.map((s) => ({
    id: s.id,
    kind: s.kind,
    visible: true,
    data: s.data as unknown as Record<string, unknown>,
  }));

  return (
    <>
      <ActionForm action={settingsAction}>
        <Card className="mb-6">
          <h2 className="mb-4 text-lg font-bold">Sozlamalar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Manzil" hint={`azizillo.uz/uz/${page.slug}`}>
              <Input name="slug" defaultValue={page.slug} pattern="[a-z0-9][a-z0-9-]{1,60}" required />
            </Field>
            <Field label="Sarlavha">
              <Input name="title" defaultValue={page.title} placeholder="Senga" />
            </Field>
            <Field label="Kirish matni" className="sm:col-span-2">
              <Textarea name="intro" defaultValue={page.intro} rows={2} />
            </Field>
            <Field label="Tugma yozuvi">
              <Input name="nextLabel" defaultValue={page.nextLabel} placeholder="Keyingisi" />
            </Field>
            <Field
              label="Parol"
              hint={page.hasPassword ? "Parol o'rnatilgan. O'zgartirish uchun yangisini yozing, olib tashlash uchun: -" : "Bo'sh qoldirilsa — faqat maxfiy manzil"}
            >
              <Input name="password" type="text" autoComplete="off" placeholder={page.hasPassword ? "••••••" : "parol (ixtiyoriy)"} />
            </Field>
            <div className="sm:col-span-2">
              <Checkbox name="visible" label="Sahifa ochiq bo'lsin" defaultChecked={page.visible} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SubmitButton>Saqlash</SubmitButton>
            <FormMessage state={settingsState} />
          </div>
        </Card>
      </ActionForm>

      <ActionForm action={scenesAction}>
        <Card>
          <h2 className="mb-1 text-lg font-bold">Sahnalar</h2>
          <p className="mb-4 text-sm text-muted">Mehmon ularni shu tartibda, birin-ketin ko&apos;radi.</p>
          <SceneEditor name="scenes" defaultValue={scenes} />
          <div className="sticky bottom-4 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur-md">
            <SubmitButton>Sahnalarni saqlash</SubmitButton>
            <FormMessage state={scenesState} />
          </div>
        </Card>
      </ActionForm>
    </>
  );
}
