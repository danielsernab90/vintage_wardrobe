"use client";

import { CatalogTile } from "./CatalogTile";
import { OrnamentDivider } from "./OrnamentDivider";
import { useInventory } from "@/context/InventoryContext";

export function CapsuleCatalog() {
  const { items } = useInventory();

  return (
    <section id="catalog" className="bg-paper">
      <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center md:pb-10 md:pt-8">
        <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.01em] text-ink">
          This Month&apos;s Capsule
        </h2>
        <div className="mt-5">
          <OrnamentDivider />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((garment, index) => (
          <CatalogTile
            key={garment.id}
            garment={garment}
            priority={index < 3}
          />
        ))}
      </div>
    </section>
  );
}
