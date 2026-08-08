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
  image: string;
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-014/spec-014.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-021/spec-021.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-033/spec-033.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-042/spec-042.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-058/spec-058.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-067/spec-067.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-071/spec-071.jpg",
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
    image:
      "https://xqqoqaiihmoslkivvjap.supabase.co/storage/v1/object/public/garment-photos/SPEC-089/spec-089.jpg",
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
