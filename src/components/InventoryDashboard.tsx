"use client";

import { useMemo, useState } from "react";
import { ActivityLog } from "@/components/ActivityLog";
import { AdminMessages } from "@/components/AdminMessages";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { CyclePrice } from "@/components/CyclePrice";
import { ImageManagementModal } from "@/components/ImageManagementModal";
import { IncidentLogModal } from "@/components/IncidentLogModal";
import { InventoryItemModal } from "@/components/InventoryItemModal";
import { RevenueSnapshot } from "@/components/RevenueSnapshot";
import { ScrollHint } from "@/components/ScrollHint";
import { SourcingAlerts } from "@/components/SourcingAlerts";
import { SubscriberRoster } from "@/components/SubscriberRoster";
import { TurnaroundPipeline } from "@/components/TurnaroundPipeline";
import { useDecisions } from "@/context/DecisionContext";
import {
  useInventory,
  type InventoryFormValues,
} from "@/context/InventoryContext";
import {
  getInventoryStats,
  isThinMargin,
  resolveDisplayStatus,
  type DisplayStatus,
  type InventoryItem,
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

type InventoryRow = InventoryItem & { displayStatus: DisplayStatus };

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

const statusRank: Record<DisplayStatus, number> = {
  "Needs Attention": 0,
  "In Rotation": 1,
  "Discounted — In Rotation": 2,
  Cleaning: 3,
  Ready: 4,
  "In Repair": 5,
  Retired: 6,
};

function formatAverageMargin(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(1)}`;
}

function compareItems(a: InventoryRow, b: InventoryRow, key: SortKey, dir: SortDir) {
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
      result = statusRank[a.displayStatus] - statusRank[b.displayStatus];
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

function statusTone(status: DisplayStatus) {
  switch (status) {
    case "Needs Attention":
      return "text-oxblood";
    case "In Rotation":
    case "Discounted — In Rotation":
      return "text-bottle";
    case "Cleaning":
      return "text-brass";
    case "Ready":
      return "text-ink/70";
    case "In Repair":
      return "text-brass";
    case "Retired":
      return "text-ink/45";
  }
}

export function InventoryDashboard() {
  const { items, getById, suggestNextId, addItem, updateItem } = useInventory();
  const stats = getInventoryStats(items);
  const { getDecision } = useDecisions();
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [logItemId, setLogItemId] = useState<string | null>(null);
  const [imagesItemId, setImagesItemId] = useState<string | null>(null);
  const [editor, setEditor] = useState<
    null | { mode: "add" } | { mode: "edit"; id: string }
  >(null);

  const rows = useMemo(() => {
    const withStatus: InventoryRow[] = items.map((item) => ({
      ...item,
      displayStatus: resolveDisplayStatus(item, getDecision(item.id)),
    }));
    return withStatus.sort((a, b) => compareItems(a, b, sortKey, sortDir));
  }, [items, getDecision, sortKey, sortDir]);

  const logItem = rows.find((item) => item.id === logItemId) ?? null;
  const imagesItem = rows.find((item) => item.id === imagesItemId) ?? null;
  const editItem =
    editor?.mode === "edit" ? getById(editor.id) : undefined;

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function handleFormSubmit(values: InventoryFormValues) {
    if (editor?.mode === "add") {
      addItem(values);
    } else if (editor?.mode === "edit") {
      const { id: _, ...rest } = values;
      void _;
      updateItem(editor.id, rest);
    }
    setEditor(null);
  }

  function LogButton({ item }: { item: InventoryItem }) {
    const flagged = item.incidents.some((entry) => entry.flagged);
    return (
      <button
        type="button"
        onClick={() => setLogItemId(item.id)}
        className={`font-mono text-[10px] uppercase tracking-[0.16em] transition-opacity hover:opacity-70 ${
          flagged ? "text-oxblood" : "text-ink/50"
        }`}
      >
        {item.incidents.length > 0
          ? `Log (${item.incidents.length})`
          : "Log"}
      </button>
    );
  }

  function EditButton({ item }: { item: InventoryItem }) {
    return (
      <button
        type="button"
        onClick={() => setEditor({ mode: "edit", id: item.id })}
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
      >
        Edit
      </button>
    );
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
            Capsule inventory with session add/edit — condition, cycles, cost,
            and margin. Changes clear on refresh until a backend is connected.
          </p>
        </header>

        <RevenueSnapshot />

        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
              Inventory
            </p>
            <button
              type="button"
              onClick={() => setEditor({ mode: "add" })}
              className="bg-ink px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
            >
              + Add Item
            </button>
          </div>
          <div className="grid grid-cols-2 gap-px bg-parchment md:grid-cols-5">
            {summary.map((stat) => (
              <div key={stat.label} className="bg-paper px-4 py-5 md:px-5">
                <p className="font-display text-3xl text-ink md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked inventory cards */}
        <ul className="mt-8 space-y-3 md:hidden">
          {rows.map((item) => (
            <li key={item.id} className="border border-parchment px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
                    {item.id}
                  </p>
                  <button
                    type="button"
                    onClick={() => setImagesItemId(item.id)}
                    className="mt-1 block text-left font-display text-lg text-ink transition-opacity hover:opacity-70"
                  >
                    {item.name}
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <EditButton item={item} />
                  <LogButton item={item} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ConditionGradeTag grade={item.grade} />
                <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${statusTone(item.displayStatus)}`}>
                  {item.displayStatus}
                </span>
                <span className="font-mono text-[11px] text-ink/60">
                  {item.cycles} cycles
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-parchment pt-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
                    Price
                  </p>
                  <div className="mt-1">
                    <CyclePrice
                      price={item.price}
                      originalPrice={item.originalPrice}
                      size="sm"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
                    Cost
                  </p>
                  <p className="mt-1 font-mono text-sm text-ink/70">${item.costPerCycle}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
                    Margin
                  </p>
                  <p
                    className={`mt-1 font-mono text-sm ${
                      isThinMargin(item.margin) ? "text-oxblood" : "text-bottle"
                    }`}
                  >
                    ${item.margin}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Tablet/desktop: scrollable table with hint */}
        <ScrollHint className="mt-10 hidden md:block">
          <table className="w-full min-w-[76rem] border-collapse text-left">
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
                <th className="pb-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">
                  Incidents
                </th>
                <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-parchment/70">
                  <td className="py-3.5 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                    {item.id}
                  </td>
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      onClick={() => setImagesItemId(item.id)}
                      className="text-left font-sans text-sm text-ink transition-opacity hover:opacity-70"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="py-3.5 pr-4">
                    <ConditionGradeTag grade={item.grade} />
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink">
                    {item.cycles}
                  </td>
                  <td className={`py-3.5 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] ${statusTone(item.displayStatus)}`}>
                    {item.displayStatus}
                  </td>
                  <td className="py-3.5 pr-4">
                    <CyclePrice
                      price={item.price}
                      originalPrice={item.originalPrice}
                      size="sm"
                    />
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink/70">
                    ${item.costPerCycle}
                  </td>
                  <td
                    className={`py-3.5 pr-4 font-mono text-[12px] tabular-nums ${
                      isThinMargin(item.margin) ? "text-oxblood" : "text-bottle"
                    }`}
                  >
                    ${item.margin}
                  </td>
                  <td className="py-3.5 pr-4">
                    <LogButton item={item} />
                  </td>
                  <td className="py-3.5">
                    <EditButton item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollHint>

        {logItem ? (
          <IncidentLogModal item={logItem} onClose={() => setLogItemId(null)} />
        ) : null}

        {imagesItem ? (
          <ImageManagementModal
            item={imagesItem}
            onClose={() => setImagesItemId(null)}
          />
        ) : null}

        {editor?.mode === "add" ? (
          <InventoryItemModal
            mode="add"
            suggestedId={suggestNextId()}
            isIdTaken={(id) => Boolean(getById(id))}
            onClose={() => setEditor(null)}
            onSubmit={handleFormSubmit}
          />
        ) : null}

        {editor?.mode === "edit" && editItem ? (
          <InventoryItemModal
            mode="edit"
            item={editItem}
            onClose={() => setEditor(null)}
            onSubmit={handleFormSubmit}
          />
        ) : null}

        <TurnaroundPipeline />
        <AdminMessages />
        <SubscriberRoster />
        <SourcingAlerts />
        <ActivityLog />
      </div>
    </section>
  );
}
