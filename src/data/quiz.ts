import { garments, type Garment } from "./garments";

export type StyleAnswer = "workwear" | "tailored" | "casual";
export type SizeAnswer = "S" | "M" | "L" | "XL";
export type FitAnswer = "relaxed" | "fitted";

export type QuizAnswers = {
  style: StyleAnswer;
  size: SizeAnswer;
  fit: FitAnswer;
};

const styleCategories: Record<StyleAnswer, string[]> = {
  workwear: ["Outerwear"],
  tailored: ["Tailoring", "Knitwear"],
  casual: ["Shirts", "Outerwear"],
};

const sizeOrder = ["S", "M", "L", "XL"] as const;

function sizeDistance(a: string, b: string) {
  const ai = sizeOrder.indexOf(a as (typeof sizeOrder)[number]);
  const bi = sizeOrder.indexOf(b as (typeof sizeOrder)[number]);
  if (ai < 0 || bi < 0) return 3;
  return Math.abs(ai - bi);
}

function styleScore(garment: Garment, style: StyleAnswer) {
  const cats = styleCategories[style];
  if (!cats.includes(garment.category)) return 0;

  // Soft category nuance within the mapped set
  if (style === "workwear") {
    if (/field|military|surplus|twill|corduroy/i.test(garment.name + garment.fabric)) {
      return 3;
    }
    return 2;
  }
  if (style === "casual") {
    if (garment.category === "Shirts" || /denim/i.test(garment.fabric + garment.name)) {
      return 3;
    }
    return 1;
  }
  // tailored
  if (garment.category === "Tailoring") return 3;
  if (garment.category === "Knitwear") return 2;
  return 1;
}

function fitScore(garment: Garment, fit: FitAnswer) {
  if (fit === "fitted") {
    if (garment.category === "Tailoring" || garment.category === "Knitwear") return 2;
    if (garment.category === "Shirts") return 1;
    return 0;
  }
  // relaxed
  if (garment.category === "Outerwear" || garment.category === "Shirts") return 2;
  return 1;
}

/**
 * Mock personalization: rank garments by style category, size proximity, and fit preference.
 * Returns 3–4 items for the recommended capsule.
 */
export function recommendCapsule(answers: QuizAnswers): Garment[] {
  const scored = garments
    .map((garment) => {
      const style = styleScore(garment, answers.style);
      if (style === 0) return null;

      const size = 3 - sizeDistance(garment.size, answers.size);
      const fit = fitScore(garment, answers.fit);
      const score = style * 10 + size * 3 + fit;

      return { garment, score };
    })
    .filter((row): row is { garment: Garment; score: number } => row !== null)
    .sort((a, b) => b.score - a.score);

  const picks = scored.slice(0, 4).map((row) => row.garment);

  // Guarantee at least 3 results by filling from remaining garments if needed
  if (picks.length < 3) {
    for (const garment of garments) {
      if (picks.some((p) => p.id === garment.id)) continue;
      picks.push(garment);
      if (picks.length >= 3) break;
    }
  }

  return picks.slice(0, 4);
}
