"use client";

import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { Block } from "@/lib/content/blocks";
import type { ActionState } from "@/features/admin/form";
import { BlockEditor } from "./BlockEditor";
import { ImageField } from "./ImageInput";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Card, Field, FormMessage, Input, SubmitButton } from "@/components/ui/form";

export type PageFormValues = {
  image: string;
  translations: Partial<Record<Locale, { title: string; blocks: Block[] }>>;
};

type Props = { action: (state: ActionState, fd: FormData) => Promise<ActionState>; values: PageFormValues };

export function PageForm({ action, values }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <ActionForm action={formAction} className="space-y-5">
      <Card>
        <Field group label="Asosiy rasm (avatar)">
          <ImageField name="image" defaultValue={values.image} />
        </Field>
      </Card>
      <Card>
        <LocaleTabs>
          {(l) => (
            <>
              <Field label="Sarlavha">
                <Input name={`title.${l}`} defaultValue={values.translations[l]?.title} />
              </Field>
              <Field group label="Kontent" hint="Rasm bloklarida joylashuvni tanlang: markazda, keng, chapda yoki o'ngda (matn yonida).">
                <BlockEditor name={`blocks.${l}`} defaultValue={values.translations[l]?.blocks ?? []} />
              </Field>
            </>
          )}
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
