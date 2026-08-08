type Props = {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Shows ~~$original~~ $discounted when a discount is active;
 * otherwise a single price. Discounted figure uses bottle green.
 */
export function CyclePrice({
  price,
  originalPrice,
  size = "md",
  className = "",
}: Props) {
  const discounted = originalPrice != null && originalPrice !== price;

  const currentClass =
    size === "lg"
      ? "font-display text-3xl md:text-4xl"
      : size === "sm"
        ? "font-mono text-sm"
        : "font-display text-xl";

  const strikeClass =
    size === "lg"
      ? "font-display text-2xl text-ink/35 line-through md:text-3xl"
      : size === "sm"
        ? "font-mono text-sm text-ink/35 line-through"
        : "font-display text-lg text-ink/35 line-through";

  const suffixClass =
    size === "lg"
      ? "ml-2 font-sans text-sm tracking-normal text-ink/45"
      : "ml-1 font-sans text-[10px] tracking-normal text-ink/45";

  if (discounted) {
    return (
      <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
        <span className={strikeClass}>${originalPrice}</span>
        <span className={`${currentClass} text-bottle`}>
          ${price}
          <span className={suffixClass}>/cycle</span>
        </span>
      </p>
    );
  }

  return (
    <p className={`${currentClass} text-bottle ${className}`}>
      ${price}
      <span className={suffixClass}>/cycle</span>
    </p>
  );
}
