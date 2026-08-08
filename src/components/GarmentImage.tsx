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

function isLocalObjectUrl(src: string) {
  return src.startsWith("blob:") || src.startsWith("data:");
}

/**
 * next/image wrapper that falls back to the parent's neutral background
 * (no broken-image icon) if the asset fails to load.
 * Session uploads use blob:/data: URLs via a plain <img>.
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

  if (isLocalObjectUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
        onError={() => setFailed(true)}
      />
    );
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
