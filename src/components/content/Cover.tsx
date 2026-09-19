import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = { src: string; alt: string; sizes: string; priority?: boolean; className?: string };

/** Muqova rasmi. Rasm bo'lmasa — yengil gradient zaxira. Ota element `relative` va o'lchamli bo'lishi kerak. */
export function Cover({ src, alt, sizes, priority, className }: Props) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cn("absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,var(--accent-soft),var(--surface-2))]", className)}
      />
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
}
