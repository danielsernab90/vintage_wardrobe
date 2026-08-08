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
  applyReturnDecision: (id: string, decision: QueueDecision) => void;
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
    (id: string, decision: QueueDecision) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          if (decision === "Retire") {
            return {
              ...item,
              status: "Retired",
              shippedTo: undefined,
            };
          }

          let incidents = item.incidents;
          if (decision === "Repair") {
            const note =
              "Repair noted during return review, sent to cleaning";
            const alreadyLogged = incidents.some((entry) => entry.note === note);
            if (!alreadyLogged) {
              incidents = [
                { date: todayIncidentDate(), note },
                ...incidents,
              ];
            }
          }

          return {
            ...item,
            status: "Cleaning",
            shippedTo: undefined,
            incidents,
          };
        }),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      items,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
    }),
    [
      items,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
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
