import type { Locale } from "@/lib/constants";
import { format, type Dictionary } from "@/i18n";
import { formatDate } from "@/lib/utils";

type Props = { date: Date; minutes: number; locale: Locale; dict: Dictionary; className?: string };

export function PostMeta({ date, minutes, locale, dict, className }: Props) {
  return (
    <p className={className ?? "text-sm text-muted"}>
      <time dateTime={date.toISOString()}>{formatDate(date, locale)}</time>
      <span aria-hidden> · </span>
      {format(dict.home.readTime, { n: minutes })}
    </p>
  );
}
