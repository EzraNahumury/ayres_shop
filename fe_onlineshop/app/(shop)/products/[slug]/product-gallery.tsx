"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: number;
  image_url: string;
  alt_text: string | null;
}

export function ProductGallery({
  images,
  productName,
  fallback,
}: {
  images: GalleryImage[];
  productName: string;
  fallback: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const list = images.length > 0 ? images : [{ id: 0, image_url: fallback, alt_text: productName }];
  const active = list[activeIdx] || list[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
        <Image
          src={active.image_url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {list.map((img, i) => (
            <button
              key={img.id || i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden bg-neutral-100 ring-2 transition-all cursor-pointer",
                i === activeIdx
                  ? "ring-black"
                  : "ring-transparent hover:ring-neutral-300"
              )}
              aria-label={`Lihat foto ${i + 1}`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || productName}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
