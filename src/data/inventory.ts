import { garments, type Garment } from "./garments";

export type InventoryStatus = "In Rotation" | "Cleaning" | "Retired";

export type InventoryItem = Garment & {
  status: InventoryStatus;
};

/** Demo inventory overlay — status is mock-only, not on the garment catalog. */
const statusById: Record<string, InventoryStatus> = {
  "SPEC-014": "In Rotation",
  "SPEC-021": "Cleaning",
  "SPEC-033": "In Rotation",
  "SPEC-042": "In Rotation",
  "SPEC-058": "Cleaning",
  "SPEC-067": "In Rotation",
  "SPEC-071": "Retired",
  "SPEC-089": "In Rotation",
};

export const inventory: InventoryItem[] = garments.map((garment) => ({
  ...garment,
  status: statusById[garment.id] ?? "Cleaning",
}));

export function getInventoryStats(items: InventoryItem[] = inventory) {
  return {
    total: items.length,
    inRotation: items.filter((i) => i.status === "In Rotation").length,
    cleaning: items.filter((i) => i.status === "Cleaning").length,
    retired: items.filter((i) => i.status === "Retired").length,
  };
}
