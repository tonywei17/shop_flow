"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImage = { url: string };

type Props = {
  name: string;
  primaryImageUrl?: string | null;
  images?: ProductImage[];
};

export function ProductImages({ name, primaryImageUrl, images = [] }: Props) {
  const initialImage = primaryImageUrl ?? images[0]?.url ?? null;
  const [activeImage, setActiveImage] = useState<string | null>(initialImage);

  const thumbnails = images.length ? images : initialImage ? [{ url: initialImage }] : [];

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden relative">
        {activeImage ? (
          <Image
            key={activeImage}
            src={activeImage}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            unoptimized
          />
        ) : (
          <Package className="h-24 w-24 text-muted-foreground" />
        )}
      </div>

      {thumbnails.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {thumbnails.map((img, idx) => {
            const isActive = img.url === activeImage;
            return (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                onClick={() => setActiveImage(img.url)}
                className={cn(
                  "aspect-square bg-muted rounded-md overflow-hidden border relative focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "ring-2 ring-primary" : "hover:border-primary/60"
                )}
                aria-label={`画像 ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="100px"
                  priority={false}
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
