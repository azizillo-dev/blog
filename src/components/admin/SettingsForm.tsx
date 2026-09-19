"use client";

import { useActionState } from "react";
import type { Settings } from "@/features/settings/queries";
import { saveSettingsAction } from "@/features/settings/actions";
import { ActionForm, Card, Field, FormMessage, Input, SubmitButton, Textarea } from "@/components/ui/form";

export function SettingsForm({ values }: { values: Settings }) {
  const [state, action] = useActionState(saveSettingsAction, {});
  return (
    <ActionForm action={action}>
      <Card className="space-y-4">
        <Field label="Sayt nomi" hint="Header'da chiqadi">
          <Input name="siteTitle" defaultValue={values.siteTitle} required />
        </Field>
        <Field label="Muallif ismi" hint="Footer'dagi © qatorida">
          <Input name="authorName" defaultValue={values.authorName} />
        </Field>
        <Field label="Ko'nikmalar (Blog sahifasi)" hint="Vergul bilan: TypeScript, Go, PostgreSQL, Docker">
          <Textarea name="skills" defaultValue={values.skills} rows={2} />
        </Field>
        <Field label="LeetCode username" hint="IT bo'limida statistika chiqadi. Bo'sh qolsa — ko'rsatilmaydi.">
          <Input name="leetcodeUsername" defaultValue={values.leetcodeUsername} />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>Saqlash</SubmitButton>
          <FormMessage state={state} />
        </div>
      </Card>
    </ActionForm>
  );
}
