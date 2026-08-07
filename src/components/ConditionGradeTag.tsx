import type { ConditionGrade as Grade } from "@/data/garments";

type Props = {
  grade: Grade;
  size?: "sm" | "lg";
  className?: string;
};

export function ConditionGradeTag({ grade, size = "sm", className = "" }: Props) {
  const sizeClasses =
    size === "lg"
      ? "min-w-[3rem] px-3 py-2.5 text-lg tracking-[0.2em]"
      : "px-2 py-1 text-[11px] tracking-[0.18em]";

  return (
    <span
      className={`inline-flex items-center justify-center bg-ink font-mono font-medium uppercase text-paper ${sizeClasses} ${className}`}
      aria-label={`Condition grade ${grade}`}
    >
      {grade}
    </span>
  );
}
