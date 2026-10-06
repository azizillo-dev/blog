import Image from "next/image";
import type { Block } from "@/lib/content/blocks";
import { DownloadIcon } from "@/components/icons";
import { BlockRenderer } from "./BlockRenderer";

type Props = { title: string; image: string; blocks: Block[]; cv?: { url: string; label: string } };

/** "Blog" (muallif haqida) sahifasining boshi: avatar, sarlavha va blok-kontent (admin → "Blog: Men haqimda"). */
export function AboutIntro({ title, image, blocks, cv }: Props) {
  return (
    <section className="pt-10 sm:pt-16">
      <div className="animate-fade-up flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        {image && (
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-card sm:size-32">
            <Image src={image} alt={title} fill priority sizes="128px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0">
          {title && <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>}
          {cv?.url && (
            <a
              href={cv.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold shadow-card transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <DownloadIcon /> {cv.label}
            </a>
          )}
        </div>
      </div>
      {blocks.length > 0 && <BlockRenderer blocks={blocks} className="animate-fade-up mt-8 [--i:1]" />}
    </section>
  );
}
