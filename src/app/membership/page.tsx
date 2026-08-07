import type { Metadata } from "next";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { ButtonLink } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "Subscription — Archive No.",
  description: "Choose your vintage menswear rotation. Starter, Signature, and Archivist membership tiers.",
};

const tiers = [
  {
    name: "Starter",
    pieces: "3 pieces/month",
    price: 49,
    description: "Entry rotation, casual staples",
    features: ["Monthly swap", "Free shipping both ways", "Cancel anytime"],
    popular: false,
  },
  {
    name: "Signature",
    pieces: "5 pieces/month",
    price: 99,
    description: "Core offering — mix of outerwear and everyday pieces",
    features: [
      "Monthly swap",
      "Free shipping both ways",
      "Priority sizing support",
      "Cancel anytime",
    ],
    popular: true,
  },
  {
    name: "Archivist",
    pieces: "7 pieces/month",
    price: 159,
    description: "Priority access to Grade-A rare pieces",
    features: [
      "Monthly swap",
      "Free shipping both ways",
      "First access to new intake",
      "Dedicated concierge",
      "Cancel anytime",
    ],
    popular: false,
  },
] as const;

export default function MembershipPage() {
  return (
    <section className="bg-paper px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <header className="flex max-w-3xl flex-col items-center text-center">
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
            Choose Your Rotation
          </h1>
          <div className="mt-6 md:mt-8">
            <OrnamentDivider />
          </div>
        </header>

        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:mt-16 md:grid-cols-3 md:gap-0 lg:gap-10">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col px-6 py-8 md:px-8 md:py-10 ${
                tier.popular ? "border border-brass" : ""
              }`}
            >
              <div className="mb-5 min-h-[1.25rem]">
                {tier.popular ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">
                    Most Popular
                  </p>
                ) : null}
              </div>

              <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
                {tier.name}
              </h2>

              <p className="mt-4 font-display text-4xl font-medium leading-none text-bottle md:text-5xl">
                ${tier.price}
                <span className="ml-1 font-sans text-sm font-normal tracking-normal text-ink/55">
                  /mo
                </span>
              </p>

              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70">
                {tier.pieces}
              </p>

              <p className="mt-5 font-sans text-sm leading-relaxed text-ink/75">
                {tier.description}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-parchment pt-6">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="font-sans text-sm leading-snug text-ink/80"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ButtonLink href="/waitlist">Join Waitlist</ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
