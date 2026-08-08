import { supabase } from "@/lib/supabase";

export type WishlistItemRow = {
  id: number;
  subscriber_id: string;
  item_id: string;
  created_at: string;
};

export type WishlistItemWithDetails = WishlistItemRow & {
  name: string;
  price: number;
  image: string;
};

export async function fetchWishlistItemIds(
  subscriberId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("item_id")
    .eq("subscriber_id", subscriberId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.item_id as string);
}

export async function fetchWishlistWithDetails(
  subscriberId: string,
): Promise<WishlistItemWithDetails[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      "id, subscriber_id, item_id, created_at, items ( name, price, primary_photo_url )",
    )
    .eq("subscriber_id", subscriberId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const item = row.items as
      | { name: string; price: number | string; primary_photo_url: string }
      | null
      | Array<{ name: string; price: number | string; primary_photo_url: string }>;
    const details = Array.isArray(item) ? item[0] : item;
    const price =
      typeof details?.price === "number"
        ? details.price
        : Number(details?.price ?? 0);

    return {
      id: row.id as number,
      subscriber_id: row.subscriber_id as string,
      item_id: row.item_id as string,
      created_at: row.created_at as string,
      name: details?.name ?? row.item_id,
      price: Number.isFinite(price) ? price : 0,
      image: details?.primary_photo_url?.trim() || "",
    };
  });
}

export async function addWishlistItem(
  subscriberId: string,
  itemId: string,
): Promise<WishlistItemRow> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .upsert(
      { subscriber_id: subscriberId, item_id: itemId },
      { onConflict: "subscriber_id,item_id" },
    )
    .select("id, subscriber_id, item_id, created_at")
    .single();

  if (error) throw error;
  return data as WishlistItemRow;
}

export async function removeWishlistItem(
  subscriberId: string,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("subscriber_id", subscriberId)
    .eq("item_id", itemId);

  if (error) throw error;
}
