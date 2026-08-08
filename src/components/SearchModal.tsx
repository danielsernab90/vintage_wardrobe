"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { CyclePrice } from "@/components/CyclePrice";
import { GarmentImage } from "@/components/GarmentImage";
import { useInventory } from "@/context/InventoryContext";
import type { InventoryItem } from "@/data/inventory";

function matchesQuery(item: InventoryItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const haystack = [item.name, item.era, item.fabric, item.category]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { items } = useInventory();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return items.filter((item) => matchesQuery(item, query));
  }, [items, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-6 sm:px-5 sm:py-10"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-brass bg-paper shadow-[0_8px_28px_rgba(28,26,23,0.12)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-parchment px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <p
              id={titleId}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass"
            >
              Search capsule
            </p>
            <label htmlFor="site-search" className="sr-only">
              Search by name, era, fabric, or category
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, era, fabric, category…"
              className="mt-3 w-full border-0 bg-transparent font-display text-2xl text-ink outline-none placeholder:text-ink/30 md:text-3xl"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto">
          {!query.trim() ? (
            <p className="px-5 py-10 font-sans text-sm text-ink/55 sm:px-6">
              Start typing to search this month&apos;s capsule.
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-10 font-sans text-sm text-ink/55 sm:px-6">
              No items match your search
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {results.map((item) => (
                <SearchResultTile
                  key={item.id}
                  item={item}
                  onNavigate={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultTile({
  item,
  onNavigate,
}: {
  item: InventoryItem;
  onNavigate: () => void;
}) {
  return (
    <article className="group block border-b border-parchment bg-paper sm:border-r">
      <Link
        href={`/item/${item.id}`}
        onClick={onNavigate}
        className="block transition-opacity hover:opacity-80"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
          <GarmentImage
            src={item.image}
            alt={item.name}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <ConditionGradeTag
            grade={item.grade}
            className="absolute top-0 right-0 z-10"
          />
        </div>
        <div className="border-t border-parchment px-4 py-4 md:px-5 md:py-5">
          <h3 className="font-display text-lg leading-snug text-ink md:text-xl">
            {item.name}
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/65">
            {item.era} · {item.fabric}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
            {item.category}
          </p>
          <div className="mt-3">
            <CyclePrice price={item.price} originalPrice={item.originalPrice} />
          </div>
        </div>
      </Link>
    </article>
  );
}
