import { supabase } from "@/lib/supabase";

export type SubscriptionTier = {
  id: string;
  name: string;
  price: number;
  itemsPerMonth: number;
  positioning: string;
  features: string[];
  isFeatured: boolean;
  displayOrder: number;
};

export type SubscriptionTierRow = {
  id: string;
  name: string;
  price: number | string;
  items_per_month: number;
  positioning: string;
  features: string[] | null;
  is_featured: boolean;
  display_order: number;
};

export type SubscriptionTierEditableFields = {
  name: string;
  price: number;
  itemsPerMonth: number;
  positioning: string;
  features: string[];
};

function rowToTier(row: SubscriptionTierRow): SubscriptionTier {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    itemsPerMonth: row.items_per_month,
    positioning: row.positioning,
    features: row.features ?? [],
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
  };
}

export function piecesLabel(itemsPerMonth: number): string {
  return `${itemsPerMonth} pieces`;
}

export function piecesPerMonthLabel(itemsPerMonth: number): string {
  return `${itemsPerMonth} pieces/month`;
}

export async function fetchSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const { data, error } = await supabase
    .from("subscription_tiers")
    .select(
      "id, name, price, items_per_month, positioning, features, is_featured, display_order",
    )
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data as SubscriptionTierRow[] | null)?.map(rowToTier) ?? [];
}

export async function updateSubscriptionTier(
  id: string,
  fields: SubscriptionTierEditableFields,
): Promise<SubscriptionTier> {
  const { data, error } = await supabase
    .from("subscription_tiers")
    .update({
      name: fields.name.trim(),
      price: fields.price,
      items_per_month: fields.itemsPerMonth,
      positioning: fields.positioning.trim(),
      features: fields.features.map((f) => f.trim()).filter(Boolean),
    })
    .eq("id", id)
    .select(
      "id, name, price, items_per_month, positioning, features, is_featured, display_order",
    )
    .single();

  if (error) throw error;
  return rowToTier(data as SubscriptionTierRow);
}
