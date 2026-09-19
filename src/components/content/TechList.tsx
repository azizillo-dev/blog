import { cn } from "@/lib/utils";

export function TechList({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((t) => (
        <li key={t} className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {t}
        </li>
      ))}
    </ul>
  );
}
