"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import { requestAccessAction, verifyCodeAction, type GateState } from "@/features/private/actions";
import { routes } from "@/lib/routes";
import { format } from "@/i18n";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/ui/form";
import { LockIcon } from "@/components/icons";

type T = Dictionary["private"];

/**
 * Private bo'lim "darvozasi": so'rov → email kodi → kutish.
 * Ikkala action bir xil GateState qaytaradi — bitta holat mashinasi, oxirgi javob qaysi qadamda ekanini aytadi.
 */
export function PrivateGate({ locale, t }: { locale: Locale; t: T }) {
  const [state, dispatch] = useActionState(
    (prev: GateState, fd: FormData) => (fd.has("requestId") ? verifyCodeAction(prev, fd) : requestAccessAction(locale, prev, fd)),
    { step: "request" },
  );
  const error = "error" in state && state.error ? t.errors[state.error] : null;

  return (
    <div className="animate-pop-in mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <LockIcon size={26} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {state.step === "code" ? t.codeSentTitle : state.step === "pending" ? t.pendingTitle : t.lockedTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {state.step === "code" ? format(t.codeSentText, { email: state.email }) : state.step === "pending" ? t.pendingText : t.lockedText}
        </p>
      </div>

      {state.step === "request" && (
        <ActionForm action={dispatch} className="space-y-4">
          <Field label={t.email}>
            <Input name="email" type="email" autoComplete="email" required maxLength={254} />
          </Field>
          <Field label={t.message}>
            <Textarea name="message" placeholder={t.messagePlaceholder} required minLength={5} maxLength={1000} />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <SubmitButton className="w-full">{t.send}</SubmitButton>
        </ActionForm>
      )}

      {state.step === "code" && (
        <ActionForm action={dispatch} className="space-y-4">
          <input type="hidden" name="requestId" value={state.requestId} />
          <Field label={t.code}>
            <Input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              className="text-center font-mono text-2xl tracking-[0.5em]"
            />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
          <SubmitButton className="w-full">{t.verify}</SubmitButton>
        </ActionForm>
      )}

      {state.step !== "pending" && (
        <p className="mt-6 text-center text-sm text-muted">
          {t.haveAccess}{" "}
          <Link href={routes.privateLogin(locale)} className="font-semibold text-accent hover:underline">
            {t.login}
          </Link>
        </p>
      )}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-500">{children}</p>;
}
