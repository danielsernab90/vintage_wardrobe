"use client";

import { useEffect, useId } from "react";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import type { InventoryItem } from "@/data/inventory";

type Props = {
  item: InventoryItem;
  onClose: () => void;
};

export function IncidentLogModal({ item, onClose }: Props) {
  const titleId = useId();
  const hasFlagged = item.incidents.some((entry) => entry.flagged);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
        className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto border border-brass bg-paper px-5 py-5 shadow-[0_8px_28px_rgba(28,26,23,0.12)] sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                hasFlagged ? "text-oxblood" : "text-brass"
              }`}
            >
              Incident log
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-2xl font-medium leading-snug text-ink"
            >
              {item.name}
            </h2>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/55">
              {item.id}
            </p>
            <div className="mt-3">
              <ConditionGradeTag grade={item.grade} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <div className="mt-6 border-t border-parchment pt-5">
          {item.incidents.length === 0 ? (
            <p className="font-sans text-sm text-ink/60">
              Clean history — no incidents recorded.
            </p>
          ) : (
            <ul className="space-y-4">
              {item.incidents.map((entry) => (
                <li key={`${entry.date}-${entry.note}`}>
                  <p
                    className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                      entry.flagged ? "text-oxblood" : "text-ink/50"
                    }`}
                  >
                    {entry.date}
                  </p>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink/80">
                    {entry.note}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
