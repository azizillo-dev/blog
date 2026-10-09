"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"GALLERY">; onReady: () => void };

const TILTS = ["-3deg", "2deg", "-1.5deg", "3deg", "-2deg"];

/** Polaroid suratlar: telefonda surib ko'riladi, har birining ostida qo'lyozma izoh. */
export function GalleryScene({ data, onReady }: Props) {
  const photos = data.photos.filter((p) => p.src);
  useEffect(onReady, [onReady]);

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:justify-center sm:overflow-visible">
      {photos.map((photo, i) => (
        <figure
          key={i}
          style={{ "--i": i, rotate: TILTS[i % TILTS.length] } as React.CSSProperties}
          className="animate-fade-up w-64 shrink-0 snap-center rounded-sm bg-white p-3 pb-4 shadow-card"
        >
          <div className="relative aspect-square overflow-hidden bg-neutral-200">
            <Image src={photo.src} alt={photo.caption} fill sizes="256px" className="object-cover" />
          </div>
          {photo.caption && <figcaption className="mt-3 text-center text-sm text-[#3b3328]">{photo.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
