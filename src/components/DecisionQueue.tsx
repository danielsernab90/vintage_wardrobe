"use client";

import { useState } from "react";
import Link from "next/link";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import {
  decisionReason,
  getDecisionQueue,
  type InventoryItem,
} from "@/data/inventory";

type QueueAction = "Repair" | "Discount & Keep" | "Retire";

const actions: QueueAction[] = ["Repair", "Discount & Keep", "Retire"];

export function DecisionQueue() {
  const flagged = getDecisionQueue();
  const [marked, setMarked] = useState<Record<string, QueueAction>>({});

  function mark(item: InventoryItem, action: QueueAction) {
    setMarked((prev) => ({ ...prev, [item.id]: action }));
  }

  return (
    <section className="mt-14 border border-oxblood/35 bg-paper md:mt-16">
      <div className="border-b border-oxblood/25 px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxblood">
          Decision queue
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Needs Attention
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Grade C pieces and items with 8+ cycles — review for repair, discount,
          or retirement.
        </p>
      </div>

      {flagged.length === 0 ? (
        <p className="px-5 py-10 font-sans text-sm text-ink/60 md:px-6">
          Nothing needs attention right now.
        </p>
      ) : (
        <ul className="divide-y divide-parchment">
          {flagged.map((item) => {
            const action = marked[item.id];
            return (
              <li
                key={item.id}
                className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                    {item.id} · {decisionReason(item)}
                  </p>
                  <Link
                    href={`/item/${item.id}`}
                    className="mt-1 block font-display text-lg text-ink transition-opacity hover:opacity-70"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <ConditionGradeTag grade={item.grade} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/60">
                      {item.cycles} cycles
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  {action ? (
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bottle">
                      ✓ Marked for {action}
                    </p>
                  ) : (
                    actions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => mark(item, label)}
                        className="border border-ink/20 bg-paper px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:border-ink hover:opacity-80"
                      >
                        {label}
                      </button>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
