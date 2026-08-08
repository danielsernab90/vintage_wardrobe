"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GarmentImage } from "@/components/GarmentImage";
import { useWishlist } from "@/context/WishlistContext";
import { JAMES_WHITAKER_SUBSCRIBER_ID } from "@/lib/messages";
import {
  fetchWishlistWithDetails,
  type WishlistItemWithDetails,
} from "@/lib/wishlist";

export function SavedForLater() {
  const { savedIds, busyId, removeItem, refresh } = useWishlist();
  const [items, setItems] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchWishlistWithDetails(JAMES_WHITAKER_SUBSCRIBER_ID);
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, savedIds]);

  return (
    <section className="mt-14 w-full md:mt-16">
      <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
        Saved for Later
      </h2>
      <p className="mt-2 font-sans text-sm text-ink/65">
        Pieces you&apos;ve marked for the next rotation.
      </p>

      {loading ? (
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45">
          Loading saved pieces…
        </p>
      ) : error ? (
        <p className="mt-8 font-sans text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink/60">
          Nothing saved yet. Browse the capsule and tap{" "}
          <span className="text-ink">Save for Next Rotation</span>.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.item_id} className="border border-parchment bg-paper">
              <Link
                href={`/item/${item.item_id}`}
                className="block transition-opacity hover:opacity-80"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
                  <GarmentImage
                    src={item.image}
                    alt={item.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </Link>
              <div className="border-t border-parchment px-4 py-4 md:px-5 md:py-5">
                <Link
                  href={`/item/${item.item_id}`}
                  className="block transition-opacity hover:opacity-80"
                >
                  <h3 className="font-display text-lg leading-snug text-ink md:text-xl">
                    {item.name}
                  </h3>
                  <p className="mt-3 font-display text-xl text-bottle">
                    ${item.price}
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
                      /cycle
                    </span>
                  </p>
                </Link>
                <button
                  type="button"
                  disabled={busyId === item.item_id}
                  onClick={async () => {
                    const ok = await removeItem(item.item_id);
                    if (ok) {
                      setItems((prev) =>
                        prev.filter((row) => row.item_id !== item.item_id),
                      );
                      await refresh();
                    }
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center border border-parchment px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-70 disabled:opacity-50"
                >
                  {busyId === item.item_id ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
