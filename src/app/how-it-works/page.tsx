import type { Metadata } from "next";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { JoinWaitlistButton } from "@/components/JoinWaitlistButton";

export const metadata: Metadata = {
  title: "How It Works — Archive No.",
  description:
    "Choose a rotation, wear for the month, swap or renew. How Archive No. membership works.",
};

const steps = [
  {
    number: "01",
    title: "Choose Your Rotation",
    body: "Pick a membership tier and select your first pieces from the current capsule.",
  },
  {
    number: "02",
    title: "We Deliver",
    body: "Pieces arrive cleaned, inspected, and graded, ready to wear.",
  },
  {
    number: "03",
    title: "Wear on Rotation",
    body: "Keep pieces for the month, mix into your existing wardrobe.",
  },
  {
    number: "04",
    title: "Swap or Renew",
    body: "Send back what you're done with, receive your next rotation, or extend a favorite piece.",
  },
] as const;

const grades = [
  {
    grade: "A" as const,
    description: "Light use, clean structure",
  },
  {
    grade: "B" as const,
    description:
      "Honest wear: fading, soft fabric, minor repairs — still wears well",
  },
  {
    grade: "C" as const,
    description: "Heavier character and visible patina",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <section className="bg-paper px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <header className="flex flex-col items-center text-center">
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
            How It Works
          </h1>
          <div className="mt-6 md:mt-8">
            <OrnamentDivider />
          </div>
        </header>

        <ol className="mt-14 w-full list-none space-y-0 md:mt-16">
          {steps.map((step) => (
            <li
              key={step.number}
              className="border-t border-parchment py-8 first:border-t-0 first:pt-0 md:py-10"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[3.5rem_1fr] sm:gap-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
                  {step.number}
                </p>
                <div>
                  <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
                    {step.title}
                  </h2>
                  <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-ink/75 md:text-[0.95rem]">
                    {step.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 w-full border-t border-parchment pt-12 md:mt-8 md:pt-16">
          <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
            Care &amp; Condition
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-ink/75 md:text-[0.95rem]">
            Every piece is graded A, B, or C based on wear.
          </p>
          <ul className="mt-8 max-w-2xl list-none space-y-6">
            {grades.map((item) => (
              <li key={item.grade} className="flex gap-3 sm:gap-4">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brass"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="inline-flex items-center gap-2.5 font-sans text-sm text-ink/55 md:text-[0.95rem]">
                    Grade
                    <ConditionGradeTag grade={item.grade} />
                  </span>
                  <span className="font-sans text-sm leading-relaxed text-ink/75 md:text-[0.95rem]">
                    — {item.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl font-sans text-sm leading-relaxed text-ink/75 md:text-[0.95rem]">
            Lower grades are priced lower, not hidden — condition is part of the
            specimen plate, not a flaw to obscure.
          </p>
        </div>

        <div className="mt-16 flex w-full flex-col items-center border-t border-parchment pt-14 text-center md:mt-20 md:pt-16">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-snug text-ink">
            Ready to build your rotation?
          </h2>
          <div className="mt-8 w-full max-w-xs">
            <JoinWaitlistButton />
          </div>
        </div>
      </div>
    </section>
  );
}
