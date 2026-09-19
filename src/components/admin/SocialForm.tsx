"use client";

import { useActionState } from "react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { ActionState } from "@/features/admin/form";
import { SocialIcon } from "@/components/icons";
import { ActionForm, Checkbox, FormMessage, Input, Select, SubmitButton } from "@/components/ui/form";

export type SocialFormValues = { platform: string; label: string; url: string; order: number; visible: boolean };

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: SocialFormValues;
  submitLabel: string;
  children?: React.ReactNode; // qo'shimcha tugmalar (o'chirish)
};

export function SocialForm({ action, values, submitLabel, children }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <div className="flex flex-col gap-3">
      <ActionForm action={formAction} className="grid items-center gap-2 sm:grid-cols-[auto_9rem_1fr_2fr_5rem_auto_auto]">
        <SocialIcon platform={values.platform} className="hidden text-muted sm:block" />
        <Select name="platform" defaultValue={values.platform}>
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Input name="label" defaultValue={values.label} placeholder="Nomi" required />
        <Input name="url" defaultValue={values.url} placeholder="https://..." required />
        <Input name="order" type="number" min={0} defaultValue={values.order} aria-label="Tartib" />
        <Checkbox name="visible" label="Ko'rinsin" defaultChecked={values.visible} />
        <SubmitButton variant="ghost">{submitLabel}</SubmitButton>
      </ActionForm>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <FormMessage state={state} />
      </div>
    </div>
  );
}
