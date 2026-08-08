"use client";

import { useEffect, useId, useState } from "react";
import { discountedPriceFromPercent } from "@/data/inventory";

type Props = {
  itemName: string;
  currentPrice: number;
  onClose: () => void;
  onConfirm: (percent: number) => void;
};

export function DiscountModal({
  itemName,
  currentPrice,
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId();
  const [percent, setPercent] = useState("20");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const percentNum = Number(percent);
  const preview =
    Number.isFinite(percentNum) && percentNum > 0 && percentNum < 100
      ? discountedPriceFromPercent(currentPrice, percentNum)
      : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(percentNum) || percentNum <= 0 || percentNum >= 100) {
      setError("Enter a discount between 1 and 99%.");
      return;
    }
    onConfirm(percentNum);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-4 py-6 sm:items-center sm:px-5"
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
        className="relative z-10 w-full max-w-sm border border-brass bg-paper px-5 py-5 shadow-[0_8px_28px_rgba(28,26,23,0.12)] sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Price adjust
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-xl font-medium leading-snug text-ink"
            >
              Apply Discount
            </h2>
            <p className="mt-2 font-sans text-sm text-ink/60">{itemName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-parchment pt-5">
          <div>
            <label
              htmlFor="discount-percent"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55"
            >
              Discount by
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="discount-percent"
                type="number"
                min="1"
                max="99"
                step="1"
                value={percent}
                onChange={(e) => {
                  setPercent(e.target.value);
                  setError(null);
                }}
                className="w-full border border-ink/20 bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-ink"
                autoFocus
              />
              <span className="font-mono text-sm text-ink/60">%</span>
            </div>
          </div>

          <div className="border border-parchment bg-parchment/30 px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
              New price
            </p>
            <p className="mt-1 font-display text-2xl text-bottle">
              {preview === null ? "—" : `$${preview}`}
              <span className="ml-2 font-sans text-xs text-ink/45">
                from ${currentPrice}
              </span>
            </p>
          </div>

          {error ? (
            <p className="font-sans text-sm text-oxblood">{error}</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border border-ink/20 px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-ink px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
            >
              Confirm Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
