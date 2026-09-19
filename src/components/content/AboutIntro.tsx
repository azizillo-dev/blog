import Image from "next/image";
import type { Block } from "@/lib/content/blocks";
import { BlockRenderer } from "./BlockRenderer";

type Props = { title: string; image: string; blocks: Block[] };

/** "Blog" (muallif haqida) sahifasining boshi: avatar, sarlavha va blok-kontent (admin → "Blog: Men haqimda"). */
export function AboutIntro({ title, image, blocks }: Props) {
  return (
    <section className="pt-10 sm:pt-16">
      <div className="animate-fade-up flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        {image && (
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-card sm:size-32">
            <Image src={image} alt={title} fill priority sizes="128px" className="object-cover" />
          </div>
        )}
        {title && <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>}
      </div>
      {blocks.length > 0 && <BlockRenderer blocks={blocks} className="animate-fade-up mt-8 [--i:1]" />}
    </section>
  );
}
