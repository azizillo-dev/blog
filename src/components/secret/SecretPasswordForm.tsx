"use client";

import { useActionState } from "react";
import { unlockSecretAction } from "@/features/secret/unlock";
import { ActionForm, Field, Input, SubmitButton } from "@/components/ui/form";
import { LockIcon } from "@/components/icons";

export function SecretPasswordForm({ slug, title }: { slug: string; title: string }) {
  const [state, dispatch] = useActionState(unlockSecretAction.bind(null, slug), {} as { error?: string });

  return (
    <div className="animate-pop-in mx-auto mt-16 w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center shadow-card sm:p-8">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <LockIcon size={26} />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">{title || "Parol kerak"}</h1>
      <p className="mt-2 text-sm text-muted">Bu sahifa parol bilan yopilgan.</p>
      <ActionForm action={dispatch} className="mt-6 space-y-4 text-left">
        <Field label="Parol">
          <Input name="password" type="password" required autoFocus maxLength={200} />
        </Field>
        {state.error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-500">
            {state.error}
          </p>
        )}
        <SubmitButton className="w-full">Ochish</SubmitButton>
      </ActionForm>
    </div>
  );
}
