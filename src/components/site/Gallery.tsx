"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaLike } from "@/lib/resources";

/** Masonry photo grid with a keyboard-friendly lightbox. */
export default function Gallery({ images, title }: { images: MediaLike[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (!images.length) return null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setOpen(i)}
            className="group relative mb-4 block w-full overflow-hidden rounded-xl bg-gray-100"
          >
            <Image
              src={img.url}
              alt={`${title} photo ${i + 1}`}
              width={img.width || 1200}
              height={img.height || 900}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={close}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={close} aria-label="Close">
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <div className="relative h-[85vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open].url} alt={`${title} photo ${open + 1}`} fill sizes="90vw" className="object-contain" />
          </div>
          <button
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <p className="absolute bottom-4 text-sm text-gray-400">
            {open + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
