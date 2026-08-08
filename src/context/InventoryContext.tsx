"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ConditionGrade, Garment } from "@/data/garments";
import {
  discountedPriceFromPercent,
  inventory as seedInventory,
  statusToPipelineStage,
  type InventoryItem,
  type InventoryStatus,
  type PipelineStage,
  type QueueDecision,
} from "@/data/inventory";

export type InventoryFormValues = {
  id: string;
  name: string;
  era: string;
  fabric: string;
  category: string;
  size: string;
  grade: ConditionGrade;
  price: number;
  costPerCycle: number;
  image: string;
};

type InventoryContextValue = {
  items: InventoryItem[];
  getById: (id: string) => InventoryItem | undefined;
  suggestNextId: () => string;
  addItem: (values: InventoryFormValues) => void;
  updateItem: (id: string, values: Omit<InventoryFormValues, "id">) => void;
  setPipelineStage: (id: string, stage: PipelineStage) => void;
  applyReturnDecision: (
    id: string,
    decision: QueueDecision,
    options?: { discountPercent?: number },
  ) => void;
  removeDiscount: (id: string) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export const CATEGORY_OPTIONS = [
  "Outerwear",
  "Knitwear",
  "Shirts",
  "Tailoring",
] as const;

export const SIZE_OPTIONS = ["S", "M", "L", "XL"] as const;

export const GRADE_OPTIONS = ["A", "B", "C"] as const;

function pipelineStageToStatus(stage: PipelineStage): InventoryStatus {
  switch (stage) {
    case "Needs Attention":
      return "Needs Attention";
    case "Cleaning":
      return "Cleaning";
    case "Ready":
      return "Ready";
    case "Shipped":
      return "In Rotation";
  }
}

function suggestNextSpecimenId(items: InventoryItem[]) {
  let max = 0;
  for (const item of items) {
    const match = item.id.match(/^SPEC-(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `SPEC-${String(max + 1).padStart(3, "0")}`;
}

function toGarmentFields(values: InventoryFormValues): Garment {
  return {
    id: values.id,
    name: values.name.trim(),
    era: values.era.trim(),
    fabric: values.fabric.trim(),
    category: values.category,
    size: values.size,
    grade: values.grade,
    price: values.price,
    image: values.image,
    cycles: 0,
    conditionNote: "Newly catalogued specimen",
  };
}

function todayIncidentDate() {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}`;
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(() =>
    seedInventory.map((item) => ({ ...item })),
  );

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  const suggestNextId = useCallback(
    () => suggestNextSpecimenId(items),
    [items],
  );

  const addItem = useCallback((values: InventoryFormValues) => {
    const id = values.id.trim().toUpperCase();
    setItems((prev) => {
      if (prev.some((item) => item.id === id)) return prev;
      const garment = toGarmentFields({ ...values, id });
      const next: InventoryItem = {
        ...garment,
        cycles: 0,
        status: "Ready",
        costPerCycle: values.costPerCycle,
        margin: values.price - values.costPerCycle,
        incidents: [],
      };
      return [...prev, next];
    });
  }, []);

  const updateItem = useCallback(
    (id: string, values: Omit<InventoryFormValues, "id">) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          // Form always submits base price. If a discount is active, keep the
          // percent, store the new base as originalPrice, and recompute display price.
          if (item.originalPrice != null && item.discountPercent != null) {
            const base = values.price;
            const discounted = discountedPriceFromPercent(
              base,
              item.discountPercent,
            );
            return {
              ...item,
              name: values.name.trim(),
              era: values.era.trim(),
              fabric: values.fabric.trim(),
              category: values.category,
              size: values.size,
              grade: values.grade,
              image: values.image,
              costPerCycle: values.costPerCycle,
              originalPrice: base,
              price: discounted,
              margin: discounted - values.costPerCycle,
            };
          }

          return {
            ...item,
            name: values.name.trim(),
            era: values.era.trim(),
            fabric: values.fabric.trim(),
            category: values.category,
            size: values.size,
            grade: values.grade,
            price: values.price,
            image: values.image,
            costPerCycle: values.costPerCycle,
            margin: values.price - values.costPerCycle,
          };
        }),
      );
    },
    [],
  );

  const setPipelineStage = useCallback((id: string, stage: PipelineStage) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const previousStage = statusToPipelineStage(item.status);
        const nextStatus = pipelineStageToStatus(stage);
        const enteringShipped =
          stage === "Shipped" && previousStage !== "Shipped";
        return {
          ...item,
          status: nextStatus,
          cycles: enteringShipped ? item.cycles + 1 : item.cycles,
          shippedTo: stage === "Shipped" ? item.shippedTo : undefined,
        };
      }),
    );
  }, []);

  const applyReturnDecision = useCallback(
    (
      id: string,
      decision: QueueDecision,
      options?: { discountPercent?: number },
    ) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          if (decision === "Retire") {
            const restored = item.originalPrice ?? item.price;
            return {
              ...item,
              status: "Retired",
              price: restored,
              margin: restored - item.costPerCycle,
              originalPrice: undefined,
              discountPercent: undefined,
              shippedTo: undefined,
            };
          }

          let next: InventoryItem = {
            ...item,
            status: "Cleaning",
            shippedTo: undefined,
          };

          if (decision === "Discount") {
            const percent = options?.discountPercent;
            if (percent == null || percent <= 0 || percent >= 100) {
              return item;
            }
            const base = item.originalPrice ?? item.price;
            const discounted = discountedPriceFromPercent(base, percent);
            next = {
              ...next,
              originalPrice: base,
              discountPercent: percent,
              price: discounted,
              margin: discounted - item.costPerCycle,
            };
          }

          if (decision === "Repair") {
            const note =
              "Repair noted during return review, sent to cleaning";
            const alreadyLogged = next.incidents.some(
              (entry) => entry.note === note,
            );
            if (!alreadyLogged) {
              next = {
                ...next,
                incidents: [
                  { date: todayIncidentDate(), note },
                  ...next.incidents,
                ],
              };
            }
          }

          return next;
        }),
      );
    },
    [],
  );

  const removeDiscount = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.originalPrice == null) return item;
        const restored = item.originalPrice;
        return {
          ...item,
          price: restored,
          margin: restored - item.costPerCycle,
          originalPrice: undefined,
          discountPercent: undefined,
          status: "In Rotation",
          shippedTo: item.shippedTo,
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
      removeDiscount,
    }),
    [
      items,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
      removeDiscount,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return ctx;
}
