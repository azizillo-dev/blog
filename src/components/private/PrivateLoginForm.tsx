"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import { privateLoginAction } from "@/features/private/actions";
import { routes } from "@/lib/routes";
import { ActionForm, Field, Input, SubmitButton } from "@/components/ui/form";
import { LockIcon } from "@/components/icons";

export function PrivateLoginForm({ locale, t }: { locale: Locale; t: Dictionary["private"] }) {
  const [state, action] = useActionState(privateLoginAction.bind(null, locale), {});

  return (
    <div className="animate-pop-in mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <LockIcon size={26} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">{t.title}</h1>
      </div>
      <ActionForm action={action} className="space-y-4">
        <Field label={t.email}>
          <Input name="email" type="email" autoComplete="username" required />
        </Field>
        <Field label={t.password}>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        {state.error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-500">
            {t.errors[state.error]}
          </p>
        )}
        <SubmitButton className="w-full">{t.login}</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm">
        <Link href={routes.section(locale, "private", "PRIVATE")} className="font-semibold text-accent hover:underline">
          {t.newRequest}
        </Link>
      </p>
    </div>
  );
}
