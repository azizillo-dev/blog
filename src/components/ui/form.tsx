"use client";

import { createContext, useContext, useTransition } from "react";
import type { ActionState } from "@/features/admin/form";
import { cn } from "@/lib/utils";

const PendingContext = createContext(false);

/**
 * `<form action>` o'rniga: React 19 action'dan keyin formani tozalab yuboradi — xato bo'lsa
 * kiritilgan matn yo'qoladi. Bu wrapper tozalamaydi va pending holatini SubmitButton'ga beradi.
 */
export function ActionForm({
  action,
  className,
  children,
}: {
  action: (fd: FormData) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => action(fd));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  /** Ichida tugmalar bo'lgan murakkab vidjetlar (blok-editor, rasm) uchun "group" — <label> emas. */
  group?: boolean;
};

export function Field({ label, hint, children, className, group }: FieldProps) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={cn("block", className)} {...(group && { role: "group", "aria-label": label })}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </Tag>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputClass, "resize-y leading-relaxed", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "cursor-pointer", props.className)} />;
}

export function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
      <input type="checkbox" {...props} className="size-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" };

const VARIANT = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  ghost: "border border-border bg-surface hover:bg-surface-2",
  danger: "border border-red-500/30 text-red-500 hover:bg-red-500/10",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[opacity,transform,background-color] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANT[variant],
        className,
      )}
    />
  );
}

export function SubmitButton({ children, ...props }: ButtonProps) {
  const pending = useContext(PendingContext);
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? "..." : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) return <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-500">{state.error}</p>;
  if (state.ok) return <p className="rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-500">{state.message ?? "Saqlandi ✔"}</p>;
  return null;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}>{children}</div>;
}
