"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { ActionState } from "@/features/admin/form";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Field, FormMessage, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";

export type SectionFormValues = {
  slug: string;
  inNav: string;
  order: number;
  translations: Partial<Record<Locale, { title: string; description: string }>>;
};

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: SectionFormValues;
  submitLabel: string;
};

export function SectionForm({ action, values, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <ActionForm action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Slug">
          <Input name="slug" defaultValue={values.slug} placeholder="travel" />
        </Field>
        <Field label="Menyuda">
          <Select name="inNav" defaultValue={values.inNav}>
            <option value="MAIN">Asosiy menyu</option>
            <option value="MORE">&quot;More&quot; ichida</option>
            <option value="HIDDEN">Yashirin</option>
          </Select>
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
            <Field label="Tavsif">
              <Textarea name={`description.${l}`} defaultValue={values.translations[l]?.description} rows={2} />
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
