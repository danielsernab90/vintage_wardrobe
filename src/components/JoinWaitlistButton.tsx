"use client";

import {
  useWaitlist,
  type WaitlistTierContext,
} from "@/context/WaitlistContext";

type Props = {
  tier?: WaitlistTierContext;
  className?: string;
  variant?: "solid" | "outline";
  children?: React.ReactNode;
};

export function JoinWaitlistButton({
  tier,
  className = "",
  variant = "solid",
  children = "Join Waitlist",
}: Props) {
  const { openWaitlist } = useWaitlist();

  const base =
    "inline-flex w-full items-center justify-center px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-80";
  const styles =
    variant === "solid"
      ? "bg-ink text-paper"
      : "border border-ink text-ink bg-transparent";

  return (
    <button
      type="button"
      onClick={() => openWaitlist(tier)}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
