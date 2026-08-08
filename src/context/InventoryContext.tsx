"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ConditionGrade, Garment } from "@/data/garments";
import {
  createSpecimenImage,
  discountedPriceFromPercent,
  getPrimaryImageSrc,
  statusToPipelineStage,
  withSyncedPrimaryImage,
  type InventoryItem,
  type InventoryStatus,
  type PipelineStage,
  type QueueDecision,
} from "@/data/inventory";
import {
  fetchItems,
  insertItem,
  inventoryItemToWrite,
  updateItemRow,
} from "@/lib/items";

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
  loading: boolean;
  getById: (id: string) => InventoryItem | undefined;
  suggestNextId: () => string;
  addItem: (values: InventoryFormValues) => Promise<void>;
  updateItem: (
    id: string,
    values: Omit<InventoryFormValues, "id">,
  ) => Promise<void>;
  setPipelineStage: (id: string, stage: PipelineStage) => Promise<void>;
  applyReturnDecision: (
    id: string,
    decision: QueueDecision,
    options?: { discountPercent?: number },
  ) => Promise<void>;
  removeDiscount: (id: string) => Promise<void>;
  addItemImage: (id: string, src: string) => void;
  removeItemImage: (id: string, imageId: string) => void;
  setPrimaryImage: (id: string, imageId: string) => Promise<void>;
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

function syncPrimaryPhoto(
  item: InventoryItem,
  nextSrc: string,
): Pick<InventoryItem, "images" | "primaryImageId" | "image"> {
  const primaryIndex = item.images.findIndex(
    (img) => img.id === item.primaryImageId,
  );
  if (primaryIndex >= 0) {
    const images = item.images.map((img, index) =>
      index === primaryIndex ? { ...img, src: nextSrc } : img,
    );
    return {
      images,
      primaryImageId: item.primaryImageId,
      image: nextSrc,
    };
  }
  const created = createSpecimenImage(nextSrc, item.id, item.images.length);
  return {
    images: [...item.images, created],
    primaryImageId: created.id,
    image: nextSrc,
  };
}

function replaceItem(items: InventoryItem[], next: InventoryItem) {
  return items.map((item) => (item.id === next.id ? next : item));
}

async function persistItem(item: InventoryItem) {
  const write = inventoryItemToWrite(item);
  const { id: _id, ...patch } = write;
  void _id;
  await updateItemRow(item.id, patch);
}

function buildUpdatedItem(
  item: InventoryItem,
  values: Omit<InventoryFormValues, "id">,
): InventoryItem {
  const photo = syncPrimaryPhoto(item, values.image);

  if (item.originalPrice != null && item.discountPercent != null) {
    const base = values.price;
    const discounted = discountedPriceFromPercent(base, item.discountPercent);
    return {
      ...item,
      ...photo,
      name: values.name.trim(),
      era: values.era.trim(),
      fabric: values.fabric.trim(),
      category: values.category,
      size: values.size,
      grade: values.grade,
      costPerCycle: values.costPerCycle,
      originalPrice: base,
      price: discounted,
      margin: discounted - values.costPerCycle,
    };
  }

  return {
    ...item,
    ...photo,
    name: values.name.trim(),
    era: values.era.trim(),
    fabric: values.fabric.trim(),
    category: values.category,
    size: values.size,
    grade: values.grade,
    price: values.price,
    costPerCycle: values.costPerCycle,
    margin: values.price - values.costPerCycle,
  };
}

function buildDecisionItem(
  item: InventoryItem,
  decision: QueueDecision,
  options?: { discountPercent?: number },
): InventoryItem | null {
  if (decision === "Retire") {
    const restored = item.originalPrice ?? item.price;
    return {
      ...item,
      status: "Retired",
      price: restored,
      margin: restored - item.costPerCycle,
      originalPrice: undefined,
      discountPercent: undefined,
      decision,
      shippedTo: undefined,
    };
  }

  let next: InventoryItem = {
    ...item,
    status: "Cleaning",
    shippedTo: undefined,
    decision,
  };

  if (decision === "Discount") {
    const percent = options?.discountPercent;
    if (percent == null || percent <= 0 || percent >= 100) return null;
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
    const note = "Repair noted during return review, sent to cleaning";
    const alreadyLogged = next.incidents.some((entry) => entry.note === note);
    if (!alreadyLogged) {
      next = {
        ...next,
        incidents: [{ date: todayIncidentDate(), note }, ...next.incidents],
      };
    }
  }

  return next;
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadItems = useCallback(async () => {
    const next = await fetchItems();
    setItems(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchItems();
        if (!cancelled) setItems(next);
      } catch (error) {
        console.error("Failed to load inventory items", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  const suggestNextId = useCallback(
    () => suggestNextSpecimenId(items),
    [items],
  );

  const addItem = useCallback(
    async (values: InventoryFormValues) => {
      const id = values.id.trim().toUpperCase();
      if (items.some((item) => item.id === id)) return;

      const garment = toGarmentFields({ ...values, id });
      const primary = createSpecimenImage(values.image, id, 0);
      const created: InventoryItem = {
        ...garment,
        cycles: 0,
        status: "Ready",
        costPerCycle: values.costPerCycle,
        margin: values.price - values.costPerCycle,
        incidents: [],
        images: [primary],
        primaryImageId: primary.id,
        image: primary.src,
      };

      setItems((prev) => [...prev, created]);

      try {
        await insertItem(created);
      } catch (error) {
        console.error("Failed to insert item", error);
        setItems((prev) => prev.filter((item) => item.id !== id));
        throw error;
      }
    },
    [items],
  );

  const updateItem = useCallback(
    async (id: string, values: Omit<InventoryFormValues, "id">) => {
      const current = items.find((item) => item.id === id);
      if (!current) return;

      const nextItem = buildUpdatedItem(current, values);
      setItems((prev) => replaceItem(prev, nextItem));

      try {
        await persistItem(nextItem);
      } catch (error) {
        console.error("Failed to update item", error);
        await reloadItems();
        throw error;
      }
    },
    [items, reloadItems],
  );

  const setPipelineStage = useCallback(
    async (id: string, stage: PipelineStage) => {
      const current = items.find((item) => item.id === id);
      if (!current) return;

      const previousStage = statusToPipelineStage(current.status);
      const nextStatus = pipelineStageToStatus(stage);
      const enteringShipped =
        stage === "Shipped" && previousStage !== "Shipped";
      const nextItem: InventoryItem = {
        ...current,
        status: nextStatus,
        cycles: enteringShipped ? current.cycles + 1 : current.cycles,
        shippedTo: stage === "Shipped" ? current.shippedTo : undefined,
        decision: stage === "Needs Attention" ? undefined : current.decision,
      };

      setItems((prev) => replaceItem(prev, nextItem));

      try {
        await persistItem(nextItem);
      } catch (error) {
        console.error("Failed to update pipeline stage", error);
        await reloadItems();
        throw error;
      }
    },
    [items, reloadItems],
  );

  const applyReturnDecision = useCallback(
    async (
      id: string,
      decision: QueueDecision,
      options?: { discountPercent?: number },
    ) => {
      const current = items.find((item) => item.id === id);
      if (!current) return;

      const nextItem = buildDecisionItem(current, decision, options);
      if (!nextItem) return;

      setItems((prev) => replaceItem(prev, nextItem));

      try {
        await persistItem(nextItem);
      } catch (error) {
        console.error("Failed to apply return decision", error);
        await reloadItems();
        throw error;
      }
    },
    [items, reloadItems],
  );

  const removeDiscount = useCallback(
    async (id: string) => {
      const current = items.find((item) => item.id === id);
      if (!current || current.originalPrice == null) return;

      const restored = current.originalPrice;
      const nextItem: InventoryItem = {
        ...current,
        price: restored,
        margin: restored - current.costPerCycle,
        originalPrice: undefined,
        discountPercent: undefined,
        decision: undefined,
        status: "In Rotation",
        shippedTo: current.shippedTo,
      };

      setItems((prev) => replaceItem(prev, nextItem));

      try {
        await persistItem(nextItem);
      } catch (error) {
        console.error("Failed to remove discount", error);
        await reloadItems();
        throw error;
      }
    },
    [items, reloadItems],
  );

  const addItemImage = useCallback((id: string, src: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const created = createSpecimenImage(src, id, item.images.length);
        return { ...item, images: [...item.images, created] };
      }),
    );
  }, []);

  const removeItemImage = useCallback((id: string, imageId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.images.length <= 1) return item;
        if (imageId === item.primaryImageId) return item;

        const images = item.images.filter((img) => img.id !== imageId);
        return withSyncedPrimaryImage({ ...item, images });
      }),
    );
  }, []);

  const setPrimaryImage = useCallback(
    async (id: string, imageId: string) => {
      const current = items.find((item) => item.id === id);
      if (!current || !current.images.some((img) => img.id === imageId)) {
        return;
      }

      const nextItem = withSyncedPrimaryImage({
        ...current,
        primaryImageId: imageId,
      });
      setItems((prev) => replaceItem(prev, nextItem));

      try {
        await updateItemRow(id, {
          primary_photo_url: nextItem.image,
        });
      } catch (error) {
        console.error("Failed to set primary image", error);
        await reloadItems();
        throw error;
      }
    },
    [items, reloadItems],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
      removeDiscount,
      addItemImage,
      removeItemImage,
      setPrimaryImage,
    }),
    [
      items,
      loading,
      getById,
      suggestNextId,
      addItem,
      updateItem,
      setPipelineStage,
      applyReturnDecision,
      removeDiscount,
      addItemImage,
      removeItemImage,
      setPrimaryImage,
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

/** Re-export for callers that need primary src helpers. */
export { getPrimaryImageSrc };
