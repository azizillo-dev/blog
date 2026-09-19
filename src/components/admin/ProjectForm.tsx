"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/lib/constants";
import type { ActionState } from "@/features/admin/form";
import { parseTechnologies } from "@/features/projects/technologies";
import { TechList } from "@/components/content/TechList";
import { ImageField } from "./ImageInput";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Checkbox, Field, FormMessage, Input, SubmitButton, Textarea } from "@/components/ui/form";

export type ProjectFormValues = {
  image: string;
  technologies: string;
  demoUrl: string;
  sourceUrl: string;
  order: number;
  visible: boolean;
  translations: Partial<Record<Locale, { title: string; description: string }>>;
};

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: ProjectFormValues;
  submitLabel: string;
};

export function ProjectForm({ action, values, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, {});
  const [tech, setTech] = useState(values.technologies);

  return (
    <ActionForm action={formAction} className="space-y-4">
      <Field group label="Rasm (skrinshot)">
        <ImageField name="image" defaultValue={values.image} />
      </Field>
      <Field label="Texnologiyalar" hint="Vergul bilan ajrating: Next.js, Go, PostgreSQL">
        <Input name="technologies" value={tech} onChange={(e) => setTech(e.target.value)} placeholder="React, Node.js, Docker" />
      </Field>
      <TechList items={parseTechnologies(tech)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Demo havola (ixtiyoriy)">
          <Input name="demoUrl" type="url" defaultValue={values.demoUrl} placeholder="https://..." />
        </Field>
        <Field label="GitHub / kod havolasi (ixtiyoriy)">
          <Input name="sourceUrl" type="url" defaultValue={values.sourceUrl} placeholder="https://github.com/..." />
        </Field>
        <Field label="Tartib">
          <Input name="order" type="number" min={0} defaultValue={values.order} />
        </Field>
        <div className="flex items-end pb-2.5">
          <Checkbox name="visible" label="Saytda ko'rinsin" defaultChecked={values.visible} />
        </div>
      </div>
      <LocaleTabs>
        {(l) => (
          <>
            <Field label="Nomi">
              <Input name={`title.${l}`} defaultValue={values.translations[l]?.title} />
            </Field>
            <Field label="Tavsif">
              <Textarea name={`description.${l}`} defaultValue={values.translations[l]?.description} rows={4} />
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
