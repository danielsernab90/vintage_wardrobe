/** Client-side upload settings shared by inventory photo flows. */
export const IMAGE_COMPRESS_OPTIONS = {
  maxSizeMB: 0.5, // 500KB target — library iterates quality as needed
  maxWidthOrHeight: 1800,
  initialQuality: 0.85,
  fileType: "image/webp" as const,
  useWebWorker: true,
};

export type CompressedImageResult = {
  file: File;
  objectUrl: string;
  originalBytes: number;
  compressedBytes: number;
};

function webpFileName(originalName: string) {
  const base = originalName.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.webp`;
}

/**
 * Compress an image in the browser before storage/display.
 * Returns a WebP File + object URL sized for catalog/detail use.
 * Loads browser-image-compression only when an upload runs.
 */
export async function compressImageFile(
  file: File,
): Promise<CompressedImageResult> {
  const { default: imageCompression } = await import(
    "browser-image-compression"
  );
  const compressed = await imageCompression(file, IMAGE_COMPRESS_OPTIONS);
  const webp =
    compressed.type === "image/webp"
      ? compressed
      : new File([compressed], webpFileName(file.name), {
          type: "image/webp",
          lastModified: Date.now(),
        });
  const named = webp.name.toLowerCase().endsWith(".webp")
    ? webp
    : new File([webp], webpFileName(file.name), {
        type: "image/webp",
        lastModified: webp.lastModified,
      });

  return {
    file: named,
    objectUrl: URL.createObjectURL(named),
    originalBytes: file.size,
    compressedBytes: named.size,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
