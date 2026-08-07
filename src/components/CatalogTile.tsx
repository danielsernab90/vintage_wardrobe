"use client";

import Link from "next/link";
import type { Garment } from "@/data/garments";
import { ConditionGradeTag } from "./ConditionGradeTag";
import { GarmentImage } from "./GarmentImage";
import { AddToRotationButton } from "./AddToRotationButton";

type Props = {
  garment: Garment;
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
          <p className="mt-3 font-display text-xl text-bottle">
            ${garment.price}
            <span className="ml-1 font-sans text-[10px] tracking-normal text-ink/45">
              /cycle
            </span>
          </p>
        </Link>
        <div className="mt-4">
          <AddToRotationButton garmentId={garment.id} />
        </div>
      </div>
    </article>
  );
}
