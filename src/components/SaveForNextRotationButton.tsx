"use client";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

type Props = {
  garmentId: string;
  className?: string;
};

export function SaveForNextRotationButton({
  garmentId,
  className = "",
}: Props) {
  const { role, signInAsCustomer } = useAuth();
  const { isSaved, saveItem, removeItem, busyId } = useWishlist();
  const saved = isSaved(garmentId);
  const busy = busyId === garmentId;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (role !== "customer") {
          signInAsCustomer();
        }
        if (saved) {
          await removeItem(garmentId);
          return;
        }
        await saveItem(garmentId);
      }}
      className={`inline-flex w-full items-center justify-center border border-brass bg-transparent px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-70 disabled:opacity-50 ${className}`}
    >
      {busy
        ? saved
          ? "Removing…"
          : "Saving…"
        : saved
          ? "Saved for Next Rotation"
          : "Save for Next Rotation"}
    </button>
  );
}
