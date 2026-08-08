"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ConditionGrade } from "@/data/garments";
import {
  CATEGORY_OPTIONS,
  GRADE_OPTIONS,
  SIZE_OPTIONS,
  type InventoryFormValues,
} from "@/context/InventoryContext";
import {
  discountedPriceFromPercent,
  getPrimaryImageSrc,
  isDiscounted,
  type InventoryItem,
} from "@/data/inventory";
import { compressImageFile } from "@/lib/compressImage";
import { uploadGarmentPhoto } from "@/lib/garmentPhotos";

type Props = {
  mode: "add" | "edit";
  item?: InventoryItem;
  suggestedId?: string;
  isIdTaken?: (id: string) => boolean;
  onClose: () => void;
  onSubmit: (values: InventoryFormValues) => void;
};

type FormState = {
  id: string;
  name: string;
  era: string;
  fabric: string;
  category: string;
  size: string;
  grade: ConditionGrade;
  price: string;
  costPerCycle: string;
  image: string;
};

function itemToForm(item: InventoryItem): FormState {
  // Edit the base (pre-discount) price when a discount is active
  const basePrice = item.originalPrice ?? item.price;
  return {
    id: item.id,
    name: item.name,
    era: item.era,
    fabric: item.fabric,
    category: item.category,
    size: item.size,
    grade: item.grade,
    price: String(basePrice),
    costPerCycle: String(item.costPerCycle),
    image: getPrimaryImageSrc(item),
  };
}

export function InventoryItemModal({
  mode,
  item,
  suggestedId = "",
  isIdTaken,
  onClose,
  onSubmit,
}: Props) {
  const titleId = useId();
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && item
      ? itemToForm(item)
      : {
          id: suggestedId,
          name: "",
          era: "",
          fabric: "",
          category: CATEGORY_OPTIONS[0],
          size: SIZE_OPTIONS[1],
          grade: "A",
          price: "",
          costPerCycle: "",
          image: "",
        },
  );
  const [error, setError] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Object URLs are kept for the session inventory — do not revoke on unmount
  // or catalog/detail images break after the modal closes.

  const priceNum = Number(form.price);
  const costNum = Number(form.costPerCycle);
  const activeDiscount =
    mode === "edit" && item && isDiscounted(item) ? item.discountPercent : undefined;
  const margin = useMemo(() => {
    if (!Number.isFinite(priceNum) || !Number.isFinite(costNum)) return null;
    if (activeDiscount != null) {
      const discounted = discountedPriceFromPercent(priceNum, activeDiscount);
      return discounted - costNum;
    }
    return priceNum - costNum;
  }, [priceNum, costNum, activeDiscount]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handlePhotoChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setCompressing(true);
    setBusyLabel("Compressing…");
    try {
      const result = await compressImageFile(file);
      setBusyLabel("Uploading…");
      const itemId =
        (mode === "edit" && item?.id) ||
        form.id.trim().toUpperCase() ||
        "UPLOAD";
      const uploaded = await uploadGarmentPhoto(itemId, result.file);
      URL.revokeObjectURL(result.objectUrl);
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
      updateField("image", uploaded.publicUrl);
    } catch {
      setError("Could not upload that image. Try another file.");
    } finally {
      setCompressing(false);
      setBusyLabel(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = form.id.trim().toUpperCase();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!id) {
      setError("Item ID is required.");
      return;
    }
    if (!/^SPEC-\d{3,}$/i.test(id) && mode === "add") {
      // Allow custom IDs but gently prefer SPEC format — still accept any non-empty
    }
    if (!form.era.trim() || !form.fabric.trim()) {
      setError("Era and fabric are required.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid price per cycle.");
      return;
    }
    if (!Number.isFinite(costNum) || costNum < 0) {
      setError("Enter a valid cost per cycle.");
      return;
    }
    if (!form.image) {
      setError("Add a photo for this specimen.");
      return;
    }
    if (mode === "add" && isIdTaken?.(id)) {
      setError("That Item ID is already in use.");
      return;
    }

    onSubmit({
      id,
      name: form.name,
      era: form.era,
      fabric: form.fabric,
      category: form.category,
      size: form.size,
      grade: form.grade,
      price: priceNum,
      costPerCycle: costNum,
      image: form.image,
    });
  }

  const fieldClass =
    "mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-ink";
  const labelClass =
    "font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55";

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
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-brass bg-paper px-5 py-5 shadow-[0_8px_28px_rgba(28,26,23,0.12)] sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              {mode === "add" ? "Intake" : "Update"}
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-2xl font-medium leading-snug text-ink"
            >
              {mode === "add" ? "Add Item" : "Edit Item"}
            </h2>
            <p className="mt-2 font-sans text-xs leading-relaxed text-ink/55">
              Saves to Supabase — edits persist across refresh.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-opacity hover:opacity-70"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-parchment pt-5">
          <div>
            <label htmlFor="inv-name" className={labelClass}>
              Name
            </label>
            <input
              id="inv-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label htmlFor="inv-id" className={labelClass}>
              Item ID
            </label>
            <input
              id="inv-id"
              type="text"
              value={form.id}
              onChange={(e) => updateField("id", e.target.value)}
              className={`${fieldClass} ${mode === "edit" ? "bg-parchment/40 text-ink/60" : ""}`}
              disabled={mode === "edit"}
              required
            />
            {mode === "edit" ? (
              <p className="mt-1.5 font-sans text-xs text-ink/45">
                IDs stay fixed after creation.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="inv-era" className={labelClass}>
                Era
              </label>
              <input
                id="inv-era"
                type="text"
                value={form.era}
                onChange={(e) => updateField("era", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="inv-fabric" className={labelClass}>
                Fabric
              </label>
              <input
                id="inv-fabric"
                type="text"
                value={form.fabric}
                onChange={(e) => updateField("fabric", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="inv-category" className={labelClass}>
                Category
              </label>
              <select
                id="inv-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={fieldClass}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inv-size" className={labelClass}>
                Size
              </label>
              <select
                id="inv-size"
                value={form.size}
                onChange={(e) => updateField("size", e.target.value)}
                className={fieldClass}
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inv-grade" className={labelClass}>
                Grade
              </label>
              <select
                id="inv-grade"
                value={form.grade}
                onChange={(e) =>
                  updateField("grade", e.target.value as ConditionGrade)
                }
                className={fieldClass}
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="inv-price" className={labelClass}>
                {activeDiscount != null
                  ? "Base price per cycle"
                  : "Price per cycle"}
              </label>
              <input
                id="inv-price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="inv-cost" className={labelClass}>
                Cost per cycle
              </label>
              <input
                id="inv-cost"
                type="number"
                min="0"
                step="1"
                value={form.costPerCycle}
                onChange={(e) => updateField("costPerCycle", e.target.value)}
                className={fieldClass}
                required
              />
            </div>
          </div>

          {activeDiscount != null ? (
            <div className="border border-brass/40 bg-parchment/40 px-3 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                Active discount · {activeDiscount}%
              </p>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-ink/65">
                You&apos;re editing the base price. The {activeDiscount}% discount
                stays applied — displayed price becomes $
                {Number.isFinite(priceNum)
                  ? discountedPriceFromPercent(priceNum, activeDiscount)
                  : "—"}
                , and Remove Discount will revert to this base.
              </p>
            </div>
          ) : null}

          <div className="border border-parchment bg-parchment/30 px-3 py-3">
            <p className={labelClass}>
              Margin (auto)
              {activeDiscount != null ? " · after discount" : ""}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">
              {margin === null ? "—" : `$${margin}`}
            </p>
          </div>

          {mode === "edit" && item ? (
            <div className="border border-parchment px-3 py-3">
              <p className={labelClass}>Cycles</p>
              <p className="mt-1 font-mono text-sm text-ink/70">
                {item.cycles} — increments when shipped, not editable here
              </p>
            </div>
          ) : null}

          <div>
            <label htmlFor="inv-photo" className={labelClass}>
              Photo
            </label>
            <input
              id="inv-photo"
              type="file"
              accept="image/*"
              disabled={compressing}
              onChange={(e) => void handlePhotoChange(e.target.files)}
              className="mt-1.5 block w-full font-sans text-sm text-ink/70 file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:font-sans file:text-[10px] file:font-medium file:uppercase file:tracking-[0.16em] file:text-paper disabled:opacity-50"
            />
            {busyLabel ? (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
                {busyLabel}
              </p>
            ) : null}
            {form.image ? (
              <div className="relative mt-3 h-28 w-24 overflow-hidden border border-parchment bg-parchment">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Specimen preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="font-sans text-sm text-oxblood">{error}</p>
          ) : null}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border border-ink/20 px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={compressing}
              className="bg-ink px-4 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {mode === "add" ? "Add to Inventory" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
