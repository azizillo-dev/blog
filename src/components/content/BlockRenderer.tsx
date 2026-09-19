import Image from "next/image";
import type { Block } from "@/lib/content/blocks";
import { youtubeEmbedUrl } from "@/lib/content/blocks";
import { cn } from "@/lib/utils";
import { InlineText } from "./InlineText";

type ImageBlock = Extract<Block, { type: "image" }>;

// full: ekran kengligiga yaqin; wide: matndan kengroq; left/right: matn yonida (faqat sm+).
const IMAGE_LAYOUT: Record<ImageBlock["layout"], { figure: string; sizes: string }> = {
  full: { figure: "relative left-1/2 w-[min(100vw-2rem,72rem)] -translate-x-1/2", sizes: "(min-width: 1152px) 1152px, 100vw" },
  wide: { figure: "relative left-1/2 w-[min(100vw-2rem,56rem)] -translate-x-1/2", sizes: "(min-width: 896px) 896px, 100vw" },
  center: { figure: "w-full", sizes: "(min-width: 672px) 672px, 100vw" },
  left: { figure: "w-full sm:float-left sm:mb-4 sm:mr-6 sm:mt-1.5 sm:w-1/2", sizes: "(min-width: 640px) 336px, 100vw" },
  right: { figure: "w-full sm:float-right sm:mb-4 sm:ml-6 sm:mt-1.5 sm:w-1/2", sizes: "(min-width: 640px) 336px, 100vw" },
};

function ContentImage({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className?: string }) {
  // Asl nisbat noma'lum: width/height faqat srcset uchun, balandlik CSS'da avtomatik.
  return <Image src={src} alt={alt} width={1600} height={1000} sizes={sizes} className={cn("h-auto w-full rounded-2xl", className)} />;
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 3 ? "h3" : "h2";
      return <Tag key={key}><InlineText text={block.text} /></Tag>;
    }
    case "paragraph":
      return <p key={key}><InlineText text={block.text} /></p>;
    case "image": {
      const layout = IMAGE_LAYOUT[block.layout];
      return (
        <figure key={key} className={layout.figure}>
          <ContentImage src={block.src} alt={block.alt} sizes={layout.sizes} />
          {block.caption && <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      );
    }
    case "gallery":
      return (
        <div key={key} className={cn("grid gap-3", block.images.length > 1 && "grid-cols-2", block.images.length > 4 && "sm:grid-cols-3")}>
          {block.images.map((img, i) => (
            <ContentImage key={i} src={img.src} alt={img.alt} sizes="(min-width: 640px) 320px, 50vw" className="aspect-square object-cover" />
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote key={key}>
          <InlineText text={block.text} />
          {block.cite && <footer className="mt-2 text-sm not-italic">— {block.cite}</footer>}
        </blockquote>
      );
    case "code":
      return (
        <pre key={key} data-lang={block.lang}>
          <code>{block.code}</code>
        </pre>
      );
    case "divider":
      return <hr key={key} />;
    case "embed": {
      const src = youtubeEmbedUrl(block.url);
      if (!src) return null;
      return (
        <div key={key} className="relative aspect-video overflow-hidden rounded-2xl border border-border">
          <iframe src={src} title="YouTube" loading="lazy" allowFullScreen className="absolute inset-0 size-full" />
        </div>
      );
    }
  }
}

export function BlockRenderer({ blocks, className }: { blocks: Block[]; className?: string }) {
  return <div className={cn("prose-content", className)}>{blocks.map(renderBlock)}</div>;
}
