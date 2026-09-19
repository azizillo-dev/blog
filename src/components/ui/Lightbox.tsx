"use client";

import Image from "next/image";
import { useRef } from "react";

type Props = { src: string; alt: string; children: React.ReactNode };

/** Native <dialog> asosidagi yengil lightbox: focus-trap va Escape brauzerning o'zida. */
export function Lightbox({ src, alt, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="block w-full cursor-zoom-in text-left" aria-label={alt}>
        {children}
      </button>
      <dialog
        ref={ref}
        onClick={() => ref.current?.close()}
        className="m-auto max-h-[90dvh] max-w-[min(92vw,1100px)] bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm open:animate-pop-in"
      >
        <Image src={src} alt={alt} width={1600} height={1100} sizes="92vw" className="h-auto max-h-[90dvh] w-auto rounded-2xl object-contain" />
      </dialog>
    </>
  );
}
