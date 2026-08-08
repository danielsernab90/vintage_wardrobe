"use client";

import Link from "next/link";
import { AddToRotationButton } from "@/components/AddToRotationButton";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { GarmentImage } from "@/components/GarmentImage";
import { useInventory } from "@/context/InventoryContext";
import { formatSpecimenId } from "@/data/garments";

type Props = {
  id: string;
};

export function ItemDetailClient({ id }: Props) {
  const { getById } = useInventory();
  const garment = getById(id);

  if (!garment) {
    return (
      <section className="bg-paper px-6 py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          Specimen
        </p>
        <h1 className="mt-4 font-display text-3xl text-ink">Not found</h1>
        <p className="mt-3 font-sans text-sm text-ink/60">
          This piece isn&apos;t in the current session inventory.
        </p>
        <Link
          href="/#catalog"
          className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
        >
          Back to capsule
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-paper">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="relative aspect-[4/5] bg-parchment lg:col-span-7 lg:aspect-auto lg:min-h-[calc(100vh-4.5rem)]">
          <GarmentImage
            src={garment.image}
            alt={garment.name}
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-16 lg:col-span-5 lg:px-14 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
            {formatSpecimenId(garment.id)}
          </p>

          <h1 className="mt-4 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
            {garment.name}
          </h1>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/65">
            {garment.era} · {garment.fabric}
          </p>

          <div className="mt-8 flex items-start gap-4 border-t border-parchment pt-8">
            <ConditionGradeTag grade={garment.grade} size="lg" />
            <p className="font-sans text-sm leading-relaxed text-ink/80">
              <span className="text-ink">Grade {garment.grade}</span>
              {" — "}
              {garment.conditionNote}
            </p>
          </div>

          <p className="mt-8 font-display text-3xl text-bottle md:text-4xl">
            ${garment.price}
            <span className="ml-2 font-sans text-sm tracking-normal text-ink/45">
              /cycle
            </span>
          </p>

          <div className="mt-8 max-w-xs">
            <AddToRotationButton garmentId={garment.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
