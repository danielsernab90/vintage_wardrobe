"use client";

import { useEffect, useState } from "react";
import {
  fetchSubscriptionTiers,
  updateSubscriptionTier,
  type SubscriptionTier,
} from "@/lib/tiers";

type Draft = {
  name: string;
  price: string;
  itemsPerMonth: string;
  positioning: string;
  features: string[];
};

function toDraft(tier: SubscriptionTier): Draft {
  return {
    name: tier.name,
    price: String(tier.price),
    itemsPerMonth: String(tier.itemsPerMonth),
    positioning: tier.positioning,
    features: tier.features.length > 0 ? [...tier.features] : [""],
  };
}

function TierEditor({
  tier,
  onSaved,
}: {
  tier: SubscriptionTier;
  onSaved: (next: SubscriptionTier) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(tier));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setDraft(toDraft(tier));
  }, [tier, editing]);

  function updateFeature(index: number, value: string) {
    setDraft((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature,
      ),
    }));
  }

  function addFeature() {
    setDraft((prev) => ({ ...prev, features: [...prev.features, ""] }));
  }

  function removeFeature(index: number) {
    setDraft((prev) => {
      const next = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: next.length > 0 ? next : [""] };
    });
  }

  function cancel() {
    setDraft(toDraft(tier));
    setError(null);
    setEditing(false);
  }

  async function handleSave() {
    const price = Number(draft.price);
    const itemsPerMonth = Number(draft.itemsPerMonth);
    if (!draft.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!Number.isInteger(itemsPerMonth) || itemsPerMonth < 1) {
      setError("Items per month must be a whole number ≥ 1.");
      return;
    }
    if (!draft.positioning.trim()) {
      setError("Positioning text is required.");
      return;
    }

    const features = draft.features.map((f) => f.trim()).filter(Boolean);
    if (features.length === 0) {
      setError("Add at least one feature.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const next = await updateSubscriptionTier(tier.id, {
        name: draft.name,
        price,
        itemsPerMonth,
        positioning: draft.positioning,
        features,
      });
      onSaved(next);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="border-b border-parchment/70 px-5 py-6 last:border-b-0 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
            {tier.id}
            {tier.isFeatured ? " · Featured" : ""}
          </p>
          <h3 className="mt-1 font-display text-xl font-medium text-ink">
            {tier.name}
          </h3>
          {!editing ? (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/65">
              ${tier.price}/mo · {tier.itemsPerMonth} pieces/month
            </p>
          ) : null}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraft(toDraft(tier));
              setError(null);
              setEditing(true);
            }}
            className="inline-flex items-center justify-center border border-parchment px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-70"
          >
            Edit
          </button>
        ) : null}
      </div>

      {!editing ? (
        <>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink/75">
            {tier.positioning}
          </p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {tier.features.map((feature) => (
              <li
                key={feature}
                className="font-sans text-sm leading-snug text-ink/80"
              >
                {feature}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-5 space-y-4" role="form" aria-label={`Edit ${tier.name}`}>
          <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Name
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              className="mt-2 w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink outline-none focus:border-brass"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Price ($/mo)
              <input
                type="number"
                min={0}
                step={1}
                value={draft.price}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, price: event.target.value }))
                }
                className="mt-2 w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink outline-none focus:border-brass"
              />
            </label>
            <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Items per month
              <input
                type="number"
                min={1}
                step={1}
                value={draft.itemsPerMonth}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    itemsPerMonth: event.target.value,
                  }))
                }
                className="mt-2 w-full border border-parchment bg-paper px-3 py-2 font-sans text-sm normal-case tracking-normal text-ink outline-none focus:border-brass"
              />
            </label>
          </div>

          <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Positioning
            <textarea
              value={draft.positioning}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  positioning: event.target.value,
                }))
              }
              rows={2}
              className="mt-2 w-full resize-y border border-parchment bg-paper px-3 py-2 font-sans text-sm font-normal normal-case leading-snug tracking-normal text-ink outline-none focus:border-brass"
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Features
              </p>
              <button
                type="button"
                onClick={addFeature}
                className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass transition-opacity hover:opacity-70"
              >
                + Add line
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {draft.features.map((feature, index) => (
                <li key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(event) =>
                      updateFeature(index, event.target.value)
                    }
                    placeholder="Feature line"
                    className="min-w-0 flex-1 border border-parchment bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brass"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    aria-label={`Remove feature ${index + 1}`}
                    className="shrink-0 border border-parchment px-3 py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-ink/55 transition-opacity hover:opacity-70"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <p
              className="font-sans text-sm normal-case tracking-normal text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="inline-flex flex-1 items-center justify-center bg-ink px-3 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50 sm:flex-none sm:min-w-[7rem]"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={cancel}
              className="inline-flex flex-1 items-center justify-center border border-parchment px-3 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-70 disabled:opacity-50 sm:flex-none sm:min-w-[7rem]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function SubscriptionTiersAdmin() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchSubscriptionTiers();
        if (!cancelled) setTiers(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tiers");
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

  return (
    <section className="mt-14 border border-parchment md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Pricing
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Subscription Tiers
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Live pricing from Supabase — edits show on the public Subscription
          page immediately.
        </p>
      </div>

      {loading ? (
        <p className="px-5 py-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 md:px-6">
          Loading tiers…
        </p>
      ) : error ? (
        <p className="px-5 py-8 font-sans text-sm text-red-800 md:px-6" role="alert">
          {error}
        </p>
      ) : (
        <div>
          {tiers.map((tier) => (
            <TierEditor
              key={tier.id}
              tier={tier}
              onSaved={(next) =>
                setTiers((prev) =>
                  prev.map((row) => (row.id === next.id ? next : row)),
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
