import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-80";

  const styles =
    variant === "solid"
      ? "bg-ink text-paper"
      : "border border-ink text-ink bg-transparent";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
