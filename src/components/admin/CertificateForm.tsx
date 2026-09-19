"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { ActionState } from "@/features/admin/form";
import { ImageField } from "./ImageInput";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Field, FormMessage, Input, SubmitButton, Textarea } from "@/components/ui/form";

export type CertificateFormValues = {
  image: string;
  issuer: string;
  issuedAt: string;
  url: string;
  order: number;
  translations: Partial<Record<Locale, { title: string; description: string }>>;
};

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: CertificateFormValues;
  submitLabel: string;
};

export function CertificateForm({ action, values, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <ActionForm action={formAction} className="space-y-4">
      <Field group label="Rasm">
        <ImageField name="image" defaultValue={values.image} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Qayerdan olingan (beruvchi)">
          <Input name="issuer" defaultValue={values.issuer} placeholder="Coursera, Google, EPAM..." required />
        </Field>
        <Field label="Sana">
          <Input name="issuedAt" type="date" defaultValue={values.issuedAt} required />
        </Field>
        <Field label="Havola (ixtiyoriy)">
          <Input name="url" type="url" defaultValue={values.url} placeholder="https://..." />
        </Field>
        <Field label="Tartib">
          <Input name="order" type="number" min={0} defaultValue={values.order} />
        </Field>
      </div>
      <LocaleTabs>
        {(l) => (
          <>
            <Field label="Nomi">
              <Input name={`title.${l}`} defaultValue={values.translations[l]?.title} />
            </Field>
            <Field label="Ma'lumot">
              <Textarea name={`description.${l}`} defaultValue={values.translations[l]?.description} />
            </Field>
          </>
        )}
      </LocaleTabs>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </ActionForm>
  );
}
