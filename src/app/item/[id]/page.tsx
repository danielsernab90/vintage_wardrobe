import type { Metadata } from "next";
import { ItemDetailClient } from "@/components/ItemDetailClient";
import { garments, getGarmentById } from "@/data/garments";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return garments.map((garment) => ({ id: garment.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const garment = getGarmentById(id);
  if (!garment) return { title: "Specimen — Archive No." };
  return {
    title: `${garment.name} — Archive No.`,
    description: `${garment.era} ${garment.fabric}. Grade ${garment.grade}.`,
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ItemDetailClient id={id} />;
}
