"use client";

import Link from "next/link";
import { CyclePrice } from "@/components/CyclePrice";
import type { InventoryItem } from "@/data/inventory";
import { ConditionGradeTag } from "./ConditionGradeTag";
import { GarmentImage } from "./GarmentImage";
import { AddToRotationButton } from "./AddToRotationButton";
import { SaveForNextRotationButton } from "./SaveForNextRotationButton";

type Props = {
  garment: {
    id: string;
    name: string;
    era: string;
    fabric: string;
    grade: InventoryItem["grade"];
    price: number;
    image: string;
    originalPrice?: number;
  };
  priority?: boolean;
};

export function CatalogTile({ garment, priority = false }: Props) {
  return (
    <article className="group block bg-paper">
      <Link
        href={`/item/${garment.id}`}
        className="block transition-opacity hover:opacity-80"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
          <GarmentImage
            src={garment.image}
            alt={garment.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <ConditionGradeTag
            grade={garment.grade}
            className="absolute top-0 right-0 z-10"
          />
        </div>
      </Link>

      <div className="border-t border-parchment px-4 py-4 md:px-5 md:py-5">
        <Link href={`/item/${garment.id}`} className="block transition-opacity hover:opacity-80">
          <h3 className="font-display text-lg leading-snug text-ink md:text-xl">
            {garment.name}
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/65">
            {garment.era} · {garment.fabric}
          </p>
          <div className="mt-3">
            <CyclePrice
              price={garment.price}
              originalPrice={garment.originalPrice}
            />
          </div>
        </Link>
        <div className="mt-4 space-y-2">
          <AddToRotationButton garmentId={garment.id} />
          <SaveForNextRotationButton garmentId={garment.id} />
        </div>
      </div>
    </article>
  );
}
