import Link from "next/link";
import Image from "next/image";
import type { Garment } from "@/data/garments";
import { ConditionGradeTag } from "./ConditionGradeTag";

type Props = {
  garment: Garment;
  priority?: boolean;
};

export function CatalogTile({ garment, priority = false }: Props) {
  return (
    <Link
      href={`/item/${garment.id}`}
      className="group block bg-paper transition-opacity hover:opacity-80"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
        <Image
          src={`/garments/${garment.id}.svg`}
          alt={garment.name}
          fill
          unoptimized
          priority={priority}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <ConditionGradeTag
          grade={garment.grade}
          className="absolute top-0 right-0 z-10"
        />
      </div>

      <div className="border-t border-parchment px-4 py-4 md:px-5 md:py-5">
        <h3 className="font-display text-lg leading-snug text-ink md:text-xl">
          {garment.name}
        </h3>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/65">
          {garment.era} · {garment.fabric}
        </p>
        <p className="mt-3 font-display text-xl text-bottle">${garment.price}</p>
      </div>
    </Link>
  );
}
