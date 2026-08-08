import type { ConditionGrade } from "@/data/garments";
import {
  type InventoryItem,
  type InventoryStatus,
  type QueueDecision,
} from "@/data/inventory";
import { supabase } from "@/lib/supabase";

export type ItemDecisionDb =
  | "keep_as_is"
  | "repair"
  | "discount"
  | "retire";

export type ItemRow = {
  id: string;
  name: string;
  era: string;
  fabric: string;
  category: string;
  size: string;
  grade: string;
  cycles: number;
  status: string;
  price: number | string;
  cost: number | string;
  original_price: number | string | null;
  discount_active: boolean;
  decision: string | null;
  primary_photo_url: string;
  created_at?: string;
};

export type ItemWrite = {
  id: string;
  name: string;
  era: string;
  fabric: string;
  category: string;
  size: string;
  grade: string;
  cycles: number;
  status: string;
  price: number;
  cost: number;
  original_price: number | null;
  discount_active: boolean;
  decision: ItemDecisionDb | null;
  primary_photo_url: string;
};

const VALID_STATUSES: InventoryStatus[] = [
  "Needs Attention",
  "In Rotation",
  "Cleaning",
  "Ready",
  "Retired",
];

export function decisionToDb(decision: QueueDecision): ItemDecisionDb {
  switch (decision) {
    case "Keep As Is":
      return "keep_as_is";
    case "Repair":
      return "repair";
    case "Discount":
      return "discount";
    case "Retire":
      return "retire";
  }
}

export function decisionFromDb(
  decision: string | null | undefined,
): QueueDecision | undefined {
  switch (decision) {
    case "keep_as_is":
      return "Keep As Is";
    case "repair":
      return "Repair";
    case "discount":
      return "Discount";
    case "retire":
      return "Retire";
    default:
      return undefined;
  }
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseStatus(status: string): InventoryStatus {
  if (VALID_STATUSES.includes(status as InventoryStatus)) {
    return status as InventoryStatus;
  }
  return "Ready";
}

function deriveDiscountPercent(
  price: number,
  originalPrice: number | undefined,
  discountActive: boolean,
) {
  if (!discountActive || originalPrice == null || originalPrice <= 0) {
    return undefined;
  }
  return Math.round((1 - price / originalPrice) * 100);
}

/** Map a Supabase items row into the dashboard InventoryItem shape. */
export function rowToInventoryItem(row: ItemRow): InventoryItem {
  const price = toNumber(row.price);
  const cost = toNumber(row.cost);
  const discountActive = Boolean(row.discount_active);
  const originalPrice = discountActive
    ? toNumber(row.original_price, price)
    : undefined;
  const photo = row.primary_photo_url?.trim() || "";
  const primaryId = `${row.id}-img-0`;

  return {
    id: row.id,
    name: row.name,
    era: row.era,
    fabric: row.fabric,
    category: row.category,
    size: row.size,
    grade: row.grade as ConditionGrade,
    cycles: toNumber(row.cycles),
    price,
    image: photo,
    conditionNote: "",
    status: parseStatus(row.status),
    costPerCycle: cost,
    margin: price - cost,
    originalPrice,
    discountPercent: deriveDiscountPercent(price, originalPrice, discountActive),
    decision: decisionFromDb(row.decision),
    incidents: [],
    images: [{ id: primaryId, src: photo }],
    primaryImageId: primaryId,
  };
}

/** Persistable columns for an InventoryItem (incidents stay client-side for now). */
export function inventoryItemToWrite(item: InventoryItem): ItemWrite {
  const discountActive = item.originalPrice != null;
  return {
    id: item.id,
    name: item.name,
    era: item.era,
    fabric: item.fabric,
    category: item.category,
    size: item.size,
    grade: item.grade,
    cycles: item.cycles,
    status: item.status,
    price: item.price,
    cost: item.costPerCycle,
    original_price: discountActive ? (item.originalPrice ?? null) : null,
    discount_active: discountActive,
    decision: item.decision ? decisionToDb(item.decision) : null,
    primary_photo_url: item.image || item.images[0]?.src || "",
  };
}

export async function fetchItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select(
      "id, name, era, fabric, category, size, grade, cycles, status, price, cost, original_price, discount_active, decision, primary_photo_url, created_at",
    )
    .order("id", { ascending: true });

  if (error) throw error;
  return (data as ItemRow[] | null)?.map(rowToInventoryItem) ?? [];
}

export async function insertItem(item: InventoryItem): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from("items")
    .insert(inventoryItemToWrite(item))
    .select(
      "id, name, era, fabric, category, size, grade, cycles, status, price, cost, original_price, discount_active, decision, primary_photo_url, created_at",
    )
    .single();

  if (error) throw error;
  return rowToInventoryItem(data as ItemRow);
}

export async function updateItemRow(
  id: string,
  patch: Partial<ItemWrite>,
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from("items")
    .update(patch)
    .eq("id", id)
    .select(
      "id, name, era, fabric, category, size, grade, cycles, status, price, cost, original_price, discount_active, decision, primary_photo_url, created_at",
    )
    .single();

  if (error) throw error;
  return rowToInventoryItem(data as ItemRow);
}

export async function upsertItemFull(item: InventoryItem): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from("items")
    .upsert(inventoryItemToWrite(item), { onConflict: "id" })
    .select(
      "id, name, era, fabric, category, size, grade, cycles, status, price, cost, original_price, discount_active, decision, primary_photo_url, created_at",
    )
    .single();

  if (error) throw error;
  return rowToInventoryItem(data as ItemRow);
}
