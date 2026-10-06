import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { ArrowLeftIcon } from "@/components/icons";

type Props = { backHref: string; homeHref: string; dict: Dictionary };

/** Batafsil sahifalar tepasidagi "Orqaga" va "Bosh sahifa" havolalari. */
export function DetailHeader({ backHref, homeHref, dict }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg">
        <ArrowLeftIcon /> {dict.post.back}
      </Link>
      <Link href={homeHref} className="text-muted transition-colors hover:text-fg">
        {dict.common.home}
      </Link>
    </div>
  );
}
