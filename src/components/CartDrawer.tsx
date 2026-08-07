"use client";

import Image from "next/image";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { MAX_ITEM_QTY, useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    items,
    isOpen,
    checkoutComplete,
    estimatedMonthlyTotal,
    closeCart,
    removeItem,
    setQuantity,
    checkout,
    dismissCheckout,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Cart">
      <button
        type="button"
        className="absolute inset-0 bg-ink/25"
        aria-label="Close cart"
        onClick={closeCart}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-brass bg-paper">
        <div className="flex items-center justify-between border-b border-parchment px-5 py-4">
          <h2 className="font-display text-xl text-ink">Your Rotation</h2>
          <button
            type="button"
            onClick={closeCart}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        {checkoutComplete ? (
          <div className="flex flex-1 flex-col justify-center px-6 py-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Request received
            </p>
            <p className="mt-5 font-display text-2xl leading-snug text-ink">
              Thanks — we&apos;ll be in touch to finalize your rotation.
            </p>
            <p className="mt-4 font-sans text-sm leading-relaxed text-ink/65">
              No payment has been taken. This is a demo confirmation only.
            </p>
            <button
              type="button"
              onClick={dismissCheckout}
              className="mt-10 inline-flex w-full items-center justify-center bg-ink px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80"
            >
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="py-10 text-center font-sans text-sm text-ink/60">
                  Your rotation is empty. Add pieces from the capsule.
                </p>
              ) : (
                <ul className="space-y-0">
                  {items.map((line) => (
                    <li
                      key={line.garment.id}
                      className="flex gap-4 border-b border-parchment py-4"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-parchment">
                        <Image
                          src={line.garment.image}
                          alt={line.garment.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-base leading-snug text-ink">
                              {line.garment.name}
                            </p>
                            <div className="mt-2">
                              <ConditionGradeTag grade={line.garment.grade} />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(line.garment.id)}
                            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45 transition-opacity hover:opacity-70"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border border-parchment">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="px-2.5 py-1 font-mono text-sm text-ink transition-opacity hover:opacity-60"
                              onClick={() =>
                                setQuantity(line.garment.id, line.quantity - 1)
                              }
                            >
                              −
                            </button>
                            <span className="min-w-[1.5rem] text-center font-mono text-[11px] tabular-nums text-ink">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={line.quantity >= MAX_ITEM_QTY}
                              className="px-2.5 py-1 font-mono text-sm text-ink transition-opacity hover:opacity-60 disabled:opacity-30"
                              onClick={() =>
                                setQuantity(line.garment.id, line.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <p className="font-display text-lg text-bottle">
                            ${line.garment.price * line.quantity}
                            <span className="ml-1 font-sans text-[10px] tracking-normal text-ink/45">
                              /cycle
                            </span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-parchment px-5 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  Estimated monthly total
                </p>
                <p className="font-display text-2xl text-bottle">
                  ${estimatedMonthlyTotal}
                  <span className="ml-1 font-sans text-xs tracking-normal text-ink/45">
                    /mo
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={checkout}
                className="mt-5 inline-flex w-full items-center justify-center bg-ink px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 disabled:opacity-35"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
