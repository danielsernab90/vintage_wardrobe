"use client";

import { useCart } from "@/context/CartContext";

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5h11l-.7 10.2a1.5 1.5 0 0 1-1.5 1.4H8.7a1.5 1.5 0 0 1-1.5-1.4L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartButton() {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      className="relative p-0.5 transition-opacity hover:opacity-60"
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
      onClick={toggleCart}
    >
      <BagIcon />
      {itemCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-ink px-1 font-mono text-[9px] leading-none text-paper">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
