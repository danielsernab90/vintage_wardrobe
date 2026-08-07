"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * next/image wrapper that falls back to the parent's neutral background
 * (no broken-image icon) if the asset fails to load.
 */
export function GarmentImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "object-cover",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="absolute inset-0 bg-parchment" aria-hidden="true" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
