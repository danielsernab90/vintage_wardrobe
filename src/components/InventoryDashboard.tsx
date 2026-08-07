"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { DecisionQueue } from "@/components/DecisionQueue";
import { TurnaroundPipeline } from "@/components/TurnaroundPipeline";
import {
  getInventoryStats,
  inventory,
  isThinMargin,
  type InventoryItem,
  type InventoryStatus,
} from "@/data/inventory";

type SortKey =
  | "id"
  | "name"
  | "grade"
  | "cycles"
  | "status"
  | "price"
  | "cost"
  | "margin";
type SortDir = "asc" | "desc";

const gradeRank: Record<string, number> = {
  "A+": 1,
  A: 2,
  "A-": 3,
  "B+": 4,
  B: 5,
  "B-": 6,
  "C+": 7,
  C: 8,
  "C-": 9,
};

const statusRank: Record<InventoryStatus, number> = {
  "In Rotation": 1,
  Cleaning: 2,
  Ready: 3,
  Returned: 4,
  Retired: 5,
};

function formatAverageMargin(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(1)}`;
}

function compareItems(a: InventoryItem, b: InventoryItem, key: SortKey, dir: SortDir) {
  const factor = dir === "asc" ? 1 : -1;
  let result = 0;

  switch (key) {
    case "id":
      result = a.id.localeCompare(b.id);
      break;
    case "name":
      result = a.name.localeCompare(b.name);
      break;
    case "grade":
      result = (gradeRank[a.grade] ?? 99) - (gradeRank[b.grade] ?? 99);
      break;
    case "cycles":
      result = a.cycles - b.cycles;
      break;
    case "status":
      result = statusRank[a.status] - statusRank[b.status];
      break;
    case "price":
      result = a.price - b.price;
      break;
    case "cost":
      result = a.costPerCycle - b.costPerCycle;
      break;
    case "margin":
      result = a.margin - b.margin;
      break;
  }

  return result * factor;
}

function SortHeader({
  label,
  column,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  column: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === column;
  return (
    <th className="pb-3 pr-4">
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55 transition-opacity hover:opacity-70"
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        <span className="font-mono text-[9px] text-brass" aria-hidden="true">
          {active ? (dir === "asc" ? "▲" : "▼") : "◇"}
        </span>
      </button>
    </th>
  );
}

function statusTone(status: InventoryStatus) {
  switch (status) {
    case "In Rotation":
      return "text-bottle";
    case "Cleaning":
      return "text-brass";
    case "Ready":
      return "text-ink/70";
    case "Returned":
      return "text-ink/55";
    case "Retired":
      return "text-ink/45";
  }
}

export function InventoryDashboard() {
  const stats = getInventoryStats();
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(
    () => [...inventory].sort((a, b) => compareItems(a, b, sortKey, sortDir)),
    [sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  const summary = [
    { label: "Total Items", value: String(stats.total) },
    { label: "In Rotation", value: String(stats.inRotation) },
    { label: "In Cleaning", value: String(stats.cleaning) },
    { label: "Retired", value: String(stats.retired) },
    {
      label: "Average Margin per Item",
      value: formatAverageMargin(stats.averageMargin),
    },
  ];

  return (
    <section className="bg-paper px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-12">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-parchment pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
            Operator view
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.01em] text-ink">
            Inventory Dashboard
          </h1>
          <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
            Read-only snapshot of the current capsule — condition, cycles, cost,
            and margin across the archive.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-px bg-parchment md:grid-cols-5">
          {summary.map((stat) => (
            <div key={stat.label} className="bg-paper px-4 py-5 md:px-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl text-ink md:text-4xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[64rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-parchment">
                <SortHeader label="Item ID" column="id" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Name" column="name" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Grade" column="grade" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Cycles" column="cycles" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Status" column="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Price/cycle" column="price" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Cost/Cycle" column="cost" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Margin" column="margin" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-parchment/70">
                  <td className="py-3.5 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    {item.id}
                  </td>
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/item/${item.id}`}
                      className="font-sans text-sm text-ink transition-opacity hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4">
                    <ConditionGradeTag grade={item.grade} />
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink">
                    {item.cycles}
                  </td>
                  <td className={`py-3.5 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] ${statusTone(item.status)}`}>
                    {item.status}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink">
                    ${item.price}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink/70">
                    ${item.costPerCycle}
                  </td>
                  <td
                    className={`py-3.5 font-mono text-[12px] tabular-nums ${
                      isThinMargin(item.margin) ? "text-oxblood" : "text-bottle"
                    }`}
                  >
                    ${item.margin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DecisionQueue />
        <TurnaroundPipeline />
      </div>
    </section>
  );
}
