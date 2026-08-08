"use client";

import { useMemo, useState } from "react";
import {
  subscribers,
  type Subscriber,
  type SubscriberStatus,
  type SubscriberTier,
} from "@/data/subscribers";

type SortKey = "name" | "tier" | "joinDate" | "itemsOut" | "status";
type SortDir = "asc" | "desc";

const tierRank: Record<SubscriberTier, number> = {
  Starter: 1,
  Signature: 2,
  Archivist: 3,
};

const statusRank: Record<SubscriberStatus, number> = {
  Active: 1,
  Paused: 2,
};

function formatJoinDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function compare(
  a: Subscriber,
  b: Subscriber,
  key: SortKey,
  dir: SortDir,
) {
  const factor = dir === "asc" ? 1 : -1;
  let result = 0;

  switch (key) {
    case "name":
      result = a.name.localeCompare(b.name);
      break;
    case "tier":
      result = tierRank[a.tier] - tierRank[b.tier];
      break;
    case "joinDate":
      result = a.joinDate.localeCompare(b.joinDate);
      break;
    case "itemsOut":
      result = a.itemsOut - b.itemsOut;
      break;
    case "status":
      result = statusRank[a.status] - statusRank[b.status];
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

export function SubscriberRoster() {
  const [sortKey, setSortKey] = useState<SortKey>("joinDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(
    () => [...subscribers].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "joinDate" || key === "tier" ? "asc" : "asc");
  }

  return (
    <section className="mt-14 border border-parchment md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Membership
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Subscriber Roster
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Representative sample of the active base — identities used across
          operations views. Read-only for this pass.
        </p>
      </div>

      <div className="overflow-x-auto px-5 py-4 md:px-6">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-parchment">
              <SortHeader label="Name" column="name" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Tier" column="tier" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Join Date" column="joinDate" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Items Out" column="itemsOut" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="Status" column="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((sub) => (
              <tr key={sub.id} className="border-b border-parchment/70">
                <td className="py-3.5 pr-4 font-display text-base text-ink">
                  {sub.name}
                </td>
                <td className="py-3.5 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
                  {sub.tier}
                </td>
                <td className="py-3.5 pr-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/65">
                  {formatJoinDate(sub.joinDate)}
                </td>
                <td className="py-3.5 pr-4 font-mono text-[12px] tabular-nums text-ink">
                  {sub.itemsOut}
                </td>
                <td
                  className={`py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                    sub.status === "Active" ? "text-bottle" : "text-ink/45"
                  }`}
                >
                  {sub.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
