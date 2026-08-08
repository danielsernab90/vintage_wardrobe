import {
  type Subscriber,
  type SubscriberStatus,
  type SubscriberTier,
} from "@/data/subscribers";
import { supabase } from "@/lib/supabase";

export type SubscriberRow = {
  id: string;
  name: string;
  tier: string;
  join_date: string;
  items_out: number;
  status: string;
  address: string | null;
};

function rowToSubscriber(row: SubscriberRow): Subscriber {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier as SubscriberTier,
    joinDate: row.join_date,
    itemsOut: row.items_out,
    status: row.status as SubscriberStatus,
    address: row.address?.trim() || "",
  };
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase
    .from("subscribers")
    .select("id, name, tier, join_date, items_out, status, address")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data as SubscriberRow[] | null)?.map(rowToSubscriber) ?? [];
}

export async function fetchSubscriberAddress(
  subscriberId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("subscribers")
    .select("address")
    .eq("id", subscriberId)
    .single();

  if (error) throw error;
  return (data?.address as string | null)?.trim() || "";
}

export async function updateSubscriberAddress(
  subscriberId: string,
  address: string,
): Promise<string> {
  const next = address.trim();
  const { data, error } = await supabase
    .from("subscribers")
    .update({ address: next })
    .eq("id", subscriberId)
    .select("address")
    .single();

  if (error) throw error;
  return (data?.address as string | null)?.trim() || "";
}
