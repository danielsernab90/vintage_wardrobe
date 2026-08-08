"use client";

import { useEffect, useId, useState } from "react";
import {
  getRevenueStatDetails,
  type RevenueStatDetail,
  type RevenueStatKey,
} from "@/data/inventory";

export function RevenueSnapshot() {
  const stats = getRevenueStatDetails();
  const [activeKey, setActiveKey] = useState<RevenueStatKey | null>(null);
  const titleId = useId();

  const active = stats.find((stat) => stat.key === activeKey) ?? null;

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveKey(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return (
    <>
      <div className="mt-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
          Revenue Snapshot
        </p>
        <div className="grid grid-cols-2 gap-px bg-parchment md:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setActiveKey(stat.key)}
              className="bg-paper px-4 py-5 text-left transition-opacity hover:opacity-80 md:px-5"
              aria-haspopup="dialog"
            >
              <p className="font-display text-3xl text-ink md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
                {stat.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {active ? (
        <RevenueDetailModal
          detail={active}
          titleId={titleId}
          onClose={() => setActiveKey(null)}
        />
      ) : null}
    </>
  );
}

function RevenueDetailModal({
  detail,
  titleId,
  onClose,
}: {
  detail: RevenueStatDetail;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center px-4 py-6 sm:items-center sm:px-5" role="presentation">
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
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Detail
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-2xl font-medium text-ink"
            >
              {detail.title}
            </h2>
            <p className="mt-1 font-display text-3xl text-bottle">{detail.value}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <ul className="mt-6 space-y-3 border-t border-parchment pt-5">
          {detail.lines.map((line) => (
            <li
              key={line}
              className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink/75"
            >
              {line}
            </li>
          ))}
        </ul>

        {detail.note ? (
          <p className="mt-5 font-sans text-sm text-bottle">{detail.note}</p>
        ) : null}
      </div>
    </div>
  );
}
