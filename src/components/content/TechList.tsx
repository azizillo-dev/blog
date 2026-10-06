import { cn } from "@/lib/utils";

type Props = { items: string[]; className?: string; max?: number };

/** `max` berilsa, ortiqchasi "+N" bo'lib ko'rsatiladi — kartalar bir xil balandlikda qoladi. */
export function TechList({ items, className, max }: Props) {
  if (items.length === 0) return null;
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((t) => (
        <li key={t} className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {t}
        </li>
      ))}
      {rest > 0 && (
        <li title={items.slice(max).join(", ")} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
          +{rest}
        </li>
      )}
    </ul>
  );
}
