"use client";

import { useEffect, useState } from "react";
import {
  fetchSubscriberAddress,
  updateSubscriberAddress,
} from "@/lib/subscribers";
import { JAMES_WHITAKER_SUBSCRIBER_ID } from "@/lib/messages";

export function ShippingAddressSection() {
  const [address, setAddress] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const value = await fetchSubscriberAddress(JAMES_WHITAKER_SUBSCRIBER_ID);
        if (!cancelled) {
          setAddress(value);
          setDraft(value);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load address");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const next = await updateSubscriberAddress(
        JAMES_WHITAKER_SUBSCRIBER_ID,
        draft,
      );
      setAddress(next);
      setDraft(next);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-14 w-full border border-parchment md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Delivery
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
              Shipping Address
            </h2>
            <p className="mt-2 font-sans text-sm text-ink/65">
              Where your next rotation ships.
            </p>
          </div>
          {!editing && !loading ? (
            <button
              type="button"
              onClick={() => {
                setDraft(address);
                setEditing(true);
                setError(null);
              }}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5 md:px-6 md:py-6">
        {loading ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45">
            Loading address…
          </p>
        ) : editing ? (
          <div className="max-w-xl">
            <label
              htmlFor="shipping-address"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55"
            >
              Address
            </label>
            <textarea
              id="shipping-address"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="mt-3 w-full resize-y border border-parchment bg-paper px-4 py-3 font-sans text-sm leading-relaxed text-ink outline-none transition-[border-color] focus:border-brass"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className="inline-flex items-center justify-center bg-ink px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setDraft(address);
                  setEditing(false);
                  setError(null);
                }}
                className="inline-flex items-center justify-center border border-parchment px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="max-w-xl font-sans text-base leading-relaxed text-ink">
            {address || "No shipping address on file."}
          </p>
        )}

        {error ? (
          <p className="mt-4 font-sans text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
