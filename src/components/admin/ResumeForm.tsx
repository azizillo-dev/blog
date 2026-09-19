"use client";

import { useActionState, useState } from "react";
import type { Locale, ResumeKind } from "@/lib/constants";
import type { ActionState } from "@/features/admin/form";
import { ImageField } from "./ImageInput";
import { LocaleTabs } from "./LocaleTabs";
import { ActionForm, Checkbox, Field, FormMessage, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";

export type ResumeFormValues = {
  kind: ResumeKind;
  organization: string;
  logo: string;
  location: string;
  url: string;
  startDate: string; // yyyy-mm
  endDate: string; // yyyy-mm yoki "" (hozirgacha)
  order: number;
  translations: Partial<Record<Locale, { title: string; description: string }>>;
};

type Props = {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  values: ResumeFormValues;
  submitLabel: string;
};

export function ResumeForm({ action, values, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, {});
  const [kind, setKind] = useState(values.kind);
  const [current, setCurrent] = useState(!values.endDate);
  const education = kind === "EDUCATION";

  return (
    <ActionForm action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Turi">
          <Select name="kind" value={kind} onChange={(e) => setKind(e.target.value as ResumeKind)}>
            <option value="EXPERIENCE">Ish tajribasi</option>
            <option value="EDUCATION">Ta&apos;lim</option>
          </Select>
        </Field>
        <Field label={education ? "O'quv yurti" : "Kompaniya"}>
          <Input name="organization" defaultValue={values.organization} placeholder={education ? "TATU, Inha..." : "EPAM, Uzum..."} required />
        </Field>
        <Field label="Boshlangan (oy)">
          <Input name="startDate" type="month" defaultValue={values.startDate} required />
        </Field>
        <Field label="Tugagan (oy)">
          <Input name="endDate" type="month" defaultValue={values.endDate} disabled={current} />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox
            name="current"
            label={education ? "Hozir o'qiyapman" : "Hozir shu yerda ishlayapman"}
            checked={current}
            onChange={(e) => setCurrent(e.target.checked)}
          />
        </div>
        <Field label="Joylashuv (ixtiyoriy)">
          <Input name="location" defaultValue={values.location} placeholder="Toshkent, O'zbekiston · Masofaviy" />
        </Field>
        <Field label="Sayt (ixtiyoriy)">
          <Input name="url" type="url" defaultValue={values.url} placeholder="https://..." />
        </Field>
        <Field label="Tartib" hint="0 — eng yuqorida; teng bo'lsa yangisi birinchi">
          <Input name="order" type="number" min={0} defaultValue={values.order} />
        </Field>
      </div>
      <Field group label="Logo (ixtiyoriy)">
        <ImageField name="logo" defaultValue={values.logo} />
      </Field>
      <LocaleTabs>
        {(l) => (
          <>
            <Field label={education ? "Daraja / yo'nalish" : "Lavozim"}>
              <Input
                name={`title.${l}`}
                defaultValue={values.translations[l]?.title}
                placeholder={education ? "Bakalavr, Dasturiy injiniring" : "Senior Backend Engineer"}
              />
            </Field>
            <Field label="Tavsif (ixtiyoriy)">
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
