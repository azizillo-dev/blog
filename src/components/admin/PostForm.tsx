"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { Block } from "@/lib/content/blocks";
import type { ActionState } from "@/features/admin/form";
import { BlockEditor } from "./BlockEditor";
import { ImageField } from "./ImageInput";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Card, Checkbox, Field, FormMessage, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";

export type PostFormValues = {
  slug: string;
  sectionId: string;
  coverImage: string;
  published: boolean;
  publishedAt: string; // yyyy-mm-dd
  translations: Partial<Record<Locale, { title: string; excerpt: string; blocks: Block[] }>>;
};

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: PostFormValues;
  sections: { id: string; label: string }[];
  initialState?: ActionState;
};

export function PostForm({ action, values, sections, initialState = {} }: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <ActionForm action={formAction} className="space-y-5">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Bo'lim">
          <Select name="sectionId" defaultValue={values.sectionId} required>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Slug (URL)" hint="Bo'sh qolsa sarlavhadan yasaladi">
          <Input name="slug" defaultValue={values.slug} placeholder="my-post" />
        </Field>
        <Field label="Sana">
          <Input name="publishedAt" type="date" defaultValue={values.publishedAt} />
        </Field>
        <div className="flex items-end pb-2.5">
          <Checkbox name="published" label="Chop etilgan" defaultChecked={values.published} />
        </div>
        <Field group label="Muqova rasmi" className="sm:col-span-2">
          <ImageField name="coverImage" defaultValue={values.coverImage} />
        </Field>
      </Card>

      <Card>
        <LocaleTabs>
          {(l) => {
            const t = values.translations[l];
            return (
              <>
                <Field label="Sarlavha">
                  <Input name={`title.${l}`} defaultValue={t?.title} />
                </Field>
                <Field label="Qisqa tavsif">
                  <Textarea name={`excerpt.${l}`} defaultValue={t?.excerpt} rows={2} />
                </Field>
                <Field group label="Kontent">
                  <BlockEditor name={`blocks.${l}`} defaultValue={t?.blocks ?? []} />
                </Field>
              </>
            );
          }}
        </LocaleTabs>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur-md">
        <SubmitButton>Saqlash</SubmitButton>
        <div className="flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </ActionForm>
  );
}
