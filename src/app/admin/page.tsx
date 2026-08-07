import type { Metadata } from "next";
import { InventoryDashboard } from "@/components/InventoryDashboard";

export const metadata: Metadata = {
  title: "Inventory Dashboard — Archive No.",
  description: "Operator inventory view of the Archive No. capsule.",
};

export default function AdminPage() {
  return <InventoryDashboard />;
}
