export type ConditionGrade = "A" | "B" | "C" | "A-" | "A+" | "B-" | "B+" | "C-" | "C+";

export type Garment = {
  id: string;
  name: string;
  era: string;
  fabric: string;
  grade: ConditionGrade;
  cycles: number;
  price: number;
  size: string;
  category: string;
  conditionNote: string;
};

export const garments: Garment[] = [
  {
    id: "SPEC-014",
    name: "Field Jacket, Olive Twill",
    era: "1970s",
    fabric: "Cotton twill",
    grade: "A",
    cycles: 3,
    price: 34,
    size: "M",
    category: "Outerwear",
    conditionNote: "Light wear at collar, no visible flaws",
  },
  {
    id: "SPEC-021",
    name: "Wool Cardigan, Charcoal",
    era: "1980s",
    fabric: "Lambswool",
    grade: "B",
    cycles: 7,
    price: 22,
    size: "L",
    category: "Knitwear",
    conditionNote: "Minor pilling at cuffs, structurally sound",
  },
  {
    id: "SPEC-033",
    name: "Selvedge Denim Trucker",
    era: "1990s",
    fabric: "Denim",
    grade: "A",
    cycles: 2,
    price: 28,
    size: "M",
    category: "Outerwear",
    conditionNote: "Excellent vintage condition, subtle fading typical of era",
  },
  {
    id: "SPEC-042",
    name: "Chambray Work Shirt",
    era: "1960s",
    fabric: "Cotton chambray",
    grade: "B",
    cycles: 9,
    price: 18,
    size: "S",
    category: "Shirts",
    conditionNote: "Soft from wear, small fade spot on left sleeve",
  },
  {
    id: "SPEC-058",
    name: "Corduroy Trucker Jacket",
    era: "1970s",
    fabric: "Cotton corduroy",
    grade: "A",
    cycles: 4,
    price: 30,
    size: "L",
    category: "Outerwear",
    conditionNote: "Well-preserved corduroy, no thinning",
  },
  {
    id: "SPEC-067",
    name: "Herringbone Wool Blazer",
    era: "1960s",
    fabric: "Wool herringbone",
    grade: "A",
    cycles: 1,
    price: 42,
    size: "M",
    category: "Tailoring",
    conditionNote: "Sharp tailoring intact, one interior lining repair",
  },
  {
    id: "SPEC-071",
    name: "Military Surplus Field Coat",
    era: "1980s",
    fabric: "Cotton sateen",
    grade: "C",
    cycles: 12,
    price: 20,
    size: "XL",
    category: "Outerwear",
    conditionNote: "Heavy character wear, visible patina throughout — priced accordingly",
  },
  {
    id: "SPEC-089",
    name: "Flannel Buffalo Check Shirt",
    era: "1990s",
    fabric: "Cotton flannel",
    grade: "B",
    cycles: 6,
    price: 16,
    size: "M",
    category: "Shirts",
    conditionNote: "Soft flannel, light fading from washing",
  },
];

export function formatSpecimenId(id: string): string {
  const match = id.match(/^SPEC-(\d+)$/i);
  if (!match) return id;
  return `SPEC. ${match[1]}`;
}

export function getGarmentById(id: string): Garment | undefined {
  return garments.find((g) => g.id === id);
}
