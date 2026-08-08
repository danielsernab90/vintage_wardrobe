"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useInventory } from "@/context/InventoryContext";
import type { InventoryItem } from "@/data/inventory";

type Props = {
  item: InventoryItem;
  onClose: () => void;
};

export function ImageManagementModal({ item, onClose }: Props) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const { getById, addItemImage, removeItemImage, setPrimaryImage } =
    useInventory();
  const live = getById(item.id) ?? item;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setIndex((prev) => Math.max(0, prev - 1));
      }
      if (event.key === "ArrowRight") {
        setIndex((prev) => Math.min(live.images.length - 1, prev + 1));
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, live.images.length]);

  useEffect(() => {
    if (index > live.images.length - 1) {
      setIndex(Math.max(0, live.images.length - 1));
    }
  }, [live.images.length, index]);

  const current = live.images[index];
  const isPrimary = current?.id === live.primaryImageId;
  const canDelete = live.images.length > 1 && !isPrimary;

  function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    addItemImage(live.id, url);
    setIndex(live.images.length); // new image will be last
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 py-6 sm:items-center sm:px-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-brass bg-paper px-5 py-5 shadow-[0_8px_28px_rgba(28,26,23,0.12)] sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Image management
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-2xl font-medium leading-snug text-ink"
            >
              {live.name}
            </h2>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/55">
              {live.id} · {live.images.length} photo
              {live.images.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <div className="relative mt-5 border border-parchment bg-parchment">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={`${live.name} photo ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {isPrimary ? (
              <span className="absolute left-0 top-0 bg-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-paper">
                ★ Primary
              </span>
            ) : null}
          </div>

          {live.images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                disabled={index === 0}
                onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-paper/90 px-2 py-2 font-mono text-sm text-ink disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next photo"
                disabled={index === live.images.length - 1}
                onClick={() =>
                  setIndex((prev) =>
                    Math.min(live.images.length - 1, prev + 1),
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-paper/90 px-2 py-2 font-mono text-sm text-ink disabled:opacity-30"
              >
                →
              </button>
            </>
          ) : null}
        </div>

        {live.images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-2">
            {live.images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`relative h-14 w-11 overflow-hidden border ${
                  i === index ? "border-ink" : "border-parchment"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {img.id === live.primaryImageId ? (
                  <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-0.5 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-paper">
                    ★ Pri
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isPrimary ? (
            <button
              type="button"
              onClick={() => setPrimaryImage(live.id, current.id)}
              className="bg-ink px-3 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
            >
              Set as Primary
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => {
                removeItemImage(live.id, current.id);
              }}
              className="border border-oxblood/40 px-3 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-oxblood transition-opacity hover:opacity-80"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border border-ink/20 px-3 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:border-ink"
          >
            + Upload More
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        <div className="mt-5 border-t border-parchment pt-4">
          <Link
            href={`/item/${live.id}`}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/60 underline-offset-4 transition-opacity hover:text-ink hover:underline"
            onClick={onClose}
          >
            View Public Page →
          </Link>
        </div>
      </div>
    </div>
  );
}
