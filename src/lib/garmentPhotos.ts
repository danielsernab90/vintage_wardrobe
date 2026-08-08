import { supabase } from "@/lib/supabase";

export const GARMENT_PHOTOS_BUCKET = "garment-photos";

/**
 * Public URL for an object in the garment-photos bucket.
 */
export function getGarmentPhotoPublicUrl(path: string) {
  const { data } = supabase.storage
    .from(GARMENT_PHOTOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract the storage object path from a garment-photos public URL.
 * Returns null for blob/data/local paths or unrelated hosts.
 */
export function storagePathFromPublicUrl(url: string): string | null {
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) return null;
  if (url.startsWith("/")) return null;

  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${GARMENT_PHOTOS_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function extensionForMime(mime: string) {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  return "webp";
}

/**
 * Upload a (preferably compressed) image file to garment-photos.
 * Path: `{itemId}/{timestamp}-{random}.{ext}`
 */
export async function uploadGarmentPhoto(itemId: string, file: File) {
  const ext = extensionForMime(file.type || "image/webp");
  const safeId = itemId.trim().toUpperCase() || "SPEC";
  const path = `${safeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(GARMENT_PHOTOS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/webp",
    });

  if (error) throw error;

  return {
    path,
    publicUrl: getGarmentPhotoPublicUrl(path),
  };
}

/**
 * Delete a garment photo from Storage when the src is a Storage public URL.
 * No-ops (resolves) for local/blob URLs so session-only assets stay safe.
 */
export async function deleteGarmentPhotoByUrl(src: string) {
  const path = storagePathFromPublicUrl(src);
  if (!path) return { deleted: false as const, path: null };

  const { error } = await supabase.storage
    .from(GARMENT_PHOTOS_BUCKET)
    .remove([path]);

  if (error) throw error;
  return { deleted: true as const, path };
}
