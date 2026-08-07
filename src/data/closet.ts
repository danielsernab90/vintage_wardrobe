import { getGarmentById, type Garment } from "./garments";

export type ActiveRental = {
  garment: Garment;
  daysUntilSwap: number;
};

export type RentalHistoryEntry = {
  garment: Garment;
  wornFrom: string;
  wornTo: string;
  status: "Returned";
};

export const mockMember = {
  name: "James Whitaker",
  plan: "Signature",
  memberSince: "March 2026",
} as const;

/** Personal impact stats for the mock member — demo only. */
export const memberImpact = {
  garmentsKeptFromLandfill: 4,
  textileWasteDivertedLbs: 12,
  cyclesCompleted: 3,
} as const;

const activeIds = [
  { id: "SPEC-014", daysUntilSwap: 12 },
  { id: "SPEC-033", daysUntilSwap: 12 },
  { id: "SPEC-067", daysUntilSwap: 12 },
] as const;

const historyEntries = [
  {
    id: "SPEC-021",
    wornFrom: "1 Jun 2026",
    wornTo: "28 Jun 2026",
  },
  {
    id: "SPEC-042",
    wornFrom: "1 Jun 2026",
    wornTo: "28 Jun 2026",
  },
  {
    id: "SPEC-058",
    wornFrom: "3 May 2026",
    wornTo: "31 May 2026",
  },
  {
    id: "SPEC-089",
    wornFrom: "3 May 2026",
    wornTo: "31 May 2026",
  },
  {
    id: "SPEC-071",
    wornFrom: "1 Apr 2026",
    wornTo: "30 Apr 2026",
  },
] as const;

function requireGarment(id: string): Garment {
  const garment = getGarmentById(id);
  if (!garment) {
    throw new Error(`Missing garment for closet mock: ${id}`);
  }
  return garment;
}

export const activeRentals: ActiveRental[] = activeIds.map(({ id, daysUntilSwap }) => ({
  garment: requireGarment(id),
  daysUntilSwap,
}));

export const rentalHistory: RentalHistoryEntry[] = historyEntries.map((entry) => ({
  garment: requireGarment(entry.id),
  wornFrom: entry.wornFrom,
  wornTo: entry.wornTo,
  status: "Returned",
}));
