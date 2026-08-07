"use client";

import { useCart } from "@/context/CartContext";

type Props = {
  garmentId: string;
  className?: string;
  label?: string;
};

export function AddToRotationButton({
  garmentId,
  className = "",
  label = "Add to Rotation",
}: Props) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(garmentId);
      }}
      className={`inline-flex w-full items-center justify-center bg-ink px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 ${className}`}
    >
      {label}
    </button>
  );
}
