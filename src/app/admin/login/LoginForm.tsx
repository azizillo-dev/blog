"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/features/auth/actions";
import { ActionForm, Field, FormMessage, Input, SubmitButton } from "@/components/ui/form";
import { LockIcon } from "@/components/icons";

export function LoginForm() {
  const [state, action] = useActionState(adminLoginAction, {});
  return (
    <ActionForm action={action} className="animate-pop-in w-full max-w-sm space-y-4 rounded-3xl border border-border bg-surface p-7 shadow-card">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
          <LockIcon />
        </span>
        <h1 className="text-xl font-extrabold">Admin panel</h1>
      </div>
      <Field label="Email">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Parol">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Kirish</SubmitButton>
    </ActionForm>
  );
}
