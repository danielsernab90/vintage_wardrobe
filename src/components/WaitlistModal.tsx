"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useWaitlist } from "@/context/WaitlistContext";

export function WaitlistModal() {
  const { isOpen, tier, closeWaitlist } = useWaitlist();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setSubmitted(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeWaitlist();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeWaitlist]);

  if (!isOpen) return null;

  const headline = tier
    ? `Join the Waitlist — ${tier.name} ($${tier.price}/mo, ${tier.piecesLabel})`
    : "Join the Waitlist";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 py-6 sm:items-center sm:px-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/30"
        aria-label="Close dialog"
        onClick={closeWaitlist}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto border border-brass bg-paper px-5 py-5 shadow-[0_8px_28px_rgba(28,26,23,0.12)] sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Waitlist
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-2xl font-medium leading-snug text-ink"
            >
              {headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeWaitlist}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        {submitted ? (
          <p className="mt-8 border-t border-parchment pt-6 font-display text-xl leading-snug text-ink">
            Thanks — we&apos;ll be in touch!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 border-t border-parchment pt-6">
            <p className="font-sans text-sm leading-relaxed text-ink/70">
              Leave your email and we&apos;ll notify you when the next capsule opens.
            </p>
            <label className="mt-6 block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border border-parchment bg-paper px-3 py-3 font-sans text-sm text-ink outline-none placeholder:text-ink/35 focus:border-brass"
              />
            </label>
            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center bg-ink px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80"
            >
              Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
