"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollHint } from "@/components/ScrollHint";
import { useMessagesUi } from "@/context/MessagesUiContext";
import {
  type Subscriber,
  type SubscriberStatus,
  type SubscriberTier,
} from "@/data/subscribers";
import { fetchSubscribers, updateSubscriber } from "@/lib/subscribers";

type SortKey = "name" | "tier" | "joinDate" | "itemsOut" | "status";
type SortDir = "asc" | "desc";

const TIERS: SubscriberTier[] = ["Starter", "Signature", "Archivist"];
const STATUSES: SubscriberStatus[] = ["Active", "Paused"];

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

function SubscriberNameMenu({
  subscriber,
  onUpdated,
}: {
  subscriber: Subscriber;
  onUpdated: (next: Subscriber) => void;
}) {
  const { openThreadForSubscriber } = useMessagesUi();
  const [open, setOpen] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tier, setTier] = useState<SubscriberTier>(subscriber.tier);
  const [status, setStatus] = useState<SubscriberStatus>(subscriber.status);
  const [address, setAddress] = useState(subscriber.address);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTier(subscriber.tier);
    setStatus(subscriber.status);
    setAddress(subscriber.address);
  }, [subscriber]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShowAddress(false);
        setEditing(false);
        setFormError(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setShowAddress(false);
        setEditing(false);
        setFormError(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setShowAddress(false);
    setEditing(false);
    setFormError(null);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      const next = await updateSubscriber(subscriber.id, {
        tier,
        status,
        address,
      });
      onUpdated(next);
      closeMenu();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (!next) {
              setShowAddress(false);
              setEditing(false);
              setFormError(null);
            }
            return next;
          });
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="font-display text-base text-ink underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
      >
        {subscriber.name}
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute left-0 top-full z-40 mt-1 border border-brass bg-paper shadow-[0_6px_18px_rgba(28,26,23,0.1)] ${
            editing ? "w-[18rem] max-w-[calc(100vw-2rem)]" : "min-w-[11rem] max-w-[16rem]"
          }`}
        >
          {!editing ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
                onClick={() => {
                  closeMenu();
                  openThreadForSubscriber(subscriber.id);
                }}
              >
                Message
              </button>
              <div className="h-px bg-parchment" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
                onClick={() => {
                  setShowAddress((prev) => !prev);
                  setEditing(false);
                }}
                aria-expanded={showAddress}
              >
                Address
              </button>
              {showAddress ? (
                <p className="border-t border-parchment px-4 py-3 font-sans text-sm font-normal normal-case leading-snug tracking-normal text-ink/80">
                  {subscriber.address || "No address on file."}
                </p>
              ) : null}
              <div className="h-px bg-parchment" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
                onClick={() => {
                  setEditing(true);
                  setShowAddress(false);
                  setTier(subscriber.tier);
                  setStatus(subscriber.status);
                  setAddress(subscriber.address);
                  setFormError(null);
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <div className="px-4 py-4" role="form" aria-label={`Edit ${subscriber.name}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
                Edit subscriber
              </p>
              <p className="mt-2 font-display text-base text-ink">{subscriber.name}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
                Joined {formatJoinDate(subscriber.joinDate)}
              </p>

              <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Tier
                <select
                  value={tier}
                  onChange={(event) =>
                    setTier(event.target.value as SubscriberTier)
                  }
                  className="mt-2 w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink outline-none focus:border-brass"
                >
                  {TIERS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-3 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as SubscriberStatus)
                  }
                  className="mt-2 w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink outline-none focus:border-brass"
                >
                  {STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-3 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Address
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-y border border-parchment bg-paper px-3 py-2 font-sans text-sm font-normal normal-case leading-snug tracking-normal text-ink outline-none focus:border-brass"
                />
              </label>

              {formError ? (
                <p className="mt-3 font-sans text-sm normal-case tracking-normal text-red-800" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSave()}
                  className="inline-flex flex-1 items-center justify-center bg-ink px-3 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setFormError(null);
                    setTier(subscriber.tier);
                    setStatus(subscriber.status);
                    setAddress(subscriber.address);
                  }}
                  className="inline-flex flex-1 items-center justify-center border border-parchment px-3 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-70 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SubscriberRoster() {
  const [sortKey, setSortKey] = useState<SortKey>("joinDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [roster, setRoster] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSubscribers();
      setRoster(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roster");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  const handleUpdated = useCallback((next: Subscriber) => {
    setRoster((prev) =>
      prev.map((row) => (row.id === next.id ? next : row)),
    );
  }, []);

  const rows = useMemo(
    () => [...roster].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [roster, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
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
          Live subscriber base from Supabase — click a name to message, view
          address, or edit tier and status.
        </p>
      </div>

      {loading ? (
        <p className="px-5 py-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 md:px-6">
          Loading roster…
        </p>
      ) : error ? (
        <div className="px-5 py-8 md:px-6">
          <p className="font-sans text-sm text-red-800" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadRoster()}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-0 divide-y divide-parchment px-5 py-2 md:hidden">
            {rows.map((sub) => (
              <li key={sub.id} className="py-4">
                <SubscriberNameMenu
                  subscriber={sub}
                  onUpdated={handleUpdated}
                />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
                  {sub.tier} · Joined {formatJoinDate(sub.joinDate)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink/65">
                    {sub.itemsOut} items out
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                      sub.status === "Active" ? "text-bottle" : "text-ink/45"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop table */}
          <ScrollHint className="hidden px-5 py-4 md:block md:px-6">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-parchment">
                  <SortHeader
                    label="Name"
                    column="name"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Tier"
                    column="tier"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Join Date"
                    column="joinDate"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Items Out"
                    column="itemsOut"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label="Status"
                    column="status"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {rows.map((sub) => (
                  <tr key={sub.id} className="border-b border-parchment/70">
                    <td className="py-3.5 pr-4">
                      <SubscriberNameMenu
                        subscriber={sub}
                        onUpdated={handleUpdated}
                      />
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
          </ScrollHint>
        </>
      )}
    </section>
  );
}
