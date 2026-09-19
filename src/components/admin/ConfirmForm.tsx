"use client";

import { Button } from "@/components/ui/form";

type Props = {
  action: () => Promise<void>;
  label: string;
  confirm: string;
  variant?: "danger" | "ghost" | "primary";
};

/** Server action'ni tasdiqlashdan so'ng bajaradigan kichik forma (o'chirish va h.k.). */
export function ConfirmForm({ action, label, confirm, variant = "danger" }: Props) {
  return (
    <form action={action} onSubmit={(e) => !window.confirm(confirm) && e.preventDefault()}>
      <Button type="submit" variant={variant} className="px-3 py-1.5">
        {label}
      </Button>
    </form>
  );
}
