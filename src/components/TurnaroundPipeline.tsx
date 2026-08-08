"use client";

import { useState } from "react";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { DiscountModal } from "@/components/DiscountModal";
import { ImageManagementModal } from "@/components/ImageManagementModal";
import {
  QUEUE_DECISIONS,
  useDecisions,
  type QueueDecision,
} from "@/context/DecisionContext";
import { useInventory } from "@/context/InventoryContext";
import {
  getPipelineBoard,
  highRiskReason,
  isDiscounted,
  isHighRiskReturn,
  PIPELINE_STAGES,
  statusToPipelineStage,
  type InventoryItem,
  type PipelineStage,
} from "@/data/inventory";

export function TurnaroundPipeline() {
  const { items, setPipelineStage, applyReturnDecision, removeDiscount } =
    useInventory();
  const { getDecision, setDecision, clearDecision } = useDecisions();
  const board = getPipelineBoard(items);
  const [discountTarget, setDiscountTarget] = useState<InventoryItem | null>(
    null,
  );
  const [imagesItemId, setImagesItemId] = useState<string | null>(null);
  const imagesItem = imagesItemId
    ? (items.find((item) => item.id === imagesItemId) ?? null)
    : null;

  function handleMove(id: string, stage: PipelineStage) {
    if (stage === "Needs Attention") {
      clearDecision(id);
    }
    setPipelineStage(id, stage);
  }

  function handleDecision(item: InventoryItem, decision: QueueDecision) {
    if (decision === "Discount") {
      setDiscountTarget(item);
      return;
    }
    setDecision(item.id, decision);
    applyReturnDecision(item.id, decision);
  }

  function handleDiscountConfirm(percent: number) {
    if (!discountTarget) return;
    setDecision(discountTarget.id, "Discount");
    applyReturnDecision(discountTarget.id, "Discount", {
      discountPercent: percent,
    });
    setDiscountTarget(null);
  }

  function handleRemoveDiscount(id: string) {
    removeDiscount(id);
    clearDecision(id);
  }

  return (
    <section className="mt-14 border border-parchment md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Operations
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Turnaround Pipeline
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Every return lands in Needs Attention for a manual decision, then
          cleaning → ready → ship. Shipping adds one cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {PIPELINE_STAGES.map((stage, index) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            items={board[stage]}
            showDivider={index < PIPELINE_STAGES.length - 1}
            getDecision={getDecision}
            onMove={handleMove}
            onDecision={handleDecision}
            onRemoveDiscount={handleRemoveDiscount}
            onOpenImages={setImagesItemId}
          />
        ))}
      </div>

      {discountTarget ? (
        <DiscountModal
          itemName={discountTarget.name}
          currentPrice={discountTarget.originalPrice ?? discountTarget.price}
          onClose={() => setDiscountTarget(null)}
          onConfirm={handleDiscountConfirm}
        />
      ) : null}

      {imagesItem ? (
        <ImageManagementModal
          item={imagesItem}
          onClose={() => setImagesItemId(null)}
        />
      ) : null}
    </section>
  );
}

function PipelineColumn({
  stage,
  items,
  showDivider,
  getDecision,
  onMove,
  onDecision,
  onRemoveDiscount,
  onOpenImages,
}: {
  stage: PipelineStage;
  items: InventoryItem[];
  showDivider: boolean;
  getDecision: (id: string) => QueueDecision | undefined;
  onMove: (id: string, stage: PipelineStage) => void;
  onDecision: (item: InventoryItem, decision: QueueDecision) => void;
  onRemoveDiscount: (id: string) => void;
  onOpenImages: (id: string) => void;
}) {
  const isReviewColumn = stage === "Needs Attention";

  return (
    <div
      className={`px-4 py-5 md:px-5 ${
        showDivider ? "border-b border-parchment lg:border-b-0 lg:border-r" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-parchment pb-3">
        <h3
          className={`font-mono text-[10px] font-medium uppercase tracking-[0.18em] ${
            isReviewColumn ? "text-oxblood" : "text-ink/55"
          }`}
        >
          {stage}
        </h3>
        <span className="font-mono text-[10px] tabular-nums text-ink/40">
          ({items.length})
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="font-sans text-xs text-ink/40">Empty</li>
        ) : (
          items.map((item) => {
            const current = statusToPipelineStage(item.status);
            const highRisk = isHighRiskReturn(item);
            const selected = getDecision(item.id);
            const discounted = isDiscounted(item);

            return (
              <li
                key={item.id}
                className={`bg-paper p-3 ${
                  isReviewColumn && highRisk
                    ? "border border-oxblood/50"
                    : "border border-parchment/80"
                }`}
              >
                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                    isReviewColumn && highRisk ? "text-oxblood" : "text-ink/45"
                  }`}
                >
                  {item.id}
                  {isReviewColumn && highRisk
                    ? ` · ${highRiskReason(item)}`
                    : isReviewColumn
                      ? " · Routine return"
                      : ""}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenImages(item.id)}
                  className="mt-1 block text-left font-sans text-sm leading-snug text-ink transition-opacity hover:opacity-70"
                >
                  {item.name}
                </button>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ConditionGradeTag grade={item.grade} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50">
                    {item.cycles} cycles
                  </span>
                </div>

                {discounted ? (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bottle">
                    {item.discountPercent}% off · ${item.originalPrice} → $
                    {item.price}
                  </p>
                ) : null}

                {stage === "Shipped" && item.shippedTo ? (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
                    Shipped to {item.shippedTo}
                  </p>
                ) : null}

                {discounted ? (
                  <button
                    type="button"
                    onClick={() => onRemoveDiscount(item.id)}
                    className="mt-3 w-full border border-ink/25 px-2 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-ink/70 transition-opacity hover:border-ink hover:text-ink"
                  >
                    Remove Discount
                  </button>
                ) : null}

                {isReviewColumn && !discounted ? (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {QUEUE_DECISIONS.map((label) => {
                      const isSelected = selected === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => onDecision(item, label)}
                          className={`px-2 py-1.5 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-opacity ${
                            isSelected
                              ? "bg-ink text-paper"
                              : "border border-ink/20 bg-transparent text-ink/55 hover:border-ink hover:text-ink"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!isReviewColumn && !discounted ? (
                  <label className="mt-3 block">
                    <span className="sr-only">Move {item.id} to stage</span>
                    <select
                      value={current ?? stage}
                      onChange={(e) =>
                        onMove(item.id, e.target.value as PipelineStage)
                      }
                      className="w-full border border-ink/15 bg-paper px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 outline-none focus:border-ink"
                    >
                      {PIPELINE_STAGES.map((option) => (
                        <option key={option} value={option}>
                          Move to {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {!isReviewColumn && discounted ? (
                  <label className="mt-2 block">
                    <span className="sr-only">Move {item.id} to stage</span>
                    <select
                      value={current ?? stage}
                      onChange={(e) =>
                        onMove(item.id, e.target.value as PipelineStage)
                      }
                      className="w-full border border-ink/15 bg-paper px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 outline-none focus:border-ink"
                    >
                      {PIPELINE_STAGES.map((option) => (
                        <option key={option} value={option}>
                          Move to {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
