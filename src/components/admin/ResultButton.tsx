"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/admin/form";
import { ActionForm, FormMessage, SubmitButton } from "@/components/ui/form";

type Props = {
  action: () => Promise<ActionState>;
  label: string;
  variant?: "primary" | "ghost" | "danger";
};

/** Natija (xato/muvaffaqiyat) xabarini ko'rsatadigan bitta tugmali action. */
export function ResultButton({ action, label, variant = "primary" }: Props) {
  const [state, dispatch] = useActionState(() => action(), {});
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionForm action={dispatch}>
        <SubmitButton variant={variant} className="px-3 py-1.5">
          {label}
        </SubmitButton>
      </ActionForm>
      <FormMessage state={state} />
    </div>
  );
}
